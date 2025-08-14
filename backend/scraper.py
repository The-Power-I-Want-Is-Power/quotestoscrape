import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
import csv
from urllib.parse import urljoin

class QuoteScraper:
    def __init__(self, base_url="https://quotes.toscrape.com"):
        self.base_url = base_url
        self.quotes = []
        self.data_dir = 'data'
        
        # create data directory IF it doesn't exist
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def scrape_quotes_from_page(self, url):
        """Scrape quotes from a single page"""
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            quote_elements = soup.select('.quote')
            
            for quote_element in quote_elements:
                # extract quote text
                text = quote_element.select_one('.text').text.strip('""')
                
                # extract author info
                author = quote_element.select_one('.author').text
                
                # extract author's about link
                author_about_elem = quote_element.select_one('a[href*="/author/"]')
                author_about = urljoin(self.base_url, author_about_elem['href']) if author_about_elem else None
                
                # extract quote tags
                tags = [tag.text for tag in quote_element.select('.tags .tag')]
                
                self.quotes.append({
                    'text': text,
                    'author': author,
                    'author_about': author_about,
                    'tags': tags
                })
                
            return soup
        except requests.exceptions.RequestException as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def scrape_all_quotes(self, starting_url=None):
        """Scrape quotes from all pages"""
        if starting_url is None:
            current_url = self.base_url
        else:
            current_url = starting_url
        
        page_num = 1
        
        while current_url:
            print(f"Scraping page {page_num}: {current_url}")
            soup = self.scrape_quotes_from_page(current_url)
            
            if not soup:
                break
                
            # check if there's a next page
            next_button = soup.select_one('.next a')
            if next_button:
                next_page = next_button['href']
                current_url = urljoin(current_url, next_page)
            else:
                current_url = None
                
            page_num += 1
            time.sleep(1)  # be nice to the server
    
    def save_to_csv(self, filename='quotes.csv'):
        """Save the scraped quotes to a CSV file"""
        filepath = os.path.join(self.data_dir, filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['text', 'author', 'author_about', 'tags']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for quote in self.quotes:
                quote_data = {
                    'text': quote['text'],
                    'author': quote['author'],
                    'author_about': quote['author_about'],
                    'tags': ','.join(quote['tags'])
                }
                writer.writerow(quote_data)
                
        print(f"Saved {len(self.quotes)} quotes to {filepath}")
    
    def save_to_pandas(self, filename='quotes.pkl'):
        """Save the scraped quotes to a pickled pandas DataFrame"""
        df = pd.DataFrame(self.quotes)
        
        # explode tags to create one row per tag
        tag_df = df.explode('tags')
        
        filepath = os.path.join(self.data_dir, filename)
        df.to_pickle(filepath)
        
        # save as CSV for easy viewing
        csv_path = os.path.join(self.data_dir, 'quotes_pandas.csv')
        df.to_csv(csv_path, index=False)
        
        print(f"Saved pandas DataFrame to {filepath} and {csv_path}")
        return df

if __name__ == "__main__":
    # init. the scraper
    scraper = QuoteScraper()
    
    # scrape quotes from all pages
    print("Starting to scrape quotes...")
    # scrape the main website to get all quotes, not just from a specific tag
    scraper.scrape_all_quotes()
    
    # save the scraped quotes for use in preprocess.py
    scraper.save_to_csv()
    df = scraper.save_to_pandas()
    
    print(f"Total quotes scraped: {len(scraper.quotes)}")
    
    # basic analysis for funsies
    if len(scraper.quotes) > 0:
        # count tags
        all_tags = []
        for quote in scraper.quotes:
            all_tags.extend(quote['tags'])
        
        tag_counts = pd.Series(all_tags).value_counts()
        print("\nTop 10 tags:")
        print(tag_counts.head(10))
        
        # count quotes by author
        author_counts = pd.DataFrame(scraper.quotes)['author'].value_counts()
        print("\nTop 5 authors by number of quotes:")
        print(author_counts.head(5))
