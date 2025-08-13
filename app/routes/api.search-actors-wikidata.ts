interface LoaderArgs {
  request: Request;
  context: {
    cloudflare: {
      env: Cloudflare.Env;
    };
  };
}

interface WikidataSearchResult {
  id: string;
  label: string;
  description?: string;
  aliases?: string[];
  birthYear?: number | null;
  searchVariation?: string;
  priority?: number;
}

interface WikidataEntityResult {
  id: string;
  labels: { [key: string]: { value: string } };
  descriptions: { [key: string]: { value: string } };
  claims: {
    P31?: Array<{ mainsnak: { datavalue: { value: { id: string } } } }>; // instance of
    P106?: Array<{ mainsnak: { datavalue: { value: { id: string } } } }>; // occupation
    P18?: Array<{ mainsnak: { datavalue: { value: string } } }>; // image
    P345?: Array<{ mainsnak: { datavalue: { value: string } } }>; // IMDb ID
    P1559?: Array<{ mainsnak: { datavalue: { value: string } } }>; // name in native language
    P569?: Array<{ mainsnak: { datavalue: { value: { time: string } } } }>; // date of birth
    P570?: Array<{ mainsnak: { datavalue: { value: { time: string } } } }>; // date of death
  };
  sitelinks?: {
    enwiki?: { title: string };
  };
}

interface TMDBSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for: any[];
  known_for_department?: string;
}

export async function loader({ request, context }: LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return Response.json({ results: [] });
  }

  const TMDB_BEARER_TOKEN = await context.cloudflare.env.TMDB_BEARER_TOKEN.get();
  if (!TMDB_BEARER_TOKEN) {
    throw new Error("TMDB_BEARER_TOKEN not configured");
  }

  try {

    // Generate search variations for better coverage
    const searchVariations = generateSearchVariations(query.trim());

    // Step 1: Batch search Wikidata for all variations
    const allWikidataResults = await batchSearchWikidataActors(searchVariations);

    // Step 2: For promising Wikidata results, find their TMDB profiles
    const enhancedResults = await Promise.all(
      allWikidataResults.slice(0, 12).map(async (wikidataActor: WikidataSearchResult) => {
        try {
          // Try to find this actor in TMDB
          const tmdbActor = await findTMDBActorByName(wikidataActor.label, TMDB_BEARER_TOKEN);

          if (tmdbActor) {
            return {
              id: tmdbActor.id,
              name: tmdbActor.name,
              profile_path: tmdbActor.profile_path,
              popularity: tmdbActor.popularity || 1,
              known_for: tmdbActor.known_for || [],
              wikidata_id: wikidataActor.id,
              description: wikidataActor.description,
              source: 'wikidata+tmdb',
              searchVariation: wikidataActor.searchVariation
            };
          }

          // If no TMDB match, return Wikidata-only result
          return {
            id: parseInt(wikidataActor.id.replace('Q', '')) || Math.random() * 1000000,
            name: wikidataActor.label,
            profile_path: null,
            popularity: 5, // Default popularity for Wikidata-only results
            known_for: [],
            wikidata_id: wikidataActor.id,
            description: wikidataActor.description,
            source: 'wikidata',
            searchVariation: wikidataActor.searchVariation
          };
        } catch (error) {
          console.error(`Error processing Wikidata actor ${wikidataActor.label}:`, error);
          return null;
        }
      })
    );

    // Filter out null results and deduplicate by name and TMDB ID
    const validResults = enhancedResults
      .filter((result: any): result is NonNullable<typeof result> => result !== null);

    // Deduplicate: prefer TMDB+Wikidata over Wikidata-only, and higher popularity
    const deduplicatedResults = new Map<string, any>();

    validResults.forEach((result: any) => {
      const key = result.name.toLowerCase().trim();
      const existing = deduplicatedResults.get(key);

      if (!existing) {
        deduplicatedResults.set(key, result);
      } else {
        // Keep the better result: prioritize multiple factors for relevance
        const shouldReplace = (
          // Prefer TMDB+Wikidata sources
          (result.source === 'wikidata+tmdb' && existing.source === 'wikidata') ||
          // Within same source type, prefer based on composite scoring
          (result.source === existing.source && calculateRelevanceScore(result, query) > calculateRelevanceScore(existing, query))
        );

        if (shouldReplace) {
          deduplicatedResults.set(key, result);
        }
      }
    });

    const finalResults = Array.from(deduplicatedResults.values())
      .sort((a, b) => {
        return calculateRelevanceScore(b, query) - calculateRelevanceScore(a, query);
      })
      .slice(0, 8);

    return Response.json({
      results: finalResults,
      source: 'wikidata'
    });

  } catch (error) {
    console.error("Error in Wikidata search:", error);

    // Fallback to pure TMDB search
    try {
      const tmdbResults = await fallbackTMDBSearch(query, TMDB_BEARER_TOKEN);
      return Response.json({
        results: tmdbResults,
        source: 'tmdb_fallback'
      });
    } catch (fallbackError) {
      console.error("Fallback TMDB search also failed:", fallbackError);
      return Response.json({ results: [] }, { status: 500 });
    }
  }
}

async function searchWikidataActors(query: string): Promise<WikidataSearchResult[]> {
  // Step 1: Search for entities
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=15&type=item`;

  const searchResponse = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'MuviFInd/1.0 (https://muvifind.app) Actor Search Bot',
      'Accept': 'application/json',
    }
  });

  if (!searchResponse.ok) {
    throw new Error(`Wikidata search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json() as { search: WikidataSearchResult[] };

  // Step 2: Filter for likely actors by checking entities
  const potentialActors = [];

  for (const item of searchData.search) {
    try {
      const entityData = await getWikidataEntity(item.id);
      if (isActorEntity(entityData)) {
        // Extract birth year for relevance scoring
        const birthYear = extractBirthYear(entityData);
        const enhancedDescription = enhanceDescription(item.description || entityData.descriptions?.en?.value, birthYear);

        potentialActors.push({
          id: item.id,
          label: item.label,
          description: enhancedDescription,
          birthYear: birthYear
        });
      }
    } catch (error) {
      console.error(`Error checking entity ${item.id}:`, error);
      // If we can't verify, include it if the description suggests it's an actor
      if (item.description?.toLowerCase().includes('actor') ||
        item.description?.toLowerCase().includes('actress')) {
        potentialActors.push({
          ...item,
          birthYear: null
        });
      }
    }
  }

  return potentialActors;
}

async function getWikidataEntity(entityId: string): Promise<WikidataEntityResult> {
  const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&format=json&languages=en`;

  const response = await fetch(entityUrl, {
    headers: {
      'User-Agent': 'MuviFInd/1.0 (https://muvifind.app) Actor Search Bot',
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Wikidata entity fetch failed: ${response.status}`);
  }

  const data = await response.json() as { entities: { [key: string]: WikidataEntityResult } };
  return data.entities[entityId];
}

function isActorEntity(entity: WikidataEntityResult): boolean {
  const claims = entity.claims;

  // Check if they're a human (P31 = Q5)
  const instanceOf = claims.P31?.some(claim =>
    claim.mainsnak.datavalue.value.id === 'Q5' // human
  ) ?? false;

  // Check if their occupation includes actor-related IDs
  const actorOccupations = [
    'Q33999', // actor
    'Q10800557', // film actor  
    'Q2259451', // stage actor
    'Q10798782', // television actor
    'Q948329', // actress (deprecated but still used)
  ];

  const isActor = claims.P106?.some(claim =>
    actorOccupations.includes(claim.mainsnak.datavalue.value.id)
  ) ?? false;

  return instanceOf && isActor;
}

async function findTMDBActorByName(actorName: string, tmdbToken: string): Promise<TMDBSearchResult | null> {
  const searchUrl = `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(actorName)}&page=1&include_adult=false`;

  const response = await fetch(searchUrl, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${tmdbToken}`,
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json() as { results: TMDBSearchResult[] };

  // Find exact or very close name match
  const exactMatch = data.results?.find(person =>
    person.name.toLowerCase() === actorName.toLowerCase() &&
    (person.known_for_department === "Acting" || !person.known_for_department)
  );

  if (exactMatch) return exactMatch;

  // Find close match (fuzzy matching)
  const closeMatch = data.results?.find(person => {
    const similarity = calculateSimilarity(person.name.toLowerCase(), actorName.toLowerCase());
    return similarity > 0.8 && (person.known_for_department === "Acting" || !person.known_for_department);
  });

  return closeMatch || null;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  return matrix[str2.length][str1.length];
}

async function fallbackTMDBSearch(query: string, tmdbToken: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(query)}&page=1&include_adult=false`,
    {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tmdbToken}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error(`TMDB fallback search failed: ${response.status}`);
  }

  const data = await response.json() as { results: TMDBSearchResult[] };

  return data.results?.filter((person: TMDBSearchResult) =>
    (person.known_for_department === "Acting" || !person.known_for_department) &&
    person.popularity > 1 &&
    person.profile_path !== null
  ).slice(0, 5) || [];
}

function extractBirthYear(entity: WikidataEntityResult): number | null {
  try {
    const birthDateClaim = entity.claims.P569?.[0];
    if (birthDateClaim?.mainsnak?.datavalue?.value?.time) {
      const timeString = birthDateClaim.mainsnak.datavalue.value.time;
      // Wikidata time format: "+1996-06-01T00:00:00Z"
      const match = timeString.match(/([+-]?\d{4})/);
      return match ? parseInt(match[1]) : null;
    }
  } catch (error) {
    console.error("Error extracting birth year:", error);
  }
  return null;
}

function enhanceDescription(description: string | undefined, birthYear: number | null): string {
  if (!description) return '';

  // If we have a birth year and the description doesn't mention it, add it
  if (birthYear && !description.includes(birthYear.toString())) {
    // For living actors (recent birth years), add born info
    if (birthYear > 1900) {
      return `${description} (born ${birthYear})`;
    }
  }

  return description;
}

function calculateRelevanceScore(result: any, query: string): number {
  let score = 0;

  // Exact name match gets massive boost
  if (result.name.toLowerCase() === query.toLowerCase()) {
    score += 100;
  }

  // Partial name match
  if (result.name.toLowerCase().includes(query.toLowerCase())) {
    score += 50;
  }

  // Source bonus: TMDB+Wikidata is better than Wikidata only
  if (result.source === 'wikidata+tmdb') {
    score += 30;
  }

  // Normalize TMDB popularity (it's very inconsistent)
  // Most actors have 0.1-20, mega stars have 20-100+
  const normalizedPopularity = Math.min(result.popularity || 0, 50) / 2; // Cap at 25 points
  score += normalizedPopularity;

  // Birth year relevance: favor more recent actors for ambiguous cases
  // But don't penalize classic actors too much
  if (result.birthYear) {
    if (result.birthYear >= 1980) {
      score += 15; // Modern actors
    } else if (result.birthYear >= 1960) {
      score += 10; // Established actors
    } else if (result.birthYear >= 1940) {
      score += 5; // Classic actors
    }
    // Pre-1940 actors get no penalty, they're often legendary
  }

  // Photo availability bonus (indicates TMDB has good data)
  if (result.profile_path) {
    score += 10;
  }

  // Known work bonus
  if (result.known_for && result.known_for.length > 0) {
    score += Math.min(result.known_for.length * 2, 10); // Max 10 points
  }

  return score;
}

function generateSearchVariations(query: string): string[] {
  const variations = new Set<string>();
  const trimmed = query.trim();

  // Add the main query
  variations.add(trimmed);

  // Handle common variations
  if (trimmed.length > 2) {
    // Add with trailing space (some APIs handle this differently)
    variations.add(trimmed + ' ');

    // If it contains spaces, try variations
    if (trimmed.includes(' ')) {
      const parts = trimmed.split(' ').filter(part => part.length > 0);

      if (parts.length === 2) {
        // "Tom Holland" -> ["Tom Holland", "Holland Tom", "Tom", "Holland"]
        variations.add(`${parts[1]} ${parts[0]}`); // Reverse name order
        variations.add(parts[0]); // First name only
        variations.add(parts[1]); // Last name only
      }

      // Try without middle parts for longer names
      if (parts.length > 2) {
        variations.add(`${parts[0]} ${parts[parts.length - 1]}`); // First + Last only
      }
    }

    // Try with different capitalizations
    variations.add(trimmed.toLowerCase());
    variations.add(trimmed.toUpperCase());

    // Try with common nickname expansions (simple ones)
    const commonExpansions: Record<string, string[]> = {
      'tom': ['thomas'],
      'bob': ['robert'],
      'bill': ['william'],
      'mike': ['michael'],
      'dave': ['david'],
      'chris': ['christopher'],
      'matt': ['matthew'],
      'dan': ['daniel'],
      'sam': ['samuel'],
      'alex': ['alexander', 'alexandra'],
    };

    const lowerQuery = trimmed.toLowerCase();
    for (const [nick, fulls] of Object.entries(commonExpansions)) {
      if (lowerQuery.includes(nick)) {
        fulls.forEach(full => {
          variations.add(trimmed.replace(new RegExp(nick, 'gi'), full));
        });
      }
    }
  }

  return Array.from(variations).slice(0, 5); // Limit to 5 variations to avoid too many requests
}

async function batchSearchWikidataActors(searchQueries: string[]): Promise<WikidataSearchResult[]> {
  const allResults = new Map<string, WikidataSearchResult>();

  // Search each variation in parallel
  const searchPromises = searchQueries.map(async (query, index) => {
    try {
      const results = await searchWikidataActors(query);
      return results.map(result => ({
        ...result,
        searchVariation: query,
        priority: index // Earlier variations get higher priority
      }));
    } catch (error) {
      console.error(`Error searching for variation "${query}":`, error);
      return [];
    }
  });

  const allVariationResults = await Promise.all(searchPromises);

  // Merge results, avoiding duplicates by Wikidata ID
  allVariationResults.forEach((results, variationIndex) => {
    results.forEach(result => {
      const existing = allResults.get(result.id);
      if (!existing || (result.priority || 0) < (existing.priority || 0)) {
        allResults.set(result.id, result);
      }
    });
  });

  // Sort by priority (search variation order) and then by relevance
  return Array.from(allResults.values())
    .sort((a, b) => {
      const aPriority = a.priority || 0;
      const bPriority = b.priority || 0;
      if (aPriority !== bPriority) return aPriority - bPriority;

      // If same priority, prefer results that match more closely
      return (b.label.length || 0) - (a.label.length || 0);
    })
    .slice(0, 15); // Return top 15 unique results
}
