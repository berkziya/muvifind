import { useState, useEffect } from 'react';
import type { Actor, Movie } from '../types';

export function useActors() {
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [allActors, setAllActors] = useState<Actor[]>([]);
  const [displayedActors, setDisplayedActors] = useState<Actor[]>([]);
  const [isLoadingActors, setIsLoadingActors] = useState(true);

  const loadPopularActors = async () => {
    try {
      setIsLoadingActors(true);
      
      // Load multiple pages of popular actors to get a large grid
      const pages = [1, 2, 3, 4, 5]; // Get 5 pages = ~100 actors
      const allPages = await Promise.all(
        pages.map(async (page) => {
          const response = await fetch(`/api/popular-actors?page=${page}`);
          const data = await response.json() as { results?: Actor[] };
          return data.results || [];
        })
      );
      
      const actors = allPages.flat();
      setAllActors(actors);
      setDisplayedActors(actors.slice(0, 50)); // Show first 50 initially
    } catch (error) {
      console.error("Error loading popular actors:", error);
    } finally {
      setIsLoadingActors(false);
    }
  };

  const loadActorRecommendations = async () => {
    if (selectedActors.length === 0) return;
    
    try {
      // Don't show loading state if we already have content to show
      if (displayedActors.length === 0) {
        setIsLoadingActors(true);
      }
      
      const actorIds = selectedActors.map(a => a.id).join(',');
      
      // PERFORMANCE: Use AbortController for faster cancellation of previous requests
      const controller = new AbortController();
      const response = await fetch(`/api/actor-recommendations?actors=${actorIds}`, {
        signal: controller.signal
      });
      const data = await response.json() as { results?: Actor[] };
      const recommendations = data.results || [];
      
      // Combine selected actors with recommendations, keeping selected actors at the top
      const combinedActors = [
        ...selectedActors,
        ...recommendations.filter(actor => !selectedActors.find(selected => selected.id === actor.id))
      ];
      
      // FIXED: Don't merge with previous actors when we have recommendations
      // Just use the new recommendations directly to avoid popular actors getting stuck
      setDisplayedActors(combinedActors.slice(0, 50));
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error loading actor recommendations:", error);
      }
    } finally {
      setIsLoadingActors(false);
    }
  };

  const selectActor = (actor: Actor) => {
    // Check if actor is already selected
    if (selectedActors.find(a => a.id === actor.id)) return;
    
    const newSelectedActors = [...selectedActors, actor];
    
    // FIXED: Just update selected actors, let the useEffect handle displayedActors
    setSelectedActors(newSelectedActors);
  };

  const removeActor = (actorId: number) => {
    const newSelectedActors = selectedActors.filter(a => a.id !== actorId);
    setSelectedActors(newSelectedActors);
  };

  const clearAllActors = () => {
    setSelectedActors([]);
  };

  const loadMoreActors = () => {
    setDisplayedActors(allActors.slice(0, displayedActors.length + 50));
  };

  // Load initial popular actors
  useEffect(() => {
    loadPopularActors();
  }, []);

  // Update displayed actors when selection changes
  useEffect(() => {
    if (selectedActors.length > 0) {
      loadActorRecommendations();
    } else {
      // FIXED: Clean transition back to popular actors without merging
      setDisplayedActors(allActors.slice(0, 50));
    }
  }, [selectedActors, allActors]);

  return {
    selectedActors,
    allActors,
    displayedActors,
    isLoadingActors,
    selectActor,
    removeActor,
    clearAllActors,
    loadMoreActors,
  };
}
