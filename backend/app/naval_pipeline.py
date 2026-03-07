"""
Naval pipeline — runs on a schedule, opens a WebSocket to aisstream.io,
collects military vessel positions, stores in memory.
The FastAPI route /proxy/naval reads from this snapshot instantly.
"""
import asyncio
import json
import os
import websockets
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# In-memory snapshot — shared with the FastAPI route via get_snapshot()
# ---------------------------------------------------------------------------
_snapshot: dict = {"vessels": [], "count": 0, "updated_at": None}

NAVAL_PREFIXES = {
    "316", "227", "211",
    "232", "233", "234", "235",
    "247", "257", "258", "259",
    "224", "244", "245", "237",
    "271", "265", "230", "219",
    "261", "338", "303", "369",
    "419", "412", "413", "431",
    "432", "440", "441", "503", "710", "273",
}

def is_naval_mmsi(mmsi: str) -> bool:
    return mmsi[:3] in NAVAL_PREFIXES

def get_snapshot() -> dict:
    return _snapshot


async def _collect() -> list[dict]:
    api_key = os.getenv("AISSTREAM_API_KEY")
    if not api_key:
        print("[naval] AISSTREAM_API_KEY not set, skipping.")
        return []

    positions: dict[str, dict] = {}
    names:     dict[str, str]  = {}

    subscribe_msg = json.dumps({
        "APIKey":             api_key,
        "BoundingBoxes":      [[[-90, -180], [90, 180]]],
        "FilterMessageTypes": ["PositionReport", "ShipStaticData"],
    })

    try:
        async with websockets.connect(
            "wss://stream.aisstream.io/v0/stream",
            ping_interval=None,
            open_timeout=40,
        ) as ws:
            await ws.send(subscribe_msg)
            deadline = asyncio.get_event_loop().time() + 15

            while asyncio.get_event_loop().time() < deadline:
                try:
                    raw      = await asyncio.wait_for(ws.recv(), timeout=5)
                    msg      = json.loads(raw)
                    msg_type = msg.get("MessageType", "")
                    meta     = msg.get("MetaData", {})
                    mmsi     = str(meta.get("MMSI", ""))

                    if not mmsi or not is_naval_mmsi(mmsi):
                        continue

                    if msg_type == "ShipStaticData":
                        name = meta.get("ShipName", "").strip()
                        if name:
                            names[mmsi] = name

                    elif msg_type == "PositionReport":
                        pos     = msg.get("Message", {}).get("PositionReport", {})
                        lat     = pos.get("Latitude")
                        lon     = pos.get("Longitude")
                        if lat is None or lon is None:
                            continue
                        speed   = pos.get("Sog", 0)
                        heading = pos.get("TrueHeading", pos.get("Cog", 0))
                        if heading == 511:
                            heading = pos.get("Cog", 0)
                        if speed < 0.5:
                            continue
                        positions[mmsi] = {
                            "mmsi":    mmsi,
                            "name":    meta.get("ShipName", "").strip(),
                            "lat":     lat,
                            "lon":     lon,
                            "speed":   round(speed, 1),
                            "heading": round(heading, 1),
                        }
                except asyncio.TimeoutError:
                    continue

    except Exception as e:
        print(f"[naval] WebSocket error: {e}")
        return []

    result = []
    for mmsi, pos in positions.items():
        if names.get(mmsi):
            pos["name"] = names[mmsi]
        result.append(pos)

    return result


def run_naval_pipeline():
    global _snapshot
    try:
        vessels = asyncio.run(_collect())
        if vessels:  # only update snapshot if we got data
            _snapshot.update( {
                "vessels":    vessels,
                "count":      len(vessels),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
            print(f"[naval] Snapshot updated — {len(vessels)} vessels.")
        else:
            print("[naval] Empty result, keeping previous snapshot.")
    except Exception as e:
        print(f"[naval] Pipeline error: {e}")