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
  const [searchSource, setSearchSource] = useState<string>('');
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
          // Start with instant TMDB results for speed
          const tmdbResponse = await fetch(`/api/search-actors?query=${encodeURIComponent(searchTerm)}`);
          
          if (tmdbResponse.ok) {
            const tmdbData = await tmdbResponse.json() as SearchResponse;
            if (tmdbData.results && tmdbData.results.length > 0) {
              // Show TMDB results immediately
              setResults(tmdbData.results);
              setSearchSource('tmdb_instant');
              setIsLoading(false);
              
              // Then try to enhance with Wikidata in the background (no await)
              fetch(`/api/search-actors-wikidata?query=${encodeURIComponent(searchTerm)}`)
                .then(response => response.ok ? response.json() : null)
                .then((wikidataData: any) => {
                  if (wikidataData?.results && wikidataData.results.length > 0) {
                    // Only update if we still have the same search term and no new search started
                    if (query.trim() === searchTerm) {
                      setResults(wikidataData.results);
                      setSearchSource('wikidata_enhanced');
                    }
                  }
                })
                .catch(() => {
                  // Silently fail - we already have TMDB results
                });
              
              return;
            }
          }
          
          // If TMDB has no results, try Wikidata as primary source
          const wikidataResponse = await fetch(`/api/search-actors-wikidata?query=${encodeURIComponent(searchTerm)}`);
          
          if (wikidataResponse.ok) {
            const wikidataData = await wikidataResponse.json() as SearchResponse;
            setResults(wikidataData.results || []);
            setSearchSource('wikidata_primary');
          } else {
            setResults([]);
            setSearchSource('error');
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
          setSearchSource('error');
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
      setSearchSource('');
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
          className="w-full px-4 py-3 pl-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim().length >= 2 || results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {searchSource === 'tmdb_instant' && (
            <div className="px-4 py-2 text-xs text-blue-400 bg-blue-400/10 border-b border-white/10 flex items-center space-x-2">
              <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Instant TMDB results - enhancing with Wikidata...</span>
            </div>
          )}
          {searchSource === 'wikidata_enhanced' && (
            <div className="px-4 py-2 text-xs text-green-400 bg-green-400/10 border-b border-white/10">
              Enhanced results from Wikidata + TMDB
            </div>
          )}
          {searchSource === 'wikidata_primary' && (
            <div className="px-4 py-2 text-xs text-green-400 bg-green-400/10 border-b border-white/10">
              Enhanced Wikidata search results
            </div>
          )}
          {isLoading ? (
            // Skeleton loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="w-full p-3 flex items-center space-x-3 animate-pulse">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-600"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
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
                  className={`w-full p-3 flex items-center space-x-3 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                    isSelected 
                      ? 'opacity-50 cursor-not-allowed bg-green-400/20' 
                      : 'hover:bg-purple-400/20'
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                    {result.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${result.profile_path}`}
                        alt={result.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`font-medium truncate ${isSelected ? 'text-green-400' : 'text-white'}`}>
                      {result.name}
                      {isSelected && (
                        <span className="ml-2 text-xs">✓ Selected</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {displayDescription || `Popularity: ${result.popularity.toFixed(1)}`}
                    </div>
                  </div>
                </button>
              );
            })
          ) : query.trim() && !isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <div className="text-2xl mb-2">🔍</div>
              <div>No actors found for "{query}"</div>
              <div className="text-xs mt-1">Try searching with first and last name</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
