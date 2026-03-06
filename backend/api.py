from datetime import timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import psycopg2
import os
import httpx

load_dotenv()

app = FastAPI()

# Autoriser le front React (ajuste l'URL si besoin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME")
    )

@app.get("/final_index/average")
def get_average_index(period: str):
    """
    Returns average index per country over a given period.

    Supported periods:
        15min
        1h
        1d
        1w
    """

    # Convert period string to SQL interval
    period_mapping = {
        "15min": "15 minutes",
        "1h": "1 hour",
        "1d": "1 day",
        "1w": "1 week",
    }

    if period not in period_mapping:
        raise HTTPException(
            status_code=400,
            detail="Invalid period. Use: 15min, 1h, 1d, 1w"
        )

    interval_value = period_mapping[period]

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(f"""
            SELECT country, AVG(index)
            FROM final_index
            WHERE timestamp >= NOW() - INTERVAL %s
            GROUP BY country
        """, (interval_value,))

        rows = cursor.fetchall()

        result = {
            row[0]: round(float(row[1]), 2)
            for row in rows
        }

        return result

    finally:
        cursor.close()
        conn.close()

@app.get("/news")
def get_news(limit: int = 100):
    """
    Returns latest news articles from all sources, ordered by published_at DESC.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, title, url, source, published_at
            FROM news_feed
            ORDER BY published_at DESC
            LIMIT %s
        """, (limit,))
        rows = cursor.fetchall()
        return [
            {
                "id":           r[0],
                "title":        r[1],
                "url":          r[2],
                "source":       r[3],
                "published_at": r[4].isoformat() if r[4] else None,
            }
            for r in rows
        ]
    finally:
        cursor.close()
        conn.close()

@app.get("/stats/top")
def get_top_countries(period: str = "1d", limit: int = 10):
    """
    Returns (country, index) for the 10 biggest indexes over the given period.

    Supported periods:
        15min
        1h
        1d
        1w
    """
    period_mapping = {
        "15min": "15 minutes",
        "1h": "1 hour",
        "1d": "1 day",
        "1w": "1 week",
    }
    if period not in period_mapping:
        raise HTTPException(status_code=400, detail="Invalid period")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT country, AVG(index) as avg_index
            FROM final_index
            WHERE timestamp >= NOW() - INTERVAL %s
            GROUP BY country
            ORDER BY avg_index DESC
            LIMIT %s
        """, (period_mapping[period], limit))
        rows = cursor.fetchall()
        return [
            {"country": r[0], "index": round(float(r[1]), 2)}
            for r in rows
        ]
    finally:
        cursor.close()
        conn.close()


@app.get("/stats/history")
def get_country_history(country: str, period: str = "1w"):
    """
    Returns the index history for the given country on the given period.

    Supported periods:
        15min
        1h
        1d
        1w
    """
    period_mapping = {
        "1h":  "1 hour",
        "1d":  "1 day",
        "1w":  "1 week",
        "1m":  "1 month",
    }
    if period not in period_mapping:
        raise HTTPException(status_code=400, detail="Invalid period")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT timestamp, AVG(index)
            FROM final_index
            WHERE country = %s
              AND timestamp >= NOW() - INTERVAL %s
            GROUP BY timestamp
            ORDER BY timestamp ASC
        """, (country.upper(), period_mapping[period]))
        rows = cursor.fetchall()
        return [
            {"timestamp": r[0].isoformat(), "index": round(float(r[1]), 2)}
            for r in rows
        ]
    finally:
        cursor.close()
        conn.close()

@app.get("/proxy/military")
async def proxy_military():
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://api.adsb.lol/v2/mil",
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10,
        )
        return res.json()