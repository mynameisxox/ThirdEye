import { useState, useEffect, useRef, useCallback } from "react";
import { nameToIso3 } from "../utils/iso3Converter.jsx";
import { Hexagon, Search, X } from "lucide-react";

const API_URL = "http://localhost:8000";

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function matchesCountry(article, countryName) {
    if (!countryName) return true;
    const text = `${article.title} ${article.description || ""}`;
    var iso3 = nameToIso3(countryName);
    if (countryName == "United Kingdom") {
        iso3 = "UK";
    }
    return (
        text.toLowerCase().includes(countryName.toLowerCase()) ||
        text.includes(iso3) ||
        text.includes(iso3.slice(0, 2))
    );
}

export default function NewsTracker({ selectedCountry, onClearCountry }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const intervalRef = useRef(null);

    const fetchNews = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/news?limit=200`);
            const data = await res.json();
            setArticles(Array.isArray(data) ? data : []);
            setLastUpdate(new Date());
        } catch (e) {
            console.error("Failed to fetch news:", e);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
        intervalRef.current = setInterval(fetchNews, 2 * 60 * 1000);
        return () => clearInterval(intervalRef.current);
    }, [fetchNews]);

    const filtered = selectedCountry
        ? articles.filter(a => matchesCountry(a, selectedCountry))
        : articles;

    return (
        <div className="h-full bg-primary border-l border-white/5 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-white/5 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold tracking-[0.2em] uppercase text-white/90">
                        News Tracker
                    </span>
                    <span className="flex items-center gap-2 text-xs tracking-[0.12em] text-red-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        LIVE
                    </span>
                </div>

                <div className="text-[9px] font-mono text-white/30 tracking-wide">
                    {lastUpdate
                        ? `Updated ${timeAgo(lastUpdate)} · 2 minutes refresh rate`
                        : "Connecting..."}
                </div>

                {selectedCountry && (
                    <div className="flex flex-row items-center pt-2 gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <Hexagon size={14} /> {selectedCountry}
                        </div>
                        <button
                            onClick={onClearCountry}
                            className="text-secondary hover:text-red-400 transition-colors"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>

            {/* All news */}
            <div className="flex-1 overflow-y-auto scrollbar-modern">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <div className="w-5 h-5 border border-white/10 border-t-amber-500 rounded-full animate-spin" />
                        <span className="text-[9px] font-mono text-white/30 tracking-widest">
                            LOADING NEWS...
                        </span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-[10px] font-mono text-white/20 tracking-widest leading-6">
                        NO ARTICLES FOUND
                        <br />
                        {selectedCountry ? `FOR "${selectedCountry.toUpperCase()}"` : ""}
                    </div>
                ) : (
                    filtered.map((article, i) => (
                        <a
                            key={article.id ?? i}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[8.5px] font-mono tracking-widest uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                    {article.source}
                                </span>
                                <span className="text-[8.5px] font-mono text-white/30">
                                    {timeAgo(article.published_at)}
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
                <span>{articles.length} ARTICLES</span>
                <span>REFRESH 2MIN</span>
            </div>
        </div>
    );
}