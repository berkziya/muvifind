import { ActorCard, ActorCardSkeleton } from './ActorCard';
import type { Actor } from '../types';

interface ActorsGridProps {
  displayedActors: Actor[];
  selectedActors: Actor[];
  isLoadingActors: boolean;
  allActors: Actor[];
  onSelectActor: (actor: Actor) => void;
  onRemoveActor: (actorId: number) => void;
  onClearAll: () => void;
  onLoadMore: () => void;
}

export function ActorsGrid({
  displayedActors,
  selectedActors,
  isLoadingActors,
  allActors,
  onSelectActor,
  onRemoveActor,
  onClearAll,
  onLoadMore
}: ActorsGridProps) {
  return (
    <div className="mb-6">
      {/* Enhanced Header with Selected Actors Info */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {selectedActors.length === 0 
            ? "Choose from Popular Actors" 
            : "Actors who worked with your selection"}
        </h3>
        
        {selectedActors.length > 0 && (
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                {selectedActors.length} selected
              </span>
              <span className="hidden sm:inline">
                {selectedActors.map(a => a.name).join(", ")}
              </span>
            </div>
            {selectedActors.length > 1 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 underline transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {/* Show loaded actors */}
        {displayedActors.map((actor) => {
          const isSelected = selectedActors.find(a => a.id === actor.id);
          return (
            <ActorCard
              key={actor.id}
              actor={actor}
              isSelected={!!isSelected}
              onClick={() => isSelected ? onRemoveActor(actor.id) : onSelectActor(actor)}
            />
          );
        })}
        
        {/* Show skeletons for remaining slots - only when initially loading or when we have very few actors */}
        {(isLoadingActors && displayedActors.length < 10) && Array.from({ 
          length: Math.max(0, 50 - displayedActors.length) 
        }, (_, i) => (
          <ActorCardSkeleton key={`actor-skeleton-${i}`} />
        ))}
      </div>
      
      {/* Load More Button - Enhanced */}
      {!isLoadingActors && displayedActors.length > 0 && displayedActors.length < allActors.length && selectedActors.length === 0 && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Load More Actors</span>
            <span className="text-purple-200 text-sm">
              ({allActors.length - displayedActors.length} remaining)
            </span>
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-y-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
