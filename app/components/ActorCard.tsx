import type { Actor } from '../types';

interface ActorCardProps {
  actor: Actor;
  isSelected: boolean;
  onClick: () => void;
}

export function ActorCard({ actor, isSelected, onClick }: ActorCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative group transition-all duration-150 ${
        isSelected 
          ? 'transform scale-105' 
          : 'hover:transform hover:scale-105'
      } cursor-pointer`}
    >
      {actor.profile_path ? (
        <div className={`relative w-full aspect-[2/3] overflow-hidden border-4 transition-all duration-150 ${
          isSelected 
            ? 'border-[#e63946] shadow-lg' 
            : 'border-black dark:border-white group-hover:border-[#1d3557] dark:group-hover:border-[#a8dadc]'
        }`}>
          {/* Placeholder background */}
          <div className="absolute inset-0 bg-[#e5e5e5] dark:bg-[#2b2b2b] animate-pulse"></div>
          <img
            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
            alt={actor.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          
          {/* Selected overlay */}
          {isSelected && (
            <div className="absolute inset-0 bg-[#ffb703] opacity-20"></div>
          )}
        </div>
      ) : (
        <div className={`w-full aspect-[2/3] bg-[#e5e5e5] dark:bg-[#2b2b2b] flex items-center justify-center border-4 transition-all duration-150 ${
          isSelected 
            ? 'border-[#e63946] shadow-lg'
            : 'border-black dark:border-white group-hover:border-[#1d3557] dark:group-hover:border-[#a8dadc]'
        }`}>
          <span className="text-black dark:text-white font-black text-2xl">
            {actor.name.charAt(0)}
          </span>
        </div>
      )}
      
      {/* Actor Name Tooltip */}
      <div className="absolute bottom-0 left-0 right-0 bg-black dark:bg-white text-white dark:text-black text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
        <span className="block truncate uppercase">{actor.name}</span>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#ffb703] border-2 border-black dark:border-white flex items-center justify-center">
          <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function ActorCardSkeleton() {
  return (
    <div className="relative">
      <div className="w-full aspect-[2/3] bg-[#e5e5e5] dark:bg-[#2b2b2b] animate-pulse border-4 border-black dark:border-white"></div>
    </div>
  );
}
