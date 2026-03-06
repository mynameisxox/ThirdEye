from app.scheduler import start_scheduler
from app.gdelt_pipeline import run_pipeline
from app.rss_pipeline import run_rss_pipeline

if __name__ == "__main__":
    # Run pipelines once at start 
    run_pipeline()
    run_rss_pipeline()

    # Then schedule pipelines execution
    start_scheduler()

    # Keep process alive
    import time
    while True:
        time.sleep(60)