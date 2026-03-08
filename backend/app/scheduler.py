from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from app.gdelt_pipeline         import run_pipeline
from app.rss_pipeline      import run_rss_pipeline
from app.naval_pipeline    import run_naval_pipeline
from app.aircraft_pipeline import run_aircraft_pipeline
from cleanup import run_cleanup

_scheduler = None

def start_scheduler():
    global _scheduler
    _scheduler = BackgroundScheduler()

    _scheduler.add_job(run_pipeline,          "interval", minutes=15, id="gdelt",    next_run_time=datetime.now())
    _scheduler.add_job(run_rss_pipeline,      "interval", minutes=2,  id="rss",      next_run_time=datetime.now())
    _scheduler.add_job(run_naval_pipeline,    "interval", seconds=60, id="naval",    next_run_time=datetime.now())
    _scheduler.add_job(run_aircraft_pipeline, "interval", seconds=15, id="aircraft", next_run_time=datetime.now())
    _scheduler.add_job(run_cleanup, "interval", weeks=1, id="cleanup", next_run_time=datetime.now())

    _scheduler.start()
    print("Scheduler started (GDELT:15min | RSS:2min | Naval:60s | Aircraft:15s)")
    
def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False, timeout=15)
        print("Scheduler stopped.")