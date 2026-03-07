import feedparser
from datetime import datetime, timezone
from app.database import insert_news_feed

RSS_FEEDS = [
# --- Major international news agencies ---

{ "url": "https://feeds.reuters.com/reuters/worldNews", "source": "Reuters" },
{ "url": "https://apnews.com/hub/world-news?outputType=xml", "source": "Associated Press" },
{ "url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "source": "New York Times" },
{ "url": "https://www.theguardian.com/world/rss", "source": "The Guardian" },
{ "url": "https://feeds.bbci.co.uk/news/world/rss.xml", "source": "BBC" },
{ "url": "https://feeds.skynews.com/feeds/rss/world.xml", "source": "Sky News" },
{ "url": "https://www.ft.com/world?format=rss", "source": "Financial Times" },

# --- European international media ---

{ "url": "https://www.lemonde.fr/en/rss/une.xml", "source": "Le Monde (EN)" },
{ "url": "https://www.elpais.com/rss/english.xml", "source": "El Pais (EN)" },
{ "url": "https://www.france24.com/en/rss", "source": "France 24" },
{ "url": "https://rss.dw.com/xml/rss-en-world", "source": "DW" },
{ "url": "https://euronews.com/rss?level=theme&name=news", "source": "Euronews" },
{ "url": "https://www.politico.eu/feed/", "source": "Politico EU" },
{ "url": "https://www.swissinfo.ch/eng/rss", "source": "Swissinfo" },

# --- Middle East / Africa coverage ---

{ "url": "https://www.aljazeera.com/xml/rss/all.xml", "source": "Al Jazeera" },
{ "url": "https://www.africanews.com/feed/", "source": "Africa News" },
{ "url": "https://www.arabnews.com/rss.xml", "source": "Arab News" },

# --- Asia-Pacific coverage ---

{ "url": "https://www.scmp.com/rss/91/feed", "source": "South China Morning Post" },
{ "url": "https://www.japantimes.co.jp/feed/", "source": "Japan Times" },
{ "url": "https://www.channelnewsasia.com/rssfeeds/8395986", "source": "Channel News Asia" },
{ "url": "https://www.straitstimes.com/news/world/rss.xml", "source": "Straits Times" },
{ "url": "https://www.thehindu.com/news/international/?service=rss", "source": "The Hindu" },

# --- International analysis / geopolitics ---

{ "url": "https://foreignaffairs.com/rss.xml", "source": "Foreign Affairs" },
{ "url": "https://foreignpolicy.com/feed/", "source": "Foreign Policy" },
{ "url": "https://thediplomat.com/feed/", "source": "The Diplomat" },
{ "url": "https://geopoliticalfutures.com/feed/", "source": "Geopolitical Futures" },

# --- Defence / security analysis ---

{ "url": "https://warontherocks.com/feed/", "source": "War on the Rocks" },
{ "url": "https://www.defenseone.com/rss/all/", "source": "Defense One" },
{ "url": "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/", "source": "Defense News" },
{ "url": "https://www.longwarjournal.org/feed", "source": "Long War Journal" },

# --- Think tanks and research institutes ---

{ "url": "https://www.csis.org/analysis/feed", "source": "CSIS" },
{ "url": "https://www.atlanticcouncil.org/feed/", "source": "Atlantic Council" },
{ "url": "https://www.brookings.edu/feed/", "source": "Brookings Institution" },
{ "url": "https://carnegieendowment.org/feed", "source": "Carnegie Endowment" },
{ "url": "https://www.crisisgroup.org/rss.xml", "source": "International Crisis Group" },
{ "url": "https://www.iiss.org/rss.xml", "source": "IISS" },
{ "url": "https://www.sipri.org/rss.xml", "source": "SIPRI" },

]


def parse_date(entry) -> datetime:
    """
    Parse published date from feed entry, fallback to now.
    """
    for field in ("published_parsed", "updated_parsed"):
        val = getattr(entry, field, None)
        if val:
            try:
                return datetime(*val[:6], tzinfo=timezone.utc)
            except Exception:
                pass
    return datetime.now(timezone.utc)


def run_rss_pipeline():
    """
        Fetched feeds and insert them in DB.
    """
    print("Running RSS pipeline...")
    rows = []

    for feed in RSS_FEEDS:
        try:
            parsed = feedparser.parse(feed["url"])
            for entry in parsed.entries[:50]:  # Not more than 50 articles per feed
                title = getattr(entry, "title", "").strip()
                link  = getattr(entry, "link",  "").strip()
                if not title or not link:
                    continue
                rows.append({
                    "title":        title,
                    "url":          link,
                    "source":       feed["source"],
                    "published_at": parse_date(entry),
                })
        except Exception as e:
            print(f"Failed to fetch {feed['source']}: {e}")

    if rows:
        inserted = insert_news_feed(rows)
        print(f"RSS pipeline done — {inserted} new articles inserted.")
    else:
        print("RSS pipeline done — no articles fetched.")