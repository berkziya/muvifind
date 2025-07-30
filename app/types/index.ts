export interface Actor {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for: Movie[];
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
  // NEW: Metadata about actor matches
  matching_actors?: number;
  total_selected_actors?: number;
  is_perfect_match?: boolean;
}

export interface MetaArgs {}

export interface LoaderArgs {
  context: {
    cloudflare: {
      env: Cloudflare.Env;
    };
  };
}

export interface ComponentProps {
  loaderData: {
    message: string;
  };
}
