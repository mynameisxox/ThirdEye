import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './header.jsx';
import MapComponent from './components/map.jsx';
import PeriodSelector from './components/periodSelector.jsx';
import NewsTracker from './components/newsTracker.jsx';
import ModuleToolbar from './components/moduleToolBar.jsx';

const MIN_NEWS_WIDTH     = 240;
const MAX_NEWS_WIDTH     = 560;
const DEFAULT_NEWS_WIDTH = 440;

export default function Home() {
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [period, setPeriod]                   = useState("1d");
    const [tick, setTick]                       = useState(0);
    const [newsWidth, setNewsWidth]             = useState(DEFAULT_NEWS_WIDTH);
    const [aircraftActive, setAircraftActive]   = useState(false);
    const [navalActive, setNavalActive]         = useState(false);
    const [navalLoading, setNavalLoading]       = useState(false);
    const handleAircraftToggle = useCallback((v) => {
        setAircraftActive(v);
    }, []);

    const handleNavalToggle = useCallback((v) => {
        setNavalActive(v);
        if (!v) setNavalLoading(false);
    }, []);
    const dragging = useRef(false);
    const startX   = useRef(0);
    const startW   = useRef(DEFAULT_NEWS_WIDTH);

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 15 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const onMouseDown = useCallback((e) => {
        dragging.current = true;
        startX.current   = e.clientX;
        startW.current   = newsWidth;
        document.body.style.cursor     = "col-resize";
        document.body.style.userSelect = "none";
    }, [newsWidth]);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            const delta    = startX.current - e.clientX;
            const newWidth = Math.min(MAX_NEWS_WIDTH, Math.max(MIN_NEWS_WIDTH, startW.current + delta));
            setNewsWidth(newWidth);
        };
        const onMouseUp = () => {
            dragging.current               = false;
            document.body.style.cursor     = "";
            document.body.style.userSelect = "";
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup",   onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup",   onMouseUp);
        };
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col bg-primary overflow-hidden">
            <Header />
            <main className="flex flex-1 overflow-hidden">
                {/* MAP AREA */}
                <div className="relative flex-1 overflow-hidden">
                    <MapComponent
                        onCountryClick={setSelectedCountry}
                        period={period}
                        tick={tick}
                        aircraftActive={aircraftActive}
                        navalActive={navalActive}
                        onNavalLoading={setNavalLoading}
                    />
                    <ModuleToolbar
                        selectedCountry={selectedCountry}
                        onAircraftToggle={handleAircraftToggle}
                        onNavalToggle={handleNavalToggle}
                        navalLoading={navalLoading}
                    />
                    <div className="absolute bottom-4 left-4">
                        <PeriodSelector period={period} onChange={setPeriod} />
                    </div>
                </div>
                {/* DRAG HANDLE */}
                <div
                    onMouseDown={onMouseDown}
                    className="w-1 shrink-0 bg-white/5 hover:bg-amber-500/40 cursor-col-resize transition-colors duration-150 z-30"
                />
                {/* NEWS PANEL */}
                <div style={{ width: newsWidth }} className="shrink-0 overflow-hidden">
                    <NewsTracker
                        selectedCountry={selectedCountry}
                        onClearCountry={() => setSelectedCountry(null)}
                    />
                </div>
            </main>
        </div>
    );
}