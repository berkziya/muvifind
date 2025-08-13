interface LoaderArgs {
  request: Request;
  context: {
    cloudflare: {
      env: Cloudflare.Env;
    };
  };
}

export async function loader({ request, context }: LoaderArgs) {
  try {
    const TMDB_BEARER_TOKEN = await context.cloudflare.env.TMDB_BEARER_TOKEN.get();
    if (!TMDB_BEARER_TOKEN) {
      throw new Error("TMDB_BEARER_TOKEN not configured");
    }

    // Get page parameter from URL, default to 1
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';

    const response = await fetch(
      `https://api.themoviedb.org/3/person/popular?page=${page}`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`,
        }
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json() as { results?: any[] };

    // Filter to only include actors and add popularity score
    const actors = data.results?.filter((person: any) =>
      person.known_for_department === "Acting" &&
      person.profile_path &&
      person.known_for?.some((work: any) => work.media_type === "movie")
    ).map((person: any) => ({
      id: person.id,
      name: person.name,
      profile_path: person.profile_path,
      popularity: person.popularity,
      known_for: person.known_for?.filter((work: any) => work.media_type === "movie").slice(0, 3) || []
    })) || [];

    // Sort by popularity
    const popularActors = actors
      .sort((a: any, b: any) => b.popularity - a.popularity);

    return Response.json({ results: popularActors }, {
      headers: {
        // OPTIMIZATION: Cache popular actors for 1 hour (they don't change often)
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      }
    });
  } catch (error) {
    console.error("Error fetching popular actors:", error);
    return Response.json({ results: [] }, { status: 500 });
  }
}
