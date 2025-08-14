from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from scraper import QuoteScraper
from preprocess import QuoteAnalyzer
from search import QuoteSearch

app = Flask(__name__)
CORS(app)  # This will allow all origins in development

# Configure the data directory
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

@app.route('/api/scrape', methods=['POST'])
def scrape_quotes():
    """Endpoint to trigger quote scraping"""
    try:
        scraper = QuoteScraper()
        scraper.scrape_all_quotes()
        scraper.save_to_csv()
        scraper.save_to_pandas()
        return jsonify({
            'success': True,
            'message': 'Successfully scraped quotes',
            'total_quotes': len(scraper.quotes)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Endpoint to get quote statistics"""
    try:
        analyzer = QuoteAnalyzer(data_dir=DATA_DIR)
        df = analyzer.load_data()
        if df is None:
            return jsonify({
                'success': False,
                'message': 'No data available. Please scrape quotes first.'
            }), 404

        top_tags = analyzer.visualize_tag_distribution(top_n=10)
        top_authors = df['author'].value_counts().head(10).to_dict()

        return jsonify({
            'success': True,
            'stats': {
                'total_quotes': len(df),
                'total_authors': df['author'].nunique(),
                'total_tags': sum(len(tags) for tags in df['tags']),
                'top_tags': top_tags,
                'top_authors': top_authors
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/search', methods=['GET'])
def search_quotes():
    """Endpoint to search quotes"""
    try:
        search_type = request.args.get('type', 'keyword')
        query = request.args.get('query', '')
        exact_match = request.args.get('exact', 'false').lower() == 'true'
        limit = int(request.args.get('limit', 10))

        if not query:
            return jsonify({
                'success': False,
                'message': 'Query parameter is required'
            }), 400

        searcher = QuoteSearch(data_dir=DATA_DIR)
        
        if search_type == 'author':
            results = searcher.search_by_author(query, exact_match=exact_match)
        elif search_type == 'tag':
            results = searcher.search_by_tag(query, exact_match=exact_match)
        elif search_type == 'semantic':
            results, similarities = searcher.semantic_search(query, top_n=limit)
            # Add similarity scores to results
            results = results.copy()
            results['similarity'] = similarities
        else:  # keyword search
            results = searcher.search_by_keyword(query)

        # Convert results to list of dicts and limit the number of results
        if hasattr(results, 'to_dict'):
            quotes = results.head(limit).to_dict(orient='records')
        else:
            quotes = []

        return jsonify({
            'success': True,
            'results': quotes,
            'total': len(quotes)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
