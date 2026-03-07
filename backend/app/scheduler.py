from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.gdelt_pipeline         import run_pipeline
from app.rss_pipeline      import run_rss_pipeline
from app.naval_pipeline    import run_naval_pipeline
from app.aircraft_pipeline import run_aircraft_pipeline

def start_scheduler():
    scheduler = BackgroundScheduler()

    scheduler.add_job(run_pipeline,          "interval", minutes=15, id="gdelt",    next_run_time=datetime.now())
    scheduler.add_job(run_rss_pipeline,      "interval", minutes=2,  id="rss",      next_run_time=datetime.now())
    scheduler.add_job(run_naval_pipeline,    "interval", seconds=60, id="naval",    next_run_time=datetime.now())
    scheduler.add_job(run_aircraft_pipeline, "interval", seconds=15, id="aircraft", next_run_time=datetime.now())

    scheduler.start()
    print("Scheduler started (GDELT:15min | RSS:2min | Naval:60s | Aircraft:15s)")