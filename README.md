# Quotes to Scrape - Web Scraping and Analysis Project
# Arda Arkan

This project scrapes quotes from [Quotes to Scrape](https://quotes.toscrape.com/), analyzes them using Latent Semantic Indexing (LSI), and provides search functionality.

## objectives

- Collect quotes, authors, and associated tags from the website
- Identify the most common themes (tags) and analyze quotes from specific authors
- Implement search features that allow users to find quotes by keywords, authors, or tags
- Apply LSI (Latent Semantic Indexing) for semantic search and theme analysis

## features

1. **web scraping**: 
   - Scrapes all quotes from quotes.toscrape.com
   - Collects quote text, author, author link, and tags

2. **data analysis**:
   - Identifies most common themes (tags) across all quotes
   - Analyzes common themes in a specific author's quotes
   - Uses LSI (Latent Semantic Indexing) to discover latent topics

3. **search engine**:
   - Search by author name (exact/partial match)
   - Search by tag (exact/partial match)
   - Search by keyword in quote text
   - Semantic search to find quotes similar to a given query

4. **visualization**:
   - Generates a basic tag distribution visualization

## project structure

- `scraper.py`: Web scraper to collect quotes from quotes.toscrape.com
- `preprocess.py`: Data preprocessing and analysis module with LSI implementation
- `search.py`: Search functionality for finding quotes
- `data/`: Directory where scraped data and visualizations are stored
- `requirements.txt`: List of required dependencies

## getting started

### prereqs

- Python 3.7 or later
- pip (Python package installer)

### installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/quotestoscrape.git
   cd quotestoscrape
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### usage

1. **scraping quotes**:
   ```
   python scraper.py
   ```
   This will scrape quotes from the website and save them in the `data/` directory.

2. **analysis - LSI model**:
   ```
   python preprocess.py
   ```
   This will analyze the scraped quotes, build the LSI model, and generate visualizations.

3. **search quotes**:
   ```
   python search.py
   ```
   This will start an interactive search tool where you can search quotes by author, tag, keyword, or use semantic search.

## example output

### analysis
```
Loaded 100 quotes from data/quotes.pkl
Explained variance of the SVD step: 35.74%

LSI Topics:
Topic 1: life, time, heart, live, love, man, mind, day, thing, long
Topic 2: book, read, reader, word, love, reading, writer, writing, life, story
...

Analyzing quotes by Albert Einstein:
Found 5 quotes by Albert Einstein

Common tags:
  inspirational: 3
  life: 2
  humor: 2
  ...
```

### search engine
```
Quote Search Tool
==================================================

Search Options:
1. Search by Author
2. Search by Tag
3. Search by Keyword
4. Semantic Search (Find Similar Quotes)
5. Exit

Enter your choice (1-5): 4
Enter your query: life is too short
Number of results to return: 3

Similarity: 0.8432
Author: Dr. Seuss
Quote: "Don't cry because it's over, smile because it happened."
Tags: attributed-no-source, cry, crying, experience, happiness, joy, life, smile, smiling
--------------------------------------------------
...
```

## technologies/methods used

- Python
- BeautifulSoup for web scraping
- Pandas for data manipulation
- NLTK for text preprocessing
- Scikit-learn for implementing LSI
- Matplotlib for visualization

## license

This project is licensed under the MIT License - see the LICENSE file for details.


