import os
import pandas as pd
import re
from preprocess import QuoteAnalyzer

class QuoteSearch:
    def __init__(self, data_dir='data', quotes_file='quotes.pkl'):
        self.data_dir = data_dir
        self.quotes_file = os.path.join(data_dir, quotes_file)
        self.df = None
        self.analyzer = None
        self.load_data()
        
    def load_data(self):
        """Load the quotes data"""
        try:
            self.df = pd.read_pickle(self.quotes_file)
            print(f"Loaded {len(self.df)} quotes for searching")
            return True
        except FileNotFoundError:
            print(f"File not found: {self.quotes_file}")
            print("Please run the scraper.py script first to collect quotes.")
            return False
    
    def search_by_author(self, author_name, exact_match=False):
        """Search quotes by author name"""
        if self.df is None:
            return []
            
        if exact_match:
            results = self.df[self.df['author'] == author_name]
        else:
            pattern = re.compile(f'.*{re.escape(author_name)}.*', re.IGNORECASE)
            results = self.df[self.df['author'].str.contains(pattern)]
            
        return results
    
    def search_by_tag(self, tag, exact_match=False):
        """Search quotes by tag"""
        if self.df is None:
            return []
            
        if exact_match:
            results = self.df[self.df['tags'].apply(lambda tags: tag in tags)]
        else:
            pattern = re.compile(f'.*{re.escape(tag)}.*', re.IGNORECASE)
            results = self.df[self.df['tags'].apply(
                lambda tags: any(pattern.match(t) for t in tags)
            )]
            
        return results
    
    def search_by_keyword(self, keyword):
        """Search quotes containing a specific keyword"""
        if self.df is None:
            return []
            
        pattern = re.compile(f'.*{re.escape(keyword)}.*', re.IGNORECASE)
        results = self.df[self.df['text'].str.contains(pattern)]
            
        return results
    
    def semantic_search(self, query_text, top_n=5):
        """Search quotes semantically similar to the query using LSI"""
        if self.analyzer is None:
            self.analyzer = QuoteAnalyzer(self.data_dir, os.path.basename(self.quotes_file))
            self.analyzer.load_data()
            self.analyzer.prepare_data_for_lsi()
            self.analyzer.build_lsi_model()
            
        similar_quotes, similarities = self.analyzer.find_similar_quotes(query_text, top_n=top_n)
        return similar_quotes, similarities
        
def print_results(results, limit=None):
    """Print the search results in a readable format"""
    if isinstance(results, tuple) and len(results) == 2:
        # case: semantic search, returns quotes and similarity scores
        quotes, similarities = results
        for i, (_, quote) in enumerate(quotes.iterrows()):
            if limit is not None and i >= limit:
                break
            print(f"\nSimilarity: {similarities[i]:.4f}")
            print(f"Author: {quote['author']}")
            print(f"Quote: {quote['text']}")
            print(f"Tags: {', '.join(quote['tags'])}")
            print("-" * 50)
    else:
        # case: regular search
        if len(results) == 0:
            print("No matching quotes found.")
            return
            
        for i, (_, quote) in enumerate(results.iterrows()):
            if limit is not None and i >= limit:
                break
            print(f"\nAuthor: {quote['author']}")
            print(f"Quote: {quote['text']}")
            print(f"Tags: {', '.join(quote['tags'])}")
            print("-" * 50)
            
        print(f"\nTotal results: {len(results)}")

def interactive_search():
    """Run an interactive search interface"""
    searcher = QuoteSearch()
    
    if searcher.df is None:
        return
        
    print("\nQuote Search Tool")
    print("=" * 50)
    
    while True:
        print("\nSearch Options:")
        print("1. Search by Author")
        print("2. Search by Tag")
        print("3. Search by Keyword")
        print("4. Semantic Search (Find Similar Quotes)")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '1':
            author = input("Enter author name: ")
            exact = input("Exact match? (y/n): ").lower() == 'y'
            results = searcher.search_by_author(author, exact_match=exact)
            print_results(results)
            
        elif choice == '2':
            tag = input("Enter tag: ")
            exact = input("Exact match? (y/n): ").lower() == 'y'
            results = searcher.search_by_tag(tag, exact_match=exact)
            print_results(results)
            
        elif choice == '3':
            keyword = input("Enter keyword: ")
            results = searcher.search_by_keyword(keyword)
            print_results(results)
            
        elif choice == '4':
            query = input("Enter your query: ")
            top_n = int(input("Number of results to return: ") or "5")
            results = searcher.semantic_search(query, top_n=top_n)
            print_results(results)
            
        elif choice == '5':
            print("Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    interactive_search()
