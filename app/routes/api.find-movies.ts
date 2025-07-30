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
    const TMDB_BEARER_TOKEN = context.cloudflare.env.TMDB_BEARER_TOKEN;
    if (!TMDB_BEARER_TOKEN) {
      throw new Error("TMDB_BEARER_TOKEN not configured");
    }

    const actorIdArray = actorIds.split(',');
    
    // Find movies for each actor and then find intersection
    const movieSets = await Promise.all(
      actorIdArray.map(async (actorId: string) => {
        // OPTIMIZATION: Use append_to_response to get more data efficiently
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
          console.error(`TMDB API error for actor ${actorId}: ${response.status}`);
          return [];
        }

        const data = await response.json() as { movie_credits?: { cast?: any[] } };
        return data.movie_credits?.cast?.map((movie: any) => movie.id) || [];
      })
    );

    const { movieIds, movieResults } = await (async () => {
      // Find intersection of all movie sets (perfect matches)
      let perfectMatchIds: number[] = movieSets[0] || [];
      for (let i = 1; i < movieSets.length; i++) {
        perfectMatchIds = perfectMatchIds.filter((id: number) => movieSets[i].includes(id));
      }

      // Find partial matches based on number of selected actors
      let movieResults: { movieId: number; actorCount: number; actors: string[] }[] = [];
      
      if (actorIdArray.length > 1) {
        // Create a map of movies to actors who appear in them
        const movieActorMap: Record<number, string[]> = {};
        
        movieSets.forEach((movies, actorIndex) => {
          movies.forEach((movieId: number) => {
            if (!movieActorMap[movieId]) {
              movieActorMap[movieId] = [];
            }
            movieActorMap[movieId].push(actorIdArray[actorIndex]);
          });
        });
        
        // For 2 actors: only show perfect matches
        // For 3+ actors: show partial matches (2+) + perfect matches
        const minActorCount = actorIdArray.length === 2 ? actorIdArray.length : 2;
        
        movieResults = Object.entries(movieActorMap)
          .map(([movieId, actors]) => ({
            movieId: parseInt(movieId),
            actorCount: actors.length,
            actors: actors
          }))
          // Only include movies with minimum required matching actors
          .filter(result => result.actorCount >= minActorCount)
          // Sort by number of matching actors (most matches first)
          .sort((a, b) => b.actorCount - a.actorCount)
          .slice(0, 30); // Increased limit for more variety
          
        const allMovieIds = movieResults.map(result => result.movieId);
        
        // Use combined list (perfect + partial matches)
        return { movieIds: allMovieIds, movieResults };
      } else {
        // Single actor: just their movies
        return { movieIds: perfectMatchIds.slice(0, 20), movieResults: [] };
      }
    })();

    // Get detailed movie information
    const movieDetails = await Promise.all(
      movieIds.slice(0, 20).map(async (movieId: number) => {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
            }
          }
        );

        if (!response.ok) {
          return null;
        }

        const movieData = await response.json() as any;
        
        // Find which of our selected actors appear in this movie
        const movieResult = movieResults.find(r => r.movieId === movieId);
        const matchingActorCount = movieResult ? movieResult.actorCount : actorIdArray.length;
        
        return {
          ...movieData,
          popularity: movieData.popularity || 0,
          // NEW: Add metadata about actor matches
          matching_actors: matchingActorCount,
          total_selected_actors: actorIdArray.length,
          is_perfect_match: matchingActorCount === actorIdArray.length
        };
      })
    );

    // Filter out null results and sort by match quality, then popularity
    const validMovies = movieDetails
      .filter((movie: any) => movie !== null)
      .sort((a: any, b: any) => {
        // First: Perfect matches come before partial matches
        if (b.is_perfect_match !== a.is_perfect_match) {
          return b.is_perfect_match ? 1 : -1;
        }
        // Second: More matching actors beats fewer
        if (b.matching_actors !== a.matching_actors) {
          return b.matching_actors - a.matching_actors;
        }
        // Third: Sort by popularity
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }
        // Fourth: Sort by vote average
        return (b.vote_average || 0) - (a.vote_average || 0);
      });

    return Response.json({ results: validMovies });
  } catch (error) {
    console.error("Error finding movies:", error);
    return Response.json({ results: [] }, { status: 500 });
  }
}
