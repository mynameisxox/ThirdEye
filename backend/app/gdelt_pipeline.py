from datetime import datetime, timezone
from app.gdelt_client import get_latest_gkg_url, download_gkg_dataframe
from app.processor import preprocess_gkg, compute_country_tension, normalize_country_scores
from app.database import insert_country_indexes, insert_articles


def extract_title_from_url(url: str) -> str | None:
    """
    Tries to extract title form url
    
    Example: ..../macron-gives-10min speech => macron gives 10min speech
    """
    try:
        path = url.rstrip("/").split("/")[-1]
        path = path.replace("-", " ").replace("_", " ")
        path = path.split(".")[0]
        return path[:120] if path else None
    except Exception:
        print(f"Error extracting title from URL: {url}")
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