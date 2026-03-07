from datetime import datetime, timezone
from app.gdelt_client import get_latest_gkg_url, download_gkg_dataframe
from app.processor import preprocess_gkg, compute_country_tension, normalize_country_scores
from app.database import insert_country_indexes, insert_articles
import re

def extract_title_from_url(url: str) -> str | None:
    """
    Extracts a readable title from a URL and specifically prunes technical 
    IDs (alphanumeric strings) that often appear as the last word.
    """
    try:
        # 1. Normalize and split
        segments = url.rstrip("/").split("/")
        if len(segments) < 3: 
            return None
            
        path_segments = segments[3:]
        if not path_segments: 
            return None

        # 2. Find the most descriptive segment (moving backwards)
        target_segment = ""
        for seg in reversed(path_segments):
            clean_seg = seg.split('.')[0].split('?')[0]
            
            # Skip pure UUIDs or pure numbers
            is_junk = (
                re.search(r'[a-f0-9]{8}-[a-f0-9]{4}', clean_seg.lower()) or 
                clean_seg.replace('-', '').replace('_', '').isdigit() or    
                len(clean_seg) < 8                                          
            )
            
            if not is_junk:
                target_segment = clean_seg
                break
        
        if not target_segment:
            target_segment = path_segments[-1].split('.')[0].split('?')[0]

        # 3. Initial Clean
        title = re.sub(r'[-_]', ' ', target_segment)
        title = re.sub(r'\b\d{4}\s\d{2}\s\d{2}\b', '', title) # Remove dates
        
        # 4. CRITICAL: Remove the last word if it's an alphanumeric ID
        # (Contains both letters AND numbers)
        words = title.split()
        if len(words) > 1:
            last_word = words[-1]
            # Check if last word contains at least one letter AND at least one digit
            if any(c.isalpha() for c in last_word) and any(c.isdigit() for c in last_word):
                words.pop() # Remove the ID
                title = ' '.join(words)

        # 5. Remove standalone short codes (e.g., 'a1', 'v12')
        title = re.sub(r'\b[a-z0-9]{1,25}\b', '', title)
        
        # 6. Final Formatting & Word Count Validation
        title = ' '.join(title.split()).strip()
        final_words = title.split()

        # Discard if only 1 word remains or if too short
        if len(final_words) < 2 or len(title) < 10:
            return None

        return title.capitalize()[:120]

    except Exception as e:
        print(f"Error extracting title from URL {url}: {e}")
        return None

def run_pipeline():
    """
    Runs GDELT pipeline 
    """
    print("Running GDELT GKG Pipeline...")

    url = get_latest_gkg_url()
    if not url:
        print("No GKG URL found.")
        return

    df = download_gkg_dataframe(url)
    if df.empty:
        print("Downloaded GKG dataframe is empty.")
        return
    print(f"Downloaded GKG dataframe with {len(df)} rows.")

    df = preprocess_gkg(df)
    if df.empty:
        print("Preprocessed GKG dataframe is empty.")
        return
    print(f"Preprocessed GKG dataframe with {len(df)} rows.")

    
    raw_scores, counts = compute_country_tension(df)
    if not raw_scores:
        print("No tension scores computed.")
        return
    print(f"Computed tension scores for {len(raw_scores)} countries.")

    
    normalized = normalize_country_scores(raw_scores, counts)
    insert_country_indexes(normalized)
    print(f"Inserted indexes for {len(normalized)} countries.")

    
    fetched_at = datetime.now(timezone.utc)
    article_rows = []

    for _, row in df.iterrows():
        for country in row["Countries"]:
            if country:
                article_rows.append({
                    "url":        row["URL"],
                    "source":     row.get("Source"),
                    "country":    country,
                    "avg_tone":   row["AvgTone"],
                    "themes":     ";".join(row["ParsedThemes"]),
                    "fetched_at": fetched_at,
                    "title": extract_title_from_url(row["URL"]),
                })

    insert_articles(article_rows)
    print(f"Inserted {len(article_rows)} article rows.")

    print("Pipeline completed successfully.")