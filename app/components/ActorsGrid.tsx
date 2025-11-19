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
      {/* Bauhaus Header with Selected Actors Info */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-1 bg-[#e63946]"></div>
          <h3 className="text-xl font-black text-black uppercase tracking-tight">
            {selectedActors.length === 0 
              ? "Choose from Popular Actors" 
              : "Actors who worked with your selection"}
          </h3>
          <div className="w-12 h-1 bg-[#1d3557]"></div>
        </div>
        
        {selectedActors.length > 0 && (
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="flex items-center space-x-2 text-sm text-black">
              <span className="bg-[#ffb703] text-black px-3 py-1 border-2 border-black text-xs font-black uppercase">
                {selectedActors.length} selected
              </span>
              <span className="hidden sm:inline font-bold">
                {selectedActors.map(a => a.name).join(", ")}
              </span>
            </div>
            {selectedActors.length > 1 && (
              <button
                onClick={onClearAll}
                className="text-xs text-[#e63946] hover:text-black font-bold uppercase underline transition-colors"
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
      
      {/* Load More Button - Bauhaus Style */}
      {!isLoadingActors && displayedActors.length > 0 && displayedActors.length < allActors.length && selectedActors.length === 0 && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            className="group px-8 py-4 bg-[#1d3557] hover:bg-[#e63946] text-white font-black uppercase border-4 border-black transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Load More Actors</span>
            <span className="text-[#ffb703] text-sm font-bold">
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
