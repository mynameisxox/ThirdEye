import psycopg2
import os

def run_cleanup():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        dbname=os.getenv("DB_NAME")
    )
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM articles    WHERE fetched_at   < NOW() - INTERVAL '1 week'")
        cursor.execute("DELETE FROM final_index WHERE timestamp     < NOW() - INTERVAL '1 week'")
        cursor.execute("DELETE FROM news_feed   WHERE published_at  < NOW() - INTERVAL '1 week'")
        conn.commit()
        print("[cleanup] Old data deleted successfully.")
    except Exception as e:
        conn.rollback()
        print(f"[cleanup] Error: {e}")
    finally:
        cursor.close()
        conn.close()