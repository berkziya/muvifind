import type { Actor } from '../types';

interface ActorCardProps {
  actor: Actor;
  isSelected: boolean;
  onClick: () => void;
}

export function ActorCard({ actor, isSelected, onClick }: ActorCardProps) {
  // CURRENT: Option 1 - Blue glow with subtle overlay
  // To try other options, replace the className and styling below
  
  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-150 ${
        isSelected 
          // ? 'transform scale-105' // Option 1: Scale up
          ? 'transform scale-105 rotate-1' // Option 2: Scale + slight rotation
          // ? '' // Option 3: No transform, just visual changes
          : 'hover:transform hover:scale-105'
      } cursor-pointer`}
    >
      {actor.profile_path ? (
        <div className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all duration-150 ${
          isSelected 
            // ? 'border-blue-400 shadow-lg shadow-blue-400/50' // Option 1: Blue glow
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/60' // Option 2: Gold glow
            // ? 'border-purple-500 shadow-xl shadow-purple-500/40' // Option 3: Purple glow
            // ? 'border-gradient-to-r from-pink-500 to-violet-500' // Option 4: Gradient border
            : 'border-white/20 group-hover:border-purple-400'
        }`}>
          {/* Placeholder background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-700 animate-pulse"></div>
          <img
            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
            alt={actor.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          
          {/* Selected overlay options */}
          {isSelected && (
            // <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 to-transparent"></div> // Option 2: Gold gradient
            // <div className="absolute inset-0 bg-purple-500/15 backdrop-blur-[1px]"></div> // Option 3: Purple overlay
            // <div className="absolute inset-0 ring-4 ring-inset ring-white/50"></div> // Option 4: Inner white ring
          )}
        </div>
      ) : (
        <div className={`w-full aspect-[2/3] rounded-lg bg-gray-600 flex items-center justify-center border-2 transition-all duration-150 ${
          isSelected 
            // ? 'border-blue-400 shadow-lg shadow-blue-400/50'
            ? 'border-yellow-400 shadow-lg shadow-yellow-400/60'
            : 'border-white/20 group-hover:border-purple-400'
        }`}>
          <span className="text-gray-300 font-bold text-lg">
            {actor.name.charAt(0)}
          </span>
        </div>
      )}
      
      {/* Actor Name Tooltip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="block truncate">{actor.name}</span>
      </div>
      
      {/* Selected indicator options */}
      {isSelected && (
        // <div className="absolute top-2 right-2">
        //   <div className="bg-blue-500 rounded-full p-1 shadow-lg">
        //     <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        //       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        //     </svg>
        //   </div>
        // </div>
        
        // Alternative indicators:
        <div className="absolute top-2 right-2 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center">
          <span className="text-black text-xs font-bold">✓</span>
        </div> // Option 2: Gold circle with checkmark
        
        // <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
        //   <span className="text-white text-xs">★</span>
        // </div> // Option 3: Star badge
        
        // <div className="absolute top-1 right-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full p-1">
        //   <div className="bg-white rounded-full p-0.5">
        //     <svg className="w-2 h-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        //       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        //     </svg>
        //   </div>
        // </div> // Option 4: Gradient badge
      )}
    </button>
  );
}

export function ActorCardSkeleton() {
  return (
    <div className="relative">
      <div className="w-full aspect-[2/3] rounded-lg bg-gradient-to-br from-gray-600 via-gray-650 to-gray-700 animate-pulse border-2 border-white/20"></div>
    </div>
  );
}
