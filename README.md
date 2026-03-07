# ThirdEye

**ThirdEye** is an **OSINT dashboard focused on geopolitical events**, built as a personal project inspired by existing tools such as **Glint** and **World Monitor**.

The goal of the project is to explore **how far LIVE OSINT monitoring can be pushed using only open data sources**, while also becoming more familiar with OSINT ecosystems, pipelines, and visualization techniques.

ThirdEye aggregates multiple real-time data sources and displays them through a **global map interface and modular analytical tools**.

<p align="center">
  <img src="https://i.imgur.com/xbdv5UC.png" width="32%" />
  <img src="https://i.imgur.com/BAUy5zW.png" width="32%" />
  <img src="https://i.imgur.com/Hzk0SV7.png" width="32%" />
</p>

---

# Project Goal

The idea behind ThirdEye is to build a **real-time geopolitical monitoring dashboard** capable of providing a quick overview of global tensions and activity.

The platform focuses on:

- **Live OSINT data aggregation** (News, Air traffic, Naval movements)
- **Geopolitical signal detection** via sentiment analysis
- **Real-time visualization** on a 3D/2D interactive globe
- **Modular analysis tools** for rapid situational awareness

---

# Country Tension Index Calculation

A core feature of ThirdEye is the **country tension index**, which attempts to estimate geopolitical pressure on each country using news data.

The calculation pipeline works as follows:

1. **Every 15 minutes**, the backend fetches the latest update from the **GDELT Project**.
2. Articles related to **geopolitical tension themes** are extracted.
3. Each article contains a **Tone score** provided by GDELT representing the sentiment of the news event.
4. Articles are grouped **by country mentioned in the event**.
5. Instead of computing a simple average, the system calculates the **95th percentile of article tone per country**.

Using the **95th percentile** helps emphasize **high-impact events** while reducing noise from neutral or low-signal articles.

This produces a **tension index per country**, which can then be visualized on the global map.

The index can be calculated across different time windows to analyze trends.

I'm still not satisfied with the method I am using, but I made multiple versions of the formula using GDELT data and I have found this one to be the most representative one.

---

# Database Schema (PostgreSQL)

The system relies on a PostgreSQL database to store and correlate real-time feeds.

### Tables Overview

- `articles`: Stores GDELT events, themes, and individual sentiment scores.
- `final_index`: Stores the calculated tension results per country for historical tracking.
- `news_feed`: Real-time headlines from 25+ international RSS sources.

### Technical Definitions

```sql
-- Main articles table (GDELT data)
Table "public.articles"
 Column     | Type                        | Nullable | Default
------------+-----------------------------+----------+--------------------------------------
 id         | integer                     | not null | nextval('articles_id_seq'::regclass)
 url        | text                        | not null |
 title      | text                        |          |
 source     | text                        |          |
 country    | text                        | not null |
 avg_tone   | numeric(5,2)                |          |
 themes     | text                        |          |
 fetched_at | timestamp without time zone | not null |
Indexes: "articles_pkey" PRIMARY KEY, "idx_articles_country", "idx_articles_fetched_at"

-- Processed tension index
Table "public.final_index"
 Column    | Type                        | Nullable | Default
-----------+-----------------------------+----------+-----------------------------------------
 id        | integer                     | not null | nextval('final_index_id_seq'::regclass)
 country   | text                        | not null |
 index     | numeric(5,2)                | not null |
 timestamp | timestamp without time zone | not null |

-- International news feed
Table "public.news_feed"
 Column       | Type                     | Nullable | Default
--------------+--------------------------+----------+---------------------------------------
 id           | integer                  | not null | nextval('news_feed_id_seq'::regclass)
 title        | text                     | not null |
 url          | text                     | not null |
 source       | text                     |          |
 published_at | timestamp with time zone |          |
```

---

# Features & Modules

### Global Map Visualization

- **Tension Layer**: Dynamic choropleth map based on the calculated index.
- **Military Aircraft**: Real-time tracking of military assets (via ADS-B).
- **Naval Vessels**: Live monitoring of naval movements and strategic ships (via AIS).
- **HUD Interface**: Custom popups displaying technical data (MMSI, ICAO, Heading, Speed).

### News Tracker

- Aggregates **50+ international news feeds** every 2 minutes.
- **Tone Integration**: Real-time sentiment display on GDELT news items to identify critical alerts immediately.

### Monitoring Center

- **Live TV**: Direct streams from France 24, Sky News, Bloomberg, Al Jazeera, and more.
- **World Cams**: Live public camera feeds from strategic locations (Ukraine, Middle East, etc.) with search and focus capabilities.

### Time-Based Filtering

Several modules allow filtering data by **time period**.

Available time windows include:

- Last 15 minutes
- Last hour
- Last day
- Last week

For example, on the map users can display **tension indexes calculated over different time ranges**, allowing them to observe whether a geopolitical event is **recent, persistent, or fading**.

---

# Coming Soon ?

- **Points of Interest (POI)**: Strategic mapping of military bases, nuclear facilities, and embassies.
- **Smart Alerts**: Notifications triggered by rapid tension index spikes or specific keyword detection.

---

# Disclaimer

ThirdEye only uses **publicly available OSINT data sources**. This project is a personal project intended for research, data visualization experiments, and geopolitical exploration.

```

```
