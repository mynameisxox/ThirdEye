import requests
import pandas as pd
import zipfile
import io
from app.config import GDELT_LAST_UPDATE_URL

"""
    GDELT_LAST_UPDATE_URL contains links to 3 resources (.gkg, .export, .news (I think?)), each one contains specific data. 
    We want to use the .gkg resources, which contains various data one recent articles(links, thems, ...), 
    but most importantly their average tone (usually from -10 for very negative to 10 to very positive).
"""

def get_latest_gkg_url():
    """
    
    """
    response = requests.get(GDELT_LAST_UPDATE_URL, timeout=30)
    response.raise_for_status()
    for line in response.text.strip().split("\n"):
        if ".gkg." in line:
            return line.split(" ")[2]
    return None


def download_gkg_dataframe(url: str) -> pd.DataFrame:
    response = requests.get(url, timeout=120)
    response.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        filename = z.namelist()[0]
        with z.open(filename) as f:
            df = pd.read_csv(f, sep="\t", header=None, low_memory=False)
    return df