"""
Aircraft pipeline — fetches military aircraft from adsb.lol on a schedule,
stores in memory. The FastAPI route /proxy/military reads from this snapshot.
"""
import httpx
from datetime import datetime, timezone

_snapshot: dict = {"ac": [], "updated_at": None}

def get_snapshot() -> dict:
    return _snapshot

def run_aircraft_pipeline():
    global _snapshot
    try:
        with httpx.Client(timeout=10) as client:
            res = client.get(
                "https://api.adsb.lol/v2/mil",
                headers={"User-Agent": "Mozilla/5.0"},
            )
            res.raise_for_status()
            data = res.json()
            ac = data.get("ac", [])
            print(f"[aircraft] Fetched {len(ac)} military aircraft.")
            if ac:
                _snapshot.update ({
                    "ac":         ac,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                })
                print(f"[aircraft] Snapshot updated — {len(ac)} aircraft.")
            else:
                print("[aircraft] Empty result, keeping previous snapshot.")
    except Exception as e:
        print(f"[aircraft] Pipeline error: {e}")