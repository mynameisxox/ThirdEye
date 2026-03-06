# ThirdEye

**ThirdEye** is an **OSINT dashboard focused on geopolitical events**, built as a personal project inspired by existing tools such as **Glint** and **World Monitor**.

The goal of the project is to explore **how far LIVE OSINT monitoring can be pushed using only open data sources**, while also becoming more familiar with OSINT ecosystems, pipelines, and visualization techniques.

ThirdEye aggregates multiple real-time data sources and displays them through a **global map interface and modular analytical tools**.

<p align="center">
    <img src="https://freeimage.host/i/qo1Iw9S" width="32%" />
    <img src="https://freeimage.host/i/qo1ION9" width="32%" />
    <img src="https://freeimage.host/i/qo1INA7" width="32%" />
</p>

---

# Project Goal

The idea behind ThirdEye is to build a **real-time geopolitical monitoring dashboard** capable of providing a quick overview of global tensions and activity.

The platform focuses on:

- Live OSINT data aggregation
- Geopolitical signal detection
- Real-time visualization
- Modular analysis tools

This project is mainly an **experimental playground for OSINT pipelines and real-time monitoring systems**.

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

# Features

## Global Map Visualization

The main interface displays a **world map with real-time geopolitical signals**.

Current layers include:

- **Country tension indexes**
- **Military aircraft activity**

Users can visualize tension intensity geographically and quickly identify regions experiencing increased geopolitical pressure.

---

## News Tracker

The **News Tracker** continuously aggregates headlines from **25+ international news feeds**.

The feed refreshes **every 2 minutes** and provides a near real-time overview of global events.

This module helps users quickly understand **what is currently happening around the world** without manually monitoring multiple sources.

---

## Time-Based Filtering

Several modules allow filtering data by **time period**.

Available time windows include:

- Last 15 minutes
- Last hour
- Last day
- Last week

For example, on the map users can display **tension indexes calculated over different time ranges**, allowing them to observe whether a geopolitical event is **recent, persistent, or fading**.

---

# Modules

ThirdEye uses a **modular system**, allowing new capabilities to be added without affecting the rest of the platform.

---

## Live TV

The **LIVE TV module** provides continuous news streams from major international broadcasters.

Available channels:

```javascript
const CHANNELS = [
  { id: "france24", label: "France 24", flag: "🇫🇷", videoId: "l8PMl7tUDIE" },
  { id: "skynews", label: "Sky News", flag: "🇬🇧", videoId: "YDvsBbKfLPA" },
  { id: "bloomberg", label: "Bloomberg", flag: "🇺🇸", videoId: "iEpJwprxDdk" },
  { id: "dw", label: "DW News", flag: "🇩🇪", videoId: "LuKwFajn37U" },
  { id: "aljazeera", label: "Al Jazeera", flag: "🇶🇦", videoId: "gCNeDWCI0vo" },
  { id: "euronews", label: "Euronews", flag: "🇪🇺", videoId: "pykpO5kQJ98" },
];
```

This allows users to **monitor live news coverage directly inside the dashboard**.

---

## Stats

The **Stats module** provides analytical views of the tension index.

Current features include:

- **Top 10 countries by tension index**
- **Country-specific tension history**
- **Time period filtering**

---

# Coming Soon

Several features are planned.

---

## Points of Interest

Add strategic **Points of Interest (POI)** on the map to provide additional geopolitical context.

These locations will include:

- **Embassies and diplomatic missions**
- **Military bases**
- **Nuclear facilities**
- **Strategic infrastructure**
- Other geopolitically relevant sites

---

## Alerts

Custom alerts based on:

- Specific **tension thresholds**
- **Keywords detected in news feeds**
- Rapid **changes in country tension index**

This would allow users to receive notifications when important events occur.

---

## Satellite

Integration of **satellite imagery sources** to visualize recent satellite captures over regions of interest.

Possible future capabilities:

- Satellite image overlays
- Rapid monitoring of conflict zones
- Satellite imagery timelines

---

## Camera

A module dedicated to **live public camera feeds** around the world.

Examples:

- City surveillance cameras
- Harbor cameras
- Border crossing cameras
- Strategic infrastructure viewpoints

---

# Disclaimer

ThirdEye only uses **publicly available OSINT data sources**.

The project is intended for:

- Research
- Learning
- Data visualization experiments
- OSINT exploration
