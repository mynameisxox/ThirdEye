from app.scheduler import start_scheduler
from app.gdelt_pipeline import run_pipeline
from app.rss_pipeline import run_rss_pipeline
from app.aircraft_pipeline import run_aircraft_pipeline
from app.naval_pipeline import run_naval_pipeline

if __name__ == "__main__":
    # Run pipelines once at start 
    run_aircraft_pipeline()
    run_naval_pipeline()
    run_pipeline()
    run_rss_pipeline()
    

    # Then schedule pipelines execution
    start_scheduler()

    # Keep process alive
    import time
    while True:
        time.sleep(60)