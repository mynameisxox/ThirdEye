import { useState, useEffect, useRef, useCallback } from "react";
import { nameToIso3 } from "../utils/iso3Converter.jsx";
import { Hexagon, X, Activity, Filter, ChevronDown, Check } from "lucide-react";
import GDELTHelp from "./gdeltHelp.jsx";

const API_URL = "http://localhost:2209";

const GDELT_THEMES = [
    "WAR", "TERROR", "ATTACK", "KILLING",
    "ARMEDCONFLICT", "SEIGE", "BLOCKADE", "WMD", "DRONES"
];

function timeAgo(dateStr, now) {
    if (!dateStr) return "...";
    const diff = (now - new Date(dateStr)) / 1000;
    if (diff < 5) return "just now";
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function matchesCountry(article, countryName) {
    if (!countryName) return true;
    const text = `${article.title} ${article.description || ""}`;
    let iso3 = nameToIso3(countryName);
    if (countryName === "United Kingdom") iso3 = "UK";
    return (
        text.toLowerCase().includes(countryName.toLowerCase()) ||
        text.includes(iso3) ||
        (iso3 ? text.includes(iso3.slice(0, 2)) : false)
    );
}

export default function NewsTracker({ selectedCountry, onClearCountry }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [showGdelt, setShowGdelt] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(null);

    const [isThemePopupOpen, setIsThemePopupOpen] = useState(false);
    const popupRef = useRef(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/news/feed?limit=500`;
            if (showGdelt) {
                url = `${API_URL}/news/gdelt?limit=500`;
                if (selectedTheme) url += `&theme=${selectedTheme}`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setArticles(Array.isArray(data) ? data : []);
            setLastUpdate(new Date());
            setNow(Date.now());
        } catch (e) {
            console.error("Failed to fetch news:", e);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, [showGdelt, selectedTheme]);

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    useEffect(() => {
        const tick = setInterval(() => setNow(Date.now()), 5000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsThemePopupOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = selectedCountry
        ? articles.filter(a => matchesCountry(a, selectedCountry))
        : articles;

    return (
        <div className="h-full bg-primary border-l border-white/5 flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="px-5 pt-4 border-b border-white/5 shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-base font-bold tracking-[0.2em] uppercase text-white/90">
                        News Tracker
                    </span>
                    <span className="flex items-center gap-2 text-xs tracking-[0.12em] text-red-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        LIVE
                    </span>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-white/30 tracking-wide">
                    <span>
                        {lastUpdate ? `Updated ${timeAgo(lastUpdate, now)}` : "Connecting..."}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowGdelt(!showGdelt)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors border ${showGdelt
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-white/5 border-white/10 hover:bg-white/10 text-white/50"
                                }`}
                        >
                            <Activity size={10} />
                            GDELT DB
                        </button>

                        <GDELTHelp />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2">
                    {selectedCountry && (
                        <div className="flex items-center gap-1 group">
                            <div className="inline-flex items-center gap-2 px-2 py-1 text-[9px] uppercase tracking-wider font-semibold rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                <Hexagon size={12} /> {selectedCountry}
                            </div>
                            <button onClick={onClearCountry} className="text-white/20 hover:text-red-400">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {showGdelt && (
                        <div className="relative pb-3" ref={popupRef}>
                            <button
                                onClick={() => setIsThemePopupOpen(!isThemePopupOpen)}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-[9px] font-mono tracking-widest border transition-all ${selectedTheme
                                    ? "bg-emerald-500 border-emerald-500 text-black font-bold"
                                    : "bg-black border-white/10 text-white/50 hover:border-emerald-500/50"
                                    }`}
                            >
                                <Filter size={12} color="#00ffaa" />
                                {selectedTheme || "FILTER BY THEME"}
                                <ChevronDown size={10} className={`transition-transform ${isThemePopupOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Popup Menu */}
                            {isThemePopupOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 rounded shadow-2xl z-50 py-1 overflow-hidden">
                                    <div className="px-3 py-2 border-b border-white/5 text-[8px] text-white/30 uppercase tracking-[0.2em] font-bold">
                                        Select Theme
                                    </div>
                                    <div className="max-h-60 overflow-y-auto scrollbar-modern">
                                        <button
                                            onClick={() => { setSelectedTheme(null); setIsThemePopupOpen(false); }}
                                            className="w-full flex items-center justify-between px-3 py-2 text-[10px] text-white/60 hover:bg-emerald-500 hover:text-black transition-colors font-mono uppercase tracking-widest"
                                        >
                                            All Themes {!selectedTheme && <Check size={10} />}
                                        </button>
                                        {GDELT_THEMES.map(theme => (
                                            <button
                                                key={theme}
                                                onClick={() => { setSelectedTheme(theme); setIsThemePopupOpen(false); }}
                                                className={`w-full flex items-center justify-between px-3 py-2 text-[10px] transition-colors font-mono uppercase tracking-widest ${selectedTheme === theme
                                                    ? "bg-emerald-500/20 text-emerald-400 font-bold"
                                                    : "text-white/60 hover:bg-white/5"
                                                    }`}
                                            >
                                                {theme}
                                                {selectedTheme === theme && <Check size={10} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* List of articles */}
            <div className="flex-1 overflow-y-auto scrollbar-modern">
                {loading && articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className={`w-5 h-5 border border-white/10 rounded-full animate-spin ${showGdelt ? 'border-t-emerald-500' : 'border-t-amber-500'}`} />
                        <span className="text-[9px] font-mono text-white/30 tracking-widest uppercase">
                            {showGdelt ? 'Scanning GDELT...' : 'Loading News...'}
                        </span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-[10px] font-mono text-white/20 tracking-widest leading-6 uppercase">
                        No articles found
                        <br />
                        {selectedCountry ? `for "${selectedCountry}"` : ""}
                    </div>
                ) : (
                    filtered.map((article, i) => (
                        <a
                            key={article.id ?? i}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-150 group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8.5px] font-mono tracking-widest uppercase px-2 py-0.5 rounded ${showGdelt ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                        {article.source.substring(0, 25)}
                                    </span>

                                    {showGdelt && article.avg_tone !== undefined && (
                                        <span className={`text-[8.5px] font-mono font-bold px-1.5 border-l border-white/10 ${article.avg_tone <= -4 ? 'text-red-500' :
                                                article.avg_tone <=-1 ? 'text-amber-500/80' :
                                                    'text-emerald-500/60'
                                            }`}>
                                            {article.avg_tone > 0 ? `+${article.avg_tone}` : article.avg_tone}
                                        </span>
                                    )}
                                </div>

                                <span className="text-[8.5px] font-mono text-white/30 group-hover:text-white/50 transition-colors">
                                    {timeAgo(article.published_at, now)}
                                </span>
                            </div>
                            <div className="text-sm font-semibold text-white/80 leading-snug hover:text-white transition-colors">
                                {article.title}
                            </div>
                        </a>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2 border-t border-white/5 flex items-center justify-between text-[8.5px] font-mono text-white/20 tracking-wider shrink-0">
                <span>{articles.length} {showGdelt ? 'GDELT ' : ''}ARTICLES</span>
                <span>REFRESH 2MIN</span>
            </div>
        </div>
    );
}