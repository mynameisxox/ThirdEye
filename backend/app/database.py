import psycopg2
from app.config import DB_CONFIG


def get_connection():
    """
    Returns the connection to our DB.
    """
    return psycopg2.connect(**DB_CONFIG)


def insert_country_indexes(scores: dict):
    """
    Insert scores into final_index table
    """
    conn = get_connection()
    cursor = conn.cursor()
    for country, score in scores.items():
        cursor.execute("""
            INSERT INTO final_index (country, index, timestamp)
            VALUES (%s, %s, NOW())
        """, (country, score))
    conn.commit()
    cursor.close()
    conn.close()


def insert_articles(rows: list[dict]):
    """
    Insert GDELT articles into the articles table.
    Ignores duplicates based on URL (ON CONFLICT DO NOTHING).
    """
    if not rows:
        return
    conn = get_connection()
    cursor = conn.cursor()
    for row in rows:
        cursor.execute("""
            INSERT INTO articles (url, title, source, country, avg_tone, themes, fetched_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (url) DO NOTHING
        """, (
            row["url"],
            row.get("title"),
            row.get("source"),
            row["country"],
            row["avg_tone"],
            row.get("themes"),
            row["fetched_at"],
        ))
    conn.commit()
    cursor.close()
    conn.close()


def insert_news_feed(rows: list[dict]) -> int:
    """
    Insert RSS feed articles into the news_feed table.
    Ignores duplicates based on URL.
    Returns the number of newly inserted rows.

    Each dict must contain: title, url, source, published_at
    """
    if not rows:
        return 0

    conn = get_connection()
    cursor = conn.cursor()
    inserted = 0

    for row in rows:
        cursor.execute("""
            INSERT INTO news_feed (title, url, source, published_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (url) DO NOTHING
        """, (
            row["title"],
            row["url"],
            row["source"],
            row["published_at"],
        ))
        inserted += cursor.rowcount

    conn.commit()
    cursor.close()
    conn.close()
    return inserted
 