from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx
import asyncio
import json
import os
import websockets
import psycopg2
from contextlib import asynccontextmanager
from app.scheduler import start_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(lifespan=lifespan)

load_dotenv()

#app = FastAPI()

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


# ---------------------------------------------------------------------------
# Tension indexes
# ---------------------------------------------------------------------------

@app.get("/final_index/average")
def get_average_index(period: str):
    period_mapping = {
        "15min": "15 minutes",
        "1h":    "1 hour",
        "1d":    "1 day",
        "1w":    "1 week",
    }
    if period not in period_mapping:
        raise HTTPException(status_code=400, detail="Invalid period. Use: 15min, 1h, 1d, 1w")
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT country, AVG(index)
            FROM final_index
            WHERE timestamp >= NOW() - INTERVAL %s
            GROUP BY country
        """, (period_mapping[period],))
        rows = cursor.fetchall()
        return {row[0]: round(float(row[1]), 2) for row in rows}
    finally:
        cursor.close()
        conn.close()


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

@app.get("/stats/top")
def get_top_countries(period: str = "1d", limit: int = 10):
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
        return [{"country": r[0], "index": round(float(r[1]), 2)} for r in rows]
    finally:
        cursor.close()
        conn.close()


@app.get("/stats/history")
def get_country_history(country: str, period: str = "1w"):
    period_mapping = {
        "1h": "1 hour",
        "1d": "1 day",
        "1w": "1 week",
        "1m": "1 month",
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
        return [{"timestamp": r[0].isoformat(), "index": round(float(r[1]), 2)} for r in rows]
    finally:
        cursor.close()
        conn.close()
        

# ---------------------------------------------------------------------------
# GDELT articles
# ---------------------------------------------------------------------------

@app.get("/news/gdelt")
def get_gdelt_news(theme: str = None, limit: int = 200):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 1. Ajout de 'avg_tone' dans le SELECT
        query = """
            SELECT id, title, url, source, fetched_at, themes, avg_tone
            FROM articles
            WHERE title IS NOT NULL 
              AND title != '' 
              AND title NOT LIKE 'article %%' 
        """
        params = []
        
        if theme:
            query += " AND themes ILIKE %s "
            params.append(f"%{theme}%")
            
        query += " ORDER BY fetched_at DESC LIMIT %s "
        params.append(limit)
        
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        return [
            {
                "id": r[0],
                "title": r[1],
                "url": r[2],
                "source": r[3] or "GDELT",
                "published_at": r[4].isoformat() if r[4] else None, 
                "themes": r[5],
                "avg_tone": round(float(r[6]), 2) if r[6] is not None else None # 2. Ajout ici
            }
            for r in rows
        ]
    finally:
        cursor.close()
        conn.close()

# ---------------------------------------------------------------------------
# News feed
# ---------------------------------------------------------------------------

@app.get("/news/feed")
def get_news(limit: int = 100):
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


@app.get("/news/{country}")
def get_news_by_country(country: str, limit: int = 50):
    ISO3_TO_KEYWORDS = {
        "USA": ["United States", "America", "American", "Washington", "US "],
        "GBR": ["Britain", "British", "UK", "England", "London"],
        "FRA": ["France", "French", "Paris"],
        "DEU": ["Germany", "German", "Berlin"],
        "RUS": ["Russia", "Russian", "Moscow", "Kremlin"],
        "CHN": ["China", "Chinese", "Beijing"],
        "IRN": ["Iran", "Iranian", "Tehran"],
        "ISR": ["Israel", "Israeli", "Jerusalem", "Gaza"],
        "PSE": ["Palestine", "Palestinian", "Gaza", "West Bank"],
        "UKR": ["Ukraine", "Ukrainian", "Kyiv"],
        "PRK": ["North Korea", "Pyongyang", "Kim Jong"],
        "KOR": ["South Korea", "Seoul"],
        "SYR": ["Syria", "Syrian", "Damascus"],
        "IRQ": ["Iraq", "Iraqi", "Baghdad"],
        "AFG": ["Afghanistan", "Afghan", "Kabul", "Taliban"],
        "PAK": ["Pakistan", "Pakistani", "Islamabad"],
        "IND": ["India", "Indian", "New Delhi", "Modi"],
        "TUR": ["Turkey", "Turkish", "Ankara", "Erdogan"],
        "SAU": ["Saudi Arabia", "Saudi", "Riyadh"],
        "YEM": ["Yemen", "Yemeni", "Houthi"],
        "LBN": ["Lebanon", "Lebanese", "Beirut", "Hezbollah"],
        "CAN": ["Canada", "Canadian", "Ottawa", "Trudeau"],
        "AUS": ["Australia", "Australian", "Canberra", "Sydney"],
        "JPN": ["Japan", "Japanese", "Tokyo"],
        "TWN": ["Taiwan", "Taiwanese", "Taipei"],
        "EGY": ["Egypt", "Egyptian", "Cairo"],
        "MAR": ["Morocco", "Moroccan", "Rabat"],
        "NGA": ["Nigeria", "Nigerian", "Abuja"],
        "ZAF": ["South Africa", "Pretoria", "Johannesburg"],
        "VEN": ["Venezuela", "Venezuelan", "Caracas", "Maduro"],
        "COL": ["Colombia", "Colombian", "Bogota"],
        "MEX": ["Mexico", "Mexican", "Mexico City"],
        "ESP": ["Spain", "Spanish", "Madrid"],
        "ITA": ["Italy", "Italian", "Rome"],
        "POL": ["Poland", "Polish", "Warsaw"],
    }
    keywords = ISO3_TO_KEYWORDS.get(country.upper(), [country])
    conditions = " OR ".join(["title ILIKE %s"] * len(keywords))
    params = [f"%{kw}%" for kw in keywords] + [limit]
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f"""
            SELECT id, title, url, source, published_at
            FROM news_feed
            WHERE {conditions}
            ORDER BY published_at DESC
            LIMIT %s
        """, params)
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



# ---------------------------------------------------------------------------
# Proxies
# ---------------------------------------------------------------------------

@app.get("/proxy/military")
def proxy_military():
    from app.aircraft_pipeline import get_snapshot
    return get_snapshot()


@app.get("/proxy/naval")
def proxy_naval():
    from app.naval_pipeline import get_snapshot
    return get_snapshot()