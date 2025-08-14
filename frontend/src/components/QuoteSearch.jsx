import { useState, useCallback, memo } from 'react';
import { Search, Loader, AlertTriangle, Quote, Filter, Sparkles, User, Tag, Brain, Copy, Heart, Check } from 'lucide-react';

const SearchResult = memo(({ result, index, searchType }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'copying', 'copied'

  const handleCopy = useCallback(async () => {
    try {
      setCopyStatus('copying');
      const textToCopy = `"${result.text}" - ${result.author}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('idle');
    }
  }, [result.text, result.author]);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);

  return (
    <div className="quote-card group animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="quote-text pl-6">
        {result.text}
      </div>
      
      <div className="quote-author">
        <User className="w-4 h-4 inline mr-2" />
        {result.author}
      </div>
      
      <div className="quote-tags">
        {result.tags.map((tag, idx) => (
          <span key={idx} className="tag">
            <Tag className="w-3 h-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>

      {/* Semantic similarity score */}
      {searchType === 'semantic' && result.similarity_score && (
        <div className="mt-4 flex items-center gap-2">
          <Brain className="w-4 h-4 text-secondary" />
          <span className="text-sm text-text-secondary">
            Similarity: <span className="font-medium text-secondary">{(result.similarity_score * 100).toFixed(1)}%</span>
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className={`btn-icon btn-ghost transition-colors group-hover:opacity-100 opacity-60 ${
              copyStatus === 'copied' 
                ? 'text-green-500 hover:text-green-600' 
                : 'text-text-tertiary hover:text-primary'
            }`}
            title={copyStatus === 'copied' ? 'Copied!' : 'Copy quote'}
          >
            {copyStatus === 'copied' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button 
            onClick={handleLike}
            className={`btn-icon btn-ghost transition-colors group-hover:opacity-100 opacity-60 ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-text-tertiary hover:text-red-500'
            }`}
            title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="text-xs text-text-tertiary opacity-60 group-hover:opacity-100 transition-opacity">
          Quote #{index + 1}
        </div>
      </div>
    </div>
  );
});

const SearchTypeIcon = memo(({ type }) => {
  const icons = {
    keyword: Search,
    author: User,
    tag: Tag,
    semantic: Brain
  };
  const Icon = icons[type] || Search;
  return <Icon className="w-4 h-4" />;
});

export default function QuoteSearch() {
  const [searchType, setSearchType] = useState('keyword');
  const [query, setQuery] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = new URL(`${apiUrl}/api/search`);
      url.searchParams.append('type', searchType);
      url.searchParams.append('query', query);
      url.searchParams.append('exact', exactMatch);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error connecting to the server');
      console.error('Error:', error);
    }

    setIsLoading(false);
  }, [query, searchType, exactMatch]);

  const searchTypeLabels = {
    keyword: 'Keyword Search',
    author: 'Author Search',
    tag: 'Tag Search',
    semantic: 'Semantic Search'
  };

  const searchTypeDescriptions = {
    keyword: 'Find quotes containing specific words or phrases',
    author: 'Search by quote author name',
    tag: 'Find quotes with specific tags or categories',
    semantic: 'LSI-powered search that understands meaning and context'
  };

  return (
    <div className="card p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 border border-secondary-500/30">
          <Search className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Quote Discovery</h2>
          <p className="text-text-tertiary text-sm">Find the perfect quote for any occasion</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <label htmlFor="query" className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Query
          </label>
          <div className="relative">
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter keywords, author name, or describe what you're looking for..."
              className="input-field text-lg py-4 pl-12 pr-4"
              required
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          </div>
        </div>

        {/* Search Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Search Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(searchTypeLabels).map(([type, label]) => (
              <label
                key={type}
                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  searchType === type
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg ring-2 ring-blue-500/30 ring-offset-2 ring-offset-background'
                    : 'border-border hover:border-border-hover bg-surface/30'
                }`}
              >
                <input
                  type="radio"
                  name="searchType"
                  value={type}
                  checked={searchType === type}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <SearchTypeIcon type={type} />
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-text-tertiary mt-1">
                      {searchTypeDescriptions[type]}
                    </div>
                  </div>
                </div>
                {searchType === type && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg ring-1 ring-blue-400"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Exact Match Option */}
        {(searchType === 'author' || searchType === 'tag') && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface/30 border border-border/50">
            <input
              type="checkbox"
              id="exactMatch"
              checked={exactMatch}
              onChange={(e) => setExactMatch(e.target.checked)}
              className="checkbox-field"
            />
            <label htmlFor="exactMatch" className="text-sm text-text-secondary flex-1">
              <span className="font-medium">Exact Match</span>
              <br />
              <span className="text-xs text-text-tertiary">
                Find only exact matches for {searchType === 'author' ? 'author names' : 'tags'}
              </span>
            </label>
          </div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn btn-primary w-full py-4 text-lg font-semibold"
        >
          {isLoading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Search Quotes</span>
            </>
          )}
        </button>
      </form>

      {/* Results Section */}
      <div className="mt-10">
        {error && (
          <div className="status-error animate-slide-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Search Error</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {results.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/30">
              <h3 className="text-xl font-semibold text-text-primary">
                Found {results.length} {results.length === 1 ? 'Quote' : 'Quotes'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <SearchTypeIcon type={searchType} />
                <span>{searchTypeLabels[searchType]}</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {results.map((result, index) => (
                <SearchResult key={index} result={result} index={index} searchType={searchType} />
              ))}
            </div>
          </div>
        )}

        {hasSearched && !isLoading && results.length === 0 && !error && (
          <div className="text-center py-16 animate-fade-in">
            <div className="relative inline-block">
              <Quote className="w-16 h-16 text-text-tertiary mx-auto mb-6 opacity-50" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No quotes found</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              We couldn't find any quotes matching "{query}". Try adjusting your search terms or using a different search type.
            </p>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <Quote className="w-16 h-16 text-text-tertiary mx-auto opacity-30" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-secondary animate-pulse" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Ready to discover quotes?</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Use the search above to find inspirational quotes by keyword, author, tag, or semantic meaning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
