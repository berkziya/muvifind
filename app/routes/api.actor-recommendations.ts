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
  const actorIds = url.searchParams.get("actors");

  if (!actorIds) {
    return Response.json({ results: [] });
  }

  try {
    const TMDB_BEARER_TOKEN = await context.cloudflare.env.TMDB_BEARER_TOKEN.get();
    if (!TMDB_BEARER_TOKEN) {
      throw new Error("TMDB_BEARER_TOKEN not configured");
    }

    const actorIdArray = actorIds.split(',');

    // Get movies for each selected actor with more details in single requests
    const actorMovies = await Promise.all(
      actorIdArray.map(async (actorId: string) => {
        // OPTIMIZATION: Use append_to_response to get both movie_credits and details
        const response = await fetch(
          `https://api.themoviedb.org/3/person/${actorId}?append_to_response=movie_credits`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
            }
          }
        );

        if (!response.ok) {
          // OPTIMIZATION: Respect rate limiting
          if (response.status === 429) {
            console.warn(`Rate limited for actor ${actorId}, backing off`);
            // Could implement exponential backoff here
          } else {
            console.error(`TMDB API error for actor ${actorId}: ${response.status}`);
          }
          return [];
        }

        const data = await response.json() as { movie_credits?: { cast?: any[] } };
        return data.movie_credits?.cast?.map((movie: any) => movie.id) || [];
      })
    );

    // Get all unique movie IDs from selected actors
    const allMovieIds = [...new Set(actorMovies.flat())];

    // Use more movies to get better recommendations
    const sampleMovieIds = allMovieIds.slice(0, 20);

    // Get cast from these movies to find frequently co-appearing actors
    const castFrequency: Record<number, { count: number; actor: any }> = {};

    await Promise.all(
      sampleMovieIds.map(async (movieId: number) => {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/credits`,
            {
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
              }
            }
          );

          if (!response.ok) return;

          const data = await response.json() as { cast?: any[] };

          // Look at more cast members to get better recommendations
          data.cast?.slice(0, 20).forEach((person: any) => {
            // Skip if already selected
            if (actorIdArray.includes(person.id.toString())) return;

            // Include actors even without photos for now, we'll filter later
            if (castFrequency[person.id]) {
              castFrequency[person.id].count++;
            } else {
              castFrequency[person.id] = {
                count: 1,
                actor: {
                  id: person.id,
                  name: person.name,
                  profile_path: person.profile_path,
                  popularity: person.popularity || 0,
                  known_for: []
                }
              };
            }
          });
        } catch (error) {
          console.error(`Error fetching cast for movie ${movieId}:`, error);
        }
      })
    );

    // Sort actors by frequency of co-appearance and popularity
    const recommendedActors = Object.values(castFrequency)
      .filter(item => item.actor.profile_path) // Filter for photos here instead
      .sort((a, b) => {
        // First sort by co-appearance frequency
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Then by popularity
        return b.actor.popularity - a.actor.popularity;
      })
      .slice(0, 30) // Get more recommendations initially
      .map(item => item.actor);

    // If we don't have enough recommendations, fill with popular actors
    if (recommendedActors.length < 25) {
      // Get multiple pages of popular actors for better variety
      const popularPages = await Promise.all([1, 2, 3].map(async (page) => {
        const popularResponse = await fetch(
          `https://api.themoviedb.org/3/person/popular?page=${page}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
            }
          }
        );

        if (popularResponse.ok) {
          const popularData = await popularResponse.json() as { results?: any[] };
          return popularData.results?.filter((person: any) =>
            person.known_for_department === "Acting" &&
            person.profile_path &&
            !actorIdArray.includes(person.id.toString()) &&
            !recommendedActors.find(a => a.id === person.id)
          ).map((person: any) => ({
            id: person.id,
            name: person.name,
            profile_path: person.profile_path,
            popularity: person.popularity,
            known_for: person.known_for?.filter((work: any) => work.media_type === "movie").slice(0, 3) || []
          })) || [];
        }
        return [];
      }));

      const additionalActors = popularPages.flat().slice(0, 25 - recommendedActors.length);
      recommendedActors.push(...additionalActors);
    }

    return Response.json({ results: recommendedActors });
  } catch (error) {
    console.error("Error getting actor recommendations:", error);
    return Response.json({ results: [] }, { status: 500 });
  }
}
