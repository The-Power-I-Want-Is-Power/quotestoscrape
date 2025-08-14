import React from 'react';
import { Sparkles, Quote } from 'lucide-react';
import QuoteScraper from './components/QuoteScraper';
import QuoteStats from './components/QuoteStats';
import QuoteSearch from './components/QuoteSearch';

function App() {
  return (
    <div className="min-h-screen w-full">
      <div className="container-custom section-padding">
        {/* Hero Header */}
        <header className="text-center mb-16 animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg blur opacity-20 animate-pulse-slow"></div>
            <div className="relative flex items-center gap-4 bg-background-secondary/50 backdrop-blur-sm px-8 py-4 rounded-2xl border border-border/30">
              <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
              <h1 className="text-text-primary font-bold tracking-tight leading-none -mb-1">
                Scraped Quote Search Engine
              </h1>
              <Quote className="w-8 h-8 text-primary animate-glow" />
            </div>
          </div>
          
          <p className="text-text-secondary mt-6 text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Discover, scrape, and explore a universe of inspirational quotes with powerful search capabilities
          </p>
          
          {/* Floating elements for visual interest */}
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-40"></div>
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-secondary rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-16 right-1/4 w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse opacity-50"></div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar - Tools & Stats */}
          <aside className="xl:col-span-4 space-y-8">
            <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <QuoteScraper />
            </div>
            <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <QuoteStats />
            </div>
          </aside>

          {/* Main Content - Search */}
          <section className="xl:col-span-8">
            <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <QuoteSearch />
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border/30 text-center">
          <p className="text-text-tertiary text-sm">
            Built with modern web technologies • 
            <span className="text-primary"> React</span> • 
            <span className="text-secondary"> Tailwind CSS</span> • 
            <span className="text-accent-cyan"> Python Flask</span>
          </p>
        </footer>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}

export default App;
