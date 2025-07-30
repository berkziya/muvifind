interface LoaderArgs {
  request: Request;
  context: {
    cloudflare: {
      env: Cloudflare.Env;
    };
  };
}

export async function loader({ request, context }: LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");

  if (!query) {
    return Response.json({ results: [] });
  }

  try {
    const TMDB_BEARER_TOKEN = context.cloudflare.env.TMDB_BEARER_TOKEN;
    if (!TMDB_BEARER_TOKEN) {
      throw new Error("TMDB_BEARER_TOKEN not configured");
    }

    // Enhanced search with better parameters
    const searchUrl = new URL("https://api.themoviedb.org/3/search/person");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("page", "1");
    searchUrl.searchParams.set("include_adult", "false"); // Filter out adult content
    
    const response = await fetch(searchUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json() as { results?: any[] };
    
    // Enhanced filtering and sorting
    const actors = data.results?.filter((person: any) => {
      // Must be known for acting
      const isActor = person.known_for_department === "Acting";
      
      // Must have some popularity (filter out obscure entries)
      const hasPopularity = person.popularity && person.popularity > 1;
      
      // Must have known works in movies
      const hasMovieWork = person.known_for?.some((work: any) => 
        work.media_type === "movie" && work.popularity > 5
      );
      
      // Must have a profile picture (improves visual experience)
      const hasPhoto = person.profile_path !== null;
      
      return isActor && hasPopularity && (hasMovieWork || person.popularity > 10) && hasPhoto;
    })
    .sort((a: any, b: any) => {
      // Sort by popularity, but boost exact name matches
      const aExactMatch = a.name.toLowerCase() === query.toLowerCase() ? 100 : 0;
      const bExactMatch = b.name.toLowerCase() === query.toLowerCase() ? 100 : 0;
      
      const aScore = (a.popularity || 0) + aExactMatch;
      const bScore = (b.popularity || 0) + bExactMatch;
      
      return bScore - aScore;
    })
    .slice(0, 8) || []; // Reduced to 8 for better quality

    // If we get very few results, try a more lenient search
    if (actors.length < 3 && query.length > 2) {
      const lenientActors = data.results?.filter((person: any) => {
        return person.known_for_department === "Acting" && 
               person.popularity > 0.5 &&
               person.profile_path !== null;
      })
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 5) || [];
      
      return Response.json({ 
        results: lenientActors,
        fallback: true // Indicate this is a fallback search
      });
    }

    return Response.json({ results: actors });
  } catch (error) {
    console.error("Error searching actors:", error);
    return Response.json({ results: [] }, { status: 500 });
  }
}
