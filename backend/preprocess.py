import pandas as pd
import numpy as np
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import Normalizer
import matplotlib.pyplot as plt
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

class QuoteAnalyzer:
    def __init__(self, data_dir='data', quotes_file='quotes.pkl'):
        self.data_dir = data_dir
        self.quotes_file = os.path.join(data_dir, quotes_file)
        self.df = None
        self.lsi_model = None
        self.vectorizer = None
        self.svd = None
        self.normalizer = None
        
        # init. NLTK resources
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords')
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
            
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
    def load_data(self):
        """Load the scraped quotes from the pickle file"""
        try:
            self.df = pd.read_pickle(self.quotes_file)
            print(f"Loaded {len(self.df)} quotes from {self.quotes_file}")
            return self.df
        except FileNotFoundError:
            print(f"File not found: {self.quotes_file}")
            print("Please run the scraper.py script first to collect quotes.")
            return None
            
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis"""
        # convert to lowercase
        text = text.lower()
        
        # remove punctuation and numbers
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\d+', '', text)
        
        # tokenize
        tokens = word_tokenize(text)
        
        # remove stopwords and lemmatize
        cleaned_tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token not in self.stop_words and len(token) > 2
        ]
        
        return ' '.join(cleaned_tokens)
    
    def prepare_data_for_lsi(self):
        """Prepare the quotes data for LSI analysis"""
        if self.df is None:
            if not self.load_data():
                return None
                
        # preprocess all quotes
        self.df['processed_text'] = self.df['text'].apply(self.preprocess_text)
        
        return self.df
        
    def build_lsi_model(self, n_components=10):
        """Build an LSI model using TF-IDF and SVD"""
        if 'processed_text' not in self.df.columns:
            self.prepare_data_for_lsi()
            
        # create TF-IDF matrix
        self.vectorizer = TfidfVectorizer(min_df=2)
        X = self.vectorizer.fit_transform(self.df['processed_text'])
        
        # apply SVD (LSI model)
        self.svd = TruncatedSVD(n_components=n_components)
        self.normalizer = Normalizer(copy=False)
        self.lsi_model = make_pipeline(self.svd, self.normalizer)
        
        # fit and transform
        X_lsi = self.lsi_model.fit_transform(X)
        
        # calculate explained variance
        explained_variance = self.svd.explained_variance_ratio_.sum()
        print(f"Explained variance of the SVD step: {explained_variance:.2%}")
        
        return X_lsi
        
    def get_top_terms_by_topic(self, n_top_terms=10):
        """Get the top terms for each topic in the LSI model"""
        if self.vectorizer is None or self.svd is None:
            self.build_lsi_model()
            
        feature_names = self.vectorizer.get_feature_names_out()
        topics = {}
        
        for topic_idx, topic in enumerate(self.svd.components_):
            top_features_ind = topic.argsort()[:-n_top_terms-1:-1]
            top_features = [feature_names[i] for i in top_features_ind]
            topics[f"Topic {topic_idx+1}"] = top_features
            
        return topics
        
    def analyze_author_themes(self, author_name):
        """Analyze the common themes in a specific author's quotes"""
        if self.df is None:
            self.load_data()
            
        # filter quotes by the specified author
        author_quotes = self.df[self.df['author'] == author_name]
        
        if len(author_quotes) == 0:
            print(f"No quotes found for author: {author_name}")
            return None
            
        print(f"Found {len(author_quotes)} quotes by {author_name}")
        
        # count the tags
        all_tags = []
        for tags in author_quotes['tags']:
            all_tags.extend(tags)
            
        tag_counts = Counter(all_tags)
        common_tags = tag_counts.most_common()
        
        # analyze text themes using LSI if we have enough quotes
        if len(author_quotes) >= 3:
            if 'processed_text' not in self.df.columns:
                self.prepare_data_for_lsi()
                
            # check if LSI model is built
            if self.lsi_model is None:
                self.build_lsi_model()
                
            # apply LSI to author quotes
            author_processed = author_quotes['processed_text'].tolist()
            author_X = self.vectorizer.transform(author_processed)
            author_X_lsi = self.lsi_model.transform(author_X)
            
            # get the average topic distribution
            avg_topic_dist = author_X_lsi.mean(axis=0)
            top_topics = avg_topic_dist.argsort()[::-1]
            
            return {
                'common_tags': common_tags,
                'top_topics': top_topics,
                'avg_topic_dist': avg_topic_dist
            }
        else:
            return {
                'common_tags': common_tags
            }
    
    def find_similar_quotes(self, query_text, top_n=5):
        """Find quotes similar to the given query text"""
        # ensure model is built
        if self.lsi_model is None:
            self.build_lsi_model()
            
        # preprocess the query
        processed_query = self.preprocess_text(query_text)
        
        # transform using the LSI model
        query_vec = self.vectorizer.transform([processed_query])
        query_lsi = self.lsi_model.transform(query_vec)
        
        # get all quote vectors in LSI space
        X_lsi = self.lsi_model.transform(self.vectorizer.transform(self.df['processed_text']))
        
        # calculate similarity (cosine similarity)
        similarities = np.dot(X_lsi, query_lsi.T).flatten()
        
        # get top N similar quotes
        top_indices = similarities.argsort()[::-1][:top_n]
        similar_quotes = self.df.iloc[top_indices]
        
        return similar_quotes, similarities[top_indices]
    
    def visualize_tag_distribution(self, top_n=15):
        """Visualize the distribution of tags in the dataset"""
        if self.df is None:
            self.load_data()
            
        # count all tags
        all_tags = []
        for tags in self.df['tags']:
            all_tags.extend(tags)
            
        tag_counts = Counter(all_tags)
        
        # get top N tags
        top_tags = dict(tag_counts.most_common(top_n))
        
        # plot
        plt.figure(figsize=(12, 6))
        plt.bar(top_tags.keys(), top_tags.values())
        plt.xticks(rotation=45, ha='right')
        plt.title(f'Top {top_n} Tags')
        plt.xlabel('Tags')
        plt.ylabel('Count')
        plt.tight_layout()
        
        # save the figure
        output_path = os.path.join(self.data_dir, 'tag_distribution.png')
        plt.savefig(output_path)
        plt.close()
        
        print(f"Tag distribution visualization saved to {output_path}")
        
        return top_tags

if __name__ == "__main__":
    analyzer = QuoteAnalyzer()
    df = analyzer.load_data()
    
    if df is not None:
        # prepare data
        analyzer.prepare_data_for_lsi()
        
        # build LSI model
        lsi_matrix = analyzer.build_lsi_model(n_components=15)
        
        # get top terms by topic
        topics = analyzer.get_top_terms_by_topic()
        print("\nLSI Topics:")
        for topic, terms in topics.items():
            print(f"{topic}: {', '.join(terms)}")
        
        # visualize tag distribution
        analyzer.visualize_tag_distribution()
        
        # analyze a specific author
        author = df['author'].value_counts().index[0]  # most common author
        print(f"\nAnalyzing quotes by {author}:")
        author_analysis = analyzer.analyze_author_themes(author)
        
        if author_analysis and 'common_tags' in author_analysis:
            print("\nCommon tags:")
            for tag, count in author_analysis['common_tags'][:10]:
                print(f"  {tag}: {count}")
                
        # example of finding similar quotes
        sample_quote = df.iloc[0]['text']  # use the first quote as an example
        print(f"\nFinding quotes similar to: '{sample_quote[:50]}...'")
        similar_quotes, similarities = analyzer.find_similar_quotes(sample_quote)
        
        for i, (_, quote) in enumerate(similar_quotes.iterrows()):
            print(f"\nSimilarity: {similarities[i]:.4f}")
            print(f"Author: {quote['author']}")
            print(f"Quote: {quote['text']}")
            print(f"Tags: {', '.join(quote['tags'])}")
