import numpy as np
import pandas as pd
from collections import defaultdict
from app.fips_mapping import FIPS_TO_ISO3

"""
 Direct conflict themes — at least one required
"""
TIER1_THEMES = {
    "WAR", "TERROR", "ATTACK", "KILLING", "ARMEDCONFLICT",
    "SEIGE", "BLOCKADE", "WMD", "DRONES"
}
"""
Geopolitical tension themes — two or more required if no Tier 1
"""
TIER2_THEMES = {
    "SANCTION", "ALLIANCE", "ESPIONAGE", "SOC_INTELSHARING",  "CONFLICT",
    "EPU_CATS_NATIONAL_SECURITY", "WB_2503_WEAPONS_PROLIFERATION",
    "WB_2505_WEAPONS_OF_MASS_DESTRUCTION", "WB_2470_PEACE_OPERATIONS", "UNREST_BELLIGERENT"
}

"""
 Internal instability themes — two or more required if no Tier 1
"""
TIER3_THEMES = {
    "UNREST", "PROTEST", "STRIKE", "COUP", "REBELLION",
    "WB_2432_FRAGILITY_CONFLICT_AND_VIOLENCE",
    "WB_2433_CONFLICT_AND_VIOLENCE", "WB_2462_POLITICAL_VIOLENCE_AND_WAR",
    "WB_2465_REVOLUTIONARY_VIOLENCE", "UNGP_CRIME_VIOLENCE"
}

# GKG column index for V2Tone
URL_COL=4
THEMES_COL=7
LOCATION_COL=10
TONE_COL=15


def fips_to_iso3(fips_code: str) -> str:
    return FIPS_TO_ISO3.get(fips_code.upper(), fips_code)


def _extract_tone(tone_series: pd.Series) -> pd.Series:
    """
    Vectorized extraction of overall tone from V2Tone strings.
    Format: "overall,positive,negative,..."
    """
    return pd.to_numeric(
        tone_series.str.split(",", n=1).str[0],
        errors="coerce"
    )


def _extract_locations(locations_str: str) -> list[str]:
    """
    Extract top 2 country codes (ISO3) from a V2Locations string.
    """
    if not isinstance(locations_str, str) or not locations_str.strip():
        return []

    country_counts = defaultdict(int)
    for block in locations_str.split(";"):
        parts = block.split("#")
        if len(parts) >= 3:
            code = parts[2].strip()
            if code:
                country_counts[code] += 1

    top2 = sorted(country_counts, key=country_counts.__getitem__, reverse=True)[:2]
    return [fips_to_iso3(c) for c in top2]


def _is_geopolitical(themes_str: str) -> bool:
    """
    Returns True if the themes string contains at least one Tier 1 theme.
    Substring matching to catch variants (e.g. TERROR_ATTACK).
    """
    if not isinstance(themes_str, str):
        return False
    upper = themes_str.upper()
    tier1 = any(t in upper for t in TIER1_THEMES)
    """
     I found that tier 2 and 3 make index less representative of geopolitical tension
     tier2and3 = any(t in upper for t in TIER2_THEMES) and any(t in upper for t in TIER3_THEMES) 
     """
    return tier1 # or tier2and3
    
    


def preprocess_gkg(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess a raw GKG dataframe.

    GKG column indices used:
        4  → DocumentIdentifier (URL)
        7  → V2Themes
        10 → V2Locations
        15 → V2Tone (fixed index)
    """
    df = df.iloc[:, [URL_COL, THEMES_COL, LOCATION_COL, TONE_COL]].copy()
    df.columns = ["URL", "Themes", "Locations", "Tone"]

    # Drop rows missing tone or locations
    df = df.dropna(subset=["Tone", "Locations"])

    # Vectorized tone extraction
    df["AvgTone"] = _extract_tone(df["Tone"])
    df = df[df["AvgTone"] < 0]

    # Vectorized geopolitical filter (no set parsing, pure string search)
    geo_mask = df["Themes"].apply(_is_geopolitical)
    df = df[geo_mask]

    if df.empty:
        return df

    # Parse locations (still needs row-level logic, but only on filtered rows)
    df["Countries"] = df["Locations"].apply(_extract_locations)
    df = df[df["Countries"].map(len) > 0]

    # Parse themes as sets only for the rows that passed all filters
    df["ParsedThemes"] = df["Themes"].apply(
        lambda s: set(s.upper().split(";")) if isinstance(s, str) else set()
    )

    # Extract source from URL
    df["Source"] = df["URL"].str.extract(r"https?://([^/]+)", expand=False)

    return df[["URL", "Source", "AvgTone", "ParsedThemes", "Countries"]]

def compute_country_tension(df: pd.DataFrame) -> tuple[dict, dict]:
    """
    Compute raw tension scores per country.
    Score = sum of (-avg_tone) across all matching articles.
    Uses explode() instead of iterrows() for performance.
    """
    # Explode countries so each row = one country
    exploded = df[["AvgTone", "Countries"]].explode("Countries")
    exploded = exploded[exploded["Countries"].notna() & (exploded["Countries"] != "")]
    exploded["tension"] = -exploded["AvgTone"]

    scores = exploded.groupby("Countries")["tension"].sum().round(2).to_dict()
    counts = exploded.groupby("Countries")["tension"].count().to_dict()

    return scores, counts


def normalize_country_scores(scores: dict, counts: dict) -> dict:
    """
    Normalize scores to 0-100 using the 95th percentile as ceiling.
    """
    if not scores:
        return {}

    values = np.array(list(scores.values()))
    p95 = float(np.percentile(values, 95))
    max_tension = p95 if p95 > 0 else 1.0

    return {
        country: min(round((score / max_tension) * 100, 2), 100)
        for country, score in scores.items()
    }