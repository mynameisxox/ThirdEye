import feedparser
from datetime import datetime, timezone
from app.database import insert_news_feed

RSS_FEEDS = [
    { "url": "https://feeds.reuters.com/reuters/worldNews",              "source": "Reuters"          },
    { "url": "https://feeds.bbci.co.uk/news/world/rss.xml",              "source": "BBC"              },
    { "url": "https://www.aljazeera.com/xml/rss/all.xml",                "source": "Al Jazeera"       },
    { "url": "https://rss.dw.com/xml/rss-en-world",                      "source": "DW"               },
    { "url": "https://www.france24.com/en/rss",                          "source": "France 24"        },
    { "url": "https://en.rfi.fr/general.rss",                            "source": "RFI"              },
    { "url": "https://feeds.skynews.com/feeds/rss/world.xml",            "source": "Sky News"         },
    { "url": "https://www.theguardian.com/world/rss",                    "source": "Guardian"         },
    { "url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",   "source": "NYT"              },
    { "url": "https://euronews.com/rss?level=theme&name=news",           "source": "Euronews"         },
    { "url": "https://www.middleeasteye.net/rss",                        "source": "MEE"              },
    { "url": "https://kyivindependent.com/feed/",                        "source": "Kyiv Independent" },
    { "url": "https://www.themoscowtimes.com/rss/news",                  "source": "Moscow Times"     },
    { "url": "https://www.defenseone.com/rss/all/",                      "source": "Defense One"      },
    { "url": "https://warontherocks.com/feed/",                          "source": "War on the Rocks" },
    { "url": "https://foreignpolicy.com/feed/",                          "source": "Foreign Policy"   },
    { "url": "https://www.economist.com/international/rss.xml",          "source": "Economist"        },
    { "url": "https://www.japantimes.co.jp/feed/",                       "source": "Japan Times"      },
    { "url": "https://www.scmp.com/rss/91/feed",                         "source": "SCMP"             },
    { "url": "https://mercopress.com/rss/news.rss",                      "source": "MercoPress"       },
    { "url": "https://www.africanews.com/feed/",                         "source": "Africa News"      },
    { "url": "https://www.politico.eu/feed/",                            "source": "Politico EU"      },
    { "url": "https://www.chathamhouse.org/rss.xml",                     "source": "Chatham House"    },
    { "url": "https://www.dailymaverick.co.za/feed/",                    "source": "Daily Maverick"   },
    { "url": "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms","source": "Times of India"  },
    { "url": "https://www.straitstimes.com/news/world/rss.xml",          "source": "Straits Times"    },
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