import { useState, useEffect } from 'react';
import type { Movie, Actor } from '../types';

export function useMovies(selectedActors: Actor[]) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findMovies = async () => {
    if (selectedActors.length === 0) return;

    try {
      // OPTIMISTIC UPDATE: Show loading immediately for better perceived performance
      setIsLoading(true);
      
      const actorIds = selectedActors.map(a => a.id).join(',');
      const response = await fetch(`/api/find-movies?actors=${actorIds}`);
      const data = await response.json() as { results?: Movie[] };
      
      // Don't double-sort - the API already sorts by popularity and rating
      // Just use the results as they come from the API
      setMovies(data.results || []);
    } catch (error) {
      console.error("Error finding movies:", error);
      setMovies([]); // Clear movies on error
    } finally {
      setIsLoading(false);
    }
  };

  // Update movies when actors are selected
  useEffect(() => {
    if (selectedActors.length > 0) {
      findMovies();
    } else {
      // Clear movies immediately when no actors selected
      setIsLoading(false);
      setMovies([]);
    }
  }, [selectedActors]);

  return {
    movies,
    isLoading,
  };
}
