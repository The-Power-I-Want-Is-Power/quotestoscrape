import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertTriangle, Loader, TrendingUp, Users, Hash, Crown, Award } from 'lucide-react';

const AnimatedStatCard = ({ label, value, icon: Icon, delay = 0, color = 'primary' }) => (
  <div 
    className="stat-card animate-scale-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-5 h-5 text-${color}`} />
      <div className={`w-2 h-2 bg-${color} rounded-full animate-pulse`}></div>
    </div>
    <div className={`stat-value text-${color}`}>{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const TopAuthorItem = ({ author, count, rank, isTop = false }) => (
  <div className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
    isTop 
      ? 'bg-gradient-to-r from-accent-emerald/10 to-primary/10 border border-accent-emerald/20' 
      : 'bg-surface/30 hover:bg-surface/50 border border-border/30'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
        isTop 
          ? 'bg-accent-emerald text-white' 
          : 'bg-surface text-text-secondary'
      }`}>
        {rank === 1 ? <Crown className="w-4 h-4" /> : rank}
      </div>
      <div>
        <p className="font-medium text-text-primary text-sm">{author}</p>
        <p className="text-xs text-text-tertiary">{count} quotes</p>
      </div>
    </div>
    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
      isTop 
        ? 'bg-accent-emerald/20 text-accent-emerald' 
        : 'bg-primary/20 text-primary'
    }`}>
      {count}
    </div>
  </div>
);

const TopTagItem = ({ tag, count, index }) => (
  <div 
    className="group relative overflow-hidden rounded-full bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 px-4 py-2 hover:from-secondary/30 hover:to-secondary/20 transition-all duration-200 cursor-pointer"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="flex items-center gap-2">
      <Hash className="w-3 h-3 text-secondary" />
      <span className="text-sm font-medium text-secondary">{tag}</span>
      <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  </div>
);

export default function QuoteStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error connecting to the server');
      console.error('Error:', error);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 animate-fade-in">
          <div className="relative mb-4">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-primary/20 rounded-full animate-pulse"></div>
          </div>
          <p className="text-text-secondary font-medium">Loading statistics...</p>
          <p className="text-text-tertiary text-sm mt-1">Analyzing quote data</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-12 animate-slide-in">
          <div className="relative inline-block mb-4">
            <AlertTriangle className="w-12 h-12 text-error mx-auto" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full animate-ping"></div>
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Failed to Load Stats</h3>
          <p className="text-error mb-6 text-sm">{error}</p>
          <button 
            onClick={fetchStats} 
            className="btn btn-secondary flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    if (stats) {
      return (
        <div className="space-y-8 animate-fade-in">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <AnimatedStatCard 
              label="Total Quotes" 
              value={stats.total_quotes.toLocaleString()} 
              icon={BarChart3}
              delay={0}
              color="primary"
            />
            <AnimatedStatCard 
              label="Authors" 
              value={stats.total_authors.toLocaleString()} 
              icon={Users}
              delay={100}
              color="secondary"
            />
            <AnimatedStatCard 
              label="Tags" 
              value={stats.total_tags.toLocaleString()} 
              icon={Hash}
              delay={200}
              color="accent-cyan"
            />
          </div>

          {/* Top Authors Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent-emerald/20 to-accent-emerald/10 border border-accent-emerald/30">
                <Award className="w-5 h-5 text-accent-emerald" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Top Authors</h3>
                <p className="text-text-tertiary text-sm">Most quoted personalities</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {stats?.top_authors && Array.isArray(stats.top_authors) ? stats.top_authors.map(([author, count], index) => (
                <TopAuthorItem 
                  key={author} 
                  author={author} 
                  count={count} 
                  rank={index + 1}
                  isTop={index === 0}
                />
              )) : (
                <div className="text-text-tertiary text-sm">No author data available</div>
              )}
            </div>
          </div>

          {/* Top Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Popular Tags</h3>
                <p className="text-text-tertiary text-sm">Most used categories</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {stats?.top_tags && Array.isArray(stats.top_tags) ? stats.top_tags.map(([tag, count], index) => (
                <TopTagItem 
                  key={tag} 
                  tag={tag} 
                  count={count} 
                  index={index}
                />
              )) : (
                <div className="text-text-tertiary text-sm">No tag data available</div>
              )}
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-center pt-4 border-t border-border/30">
              <p className="text-text-tertiary text-xs">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent-emerald/20 to-primary/20 border border-accent-emerald/30">
            <BarChart3 className="w-6 h-6 text-accent-emerald" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Analytics</h2>
            <p className="text-text-tertiary text-sm">Quote collection insights</p>
          </div>
        </div>
        
        <button 
          onClick={fetchStats} 
          disabled={isLoading}
          className="btn-icon btn-ghost hover:bg-surface-hover disabled:opacity-50"
          title="Refresh statistics"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
