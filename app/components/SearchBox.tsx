import { useState, useEffect, useRef, useMemo } from 'react';
import type { Actor } from '../types';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: number;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

interface SearchBoxProps {
  onSelectActor: (actor: Actor) => void;
  selectedActors: Actor[];
}

interface SearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  popularity: number;
  known_for: any[];
  known_for_department?: string;
  description?: string;
  source?: string;
}

interface SearchResponse {
  results: SearchResult[];
  source?: string;
}

export function SearchBox({ onSelectActor, selectedActors }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function with debounce
  const searchActors = useMemo(
    () =>
      debounce(async (searchTerm: string) => {
        if (searchTerm.length < 2) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        
        try {
          const tmdbResponse = await fetch(`/api/search-actors?query=${encodeURIComponent(searchTerm)}`);
          
          if (tmdbResponse.ok) {
            const tmdbData = await tmdbResponse.json() as SearchResponse;
            setResults(tmdbData.results || []);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        }
        
        setIsLoading(false);
      }, 250),
    []
  );

  // Trigger search when query changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsOpen(true);
      searchActors(query.trim());
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, searchActors]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectActor = (result: SearchResult) => {
    const actor: Actor = {
      id: result.id,
      name: result.name,
      profile_path: result.profile_path,
      popularity: result.popularity,
      known_for: result.known_for || []
    };
    
    onSelectActor(actor);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const isActorSelected = (actorId: number) => {
    return selectedActors.some(actor => actor.id === actorId);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto mb-6">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for actors (e.g., Tom Hanks, Meryl Streep)..."
          className="w-full px-4 py-3 pl-10 bg-[#e5e5e5] dark:bg-[#2b2b2b] border-2 border-black dark:border-white text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:border-[#e63946] transition-all duration-200 font-medium"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim().length >= 2 || results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border-2 border-black dark:border-white shadow-2xl z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-full p-3 flex items-center space-x-3 animate-pulse border-b border-gray-300 dark:border-gray-700 last:border-b-0">
                <div className="flex-shrink-0 w-12 h-12 bg-[#e5e5e5] dark:bg-[#2b2b2b]"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#e5e5e5] dark:bg-[#2b2b2b] w-3/4"></div>
                  <div className="h-3 bg-[#e5e5e5] dark:bg-[#2b2b2b] w-1/2"></div>
                </div>
              </div>
            ))
          ) : results.length > 0 ? (
            results.map((result) => {
              const isSelected = isActorSelected(result.id);
              const knownForText = result.known_for?.slice(0, 2).map((work: any) => work.title || work.name).join(", ");
              const displayDescription = result.description || knownForText;
              
              return (
                <button
                  key={result.id}
                  onClick={() => handleSelectActor(result)}
                  disabled={isSelected}
                  className={`w-full p-3 flex items-center space-x-3 transition-colors duration-150 border-b border-gray-300 dark:border-gray-700 last:border-b-0 ${
                    isSelected 
                      ? 'opacity-50 cursor-not-allowed bg-[#ffb703]' 
                      : 'hover:bg-[#e5e5e5] dark:hover:bg-[#2b2b2b]'
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-[#1d3557] border-2 border-black dark:border-white">
                    {result.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${result.profile_path}`}
                        alt={result.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-bold truncate ${isSelected ? 'text-[#e63946]' : 'text-black dark:text-white'}`}>
                      {result.name}
                      {isSelected && (
                        <span className="ml-2 text-xs flex items-center inline-flex">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {displayDescription || `Popularity: ${result.popularity.toFixed(1)}`}
                    </div>
                  </div>
                </button>
              );
            })
          ) : query.trim() && !isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-black dark:text-white">
              <div className="w-12 h-12 mx-auto mb-2 text-[#1d3557] dark:text-[#a8dadc]">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="font-bold">No actors found for "{query}"</div>
              <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">Try searching with first and last name</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
