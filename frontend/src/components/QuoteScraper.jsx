import { useState } from 'react';
import { Loader, Download, Globe, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

export default function QuoteScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleScrape = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/scrape`, {
        method: 'POST'
      });
      const data = await response.json();
      
      setTimeout(() => {
        if (data.success) {
          setMessage(`Successfully scraped ${data.total_quotes} quotes!`);
        } else {
          setMessage(`Error: ${data.message}`);
        }
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      setMessage('Error connecting to the server');
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Quote Scraper</h2>
          <p className="text-text-tertiary text-sm">Collect the quotes</p>
        </div>
      </div>
      
      {/* Description */}
      <div className="mb-8 p-4 rounded-xl bg-surface/30 border border-border/50">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Automatically discover and collect inspirational quotes from quotestoscrape.com. 
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="space-y-4">
        <button
          onClick={handleScrape}
          disabled={isLoading}
          className={`btn w-full flex items-center justify-center gap-3 py-4 text-lg font-semibold ${
            isLoading 
              ? 'btn-ghost cursor-not-allowed' 
              : 'btn-primary hover:shadow-lg hover:shadow-primary-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Scraping in progress...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              <span>Start Scraping</span>
            </>
          )}
        </button>

        {/* Progress Indicator */}
        {isLoading && (
          <div className="text-center text-sm text-text-secondary animate-fade-in">
            <span>Processing your request...</span>
          </div>
        )}
      </div>
      
      {/* Status Message */}
      {message && (
        <div className={`mt-6 animate-slide-in ${
          message.includes('Error') 
            ? 'status-error' 
            : 'status-success'
        }`}>
          <div className="flex items-center gap-3">
            {message.includes('Error') ? (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">{message.includes('Error') ? 'Scraping Failed' : 'Scraping Complete'}</p>
              <p className="text-sm opacity-90 mt-1">{message}</p>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
