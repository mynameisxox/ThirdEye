from apscheduler.schedulers.background import BackgroundScheduler
from app.gdelt_pipeline import run_pipeline
from app.rss_pipeline import run_rss_pipeline


def start_scheduler():
    scheduler = BackgroundScheduler()

    # GDELT tension index every 15 minutes
    scheduler.add_job(run_pipeline, "interval", minutes=15, id="gdelt_pipeline")

    # RSS news feed every 2 minutes
    scheduler.add_job(run_rss_pipeline, "interval", minutes=2, id="rss_pipeline")

    scheduler.start()
    print("Scheduler started (GDELT: 15min | RSS: 2min)")