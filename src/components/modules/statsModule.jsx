import { useState, useEffect, useRef, useCallback } from "react";
import { X, Maximize2, Minimize2, GripHorizontal, BarChart2 } from "lucide-react";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { nameToIso3 } from "../../utils/iso3Converter";


const API_URL = "http://localhost:8000";
const DEFAULT_POS = { x: 64, y: 16 };

const PERIODS_TOP = ["15min", "1h", "1d", "1w"];
const PERIODS_HISTORY = ["1h", "1d", "1w", "1m"];

function tensionColor(index) {
    if (index >= 60) return "#a01414";
    if (index >= 40) return "#b43c0a";
    if (index >= 15) return "#b46400";
    return "#a08c00";
}

function formatTimestamp(isoStr, period) {
    const d = new Date(isoStr);
    if (period === "1h") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (period === "1d") return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-black/90 border border-white/10 rounded px-3 py-2 text-[10px] font-mono">
            <div className="text-white/40 mb-1">{label}</div>
            <div className="text-amber-400">{payload[0].value.toFixed(1)}</div>
        </div>
    );
};

export default function StatsModule({ selectedCountry, onClose }) {
    const [tab, setTab] = useState("top");
    const [periodTop, setPeriodTop] = useState("1d");
    const [periodHist, setPeriodHist] = useState("1w");
    const [histCountry, setHistCountry] = useState(selectedCountry || "");
    const [topData, setTopData] = useState([]);
    const [histData, setHistData] = useState([]);
    const [loadingTop, setLoadingTop] = useState(false);
    const [loadingHist, setLoadingHist] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [pos, setPos] = useState(DEFAULT_POS);
    const dragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const [size, setSize] = useState({ width: 520, height: 380 });
    const resizing = useRef(false);

    // Resize 
    const onResizeMouseDown = (e) => {
        e.stopPropagation();
        resizing.current = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startSize = { ...size };

        const onMouseMove = (e) => {
            if (!resizing.current) return;
            setSize({
                width: Math.max(420, startSize.width + (e.clientX - startX)),
                height: Math.max(300, startSize.height + (e.clientY - startY)),
            });
        };
        const onMouseUp = () => { resizing.current = false; };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    // Sync selectedCountry → histCountry
    useEffect(() => {
        if (selectedCountry) setHistCountry(nameToIso3(selectedCountry));
    }, [selectedCountry]);

    // Fetch top 10
    const fetchTop = useCallback(async () => {
        setLoadingTop(true);
        try {
            const res = await fetch(`${API_URL}/stats/top?period=${periodTop}&limit=10`);
            const data = await res.json();
            setTopData(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch top stats:", e);
        } finally {
            setLoadingTop(false);
        }
    }, [periodTop]);

    // Fetch history
    const fetchHistory = useCallback(async () => {
        if (!histCountry) return;
        setLoadingHist(true);
        try {
            const res = await fetch(`${API_URL}/stats/history?country=${histCountry}&period=${periodHist}`);
            const data = await res.json();
            setHistData(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch history:", e);
        } finally {
            setLoadingHist(false);
        }
    }, [histCountry, periodHist]);

    useEffect(() => { fetchTop(); }, [fetchTop]);
    useEffect(() => { if (tab === "history") fetchHistory(); }, [tab, fetchHistory]);

    // Drag
    const onHeaderMouseDown = (e) => {
        if (e.target.closest("button") || e.target.closest("input")) return;
        dragging.current = true;
        dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
        document.body.style.userSelect = "none";
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        };
        const onMouseUp = () => {
            dragging.current = false;
            document.body.style.userSelect = "";
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    return (
        <div
            className="absolute z-60 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 flex flex-col"
            style={{
                left: pos.x,
                top: pos.y,
                width: expanded ? 720 : size.width,
                height: expanded ? 500 : size.height,
            }}
        >
            {/* Header */}
            <div
                onMouseDown={onHeaderMouseDown}
                className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 cursor-grab active:cursor-grabbing shrink-0 select-none"
            >
                <div className="flex items-center gap-3">
                    <GripHorizontal size={13} className="text-white/20" />
                    <BarChart2 size={13} className="text-amber-400/60" />
                    <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/50">
                        Stats
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="text-white/25 hover:text-white/60 transition-colors"
                    >
                        {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="text-white/25 hover:text-red-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            <div className="flex border-b border-white/5 shrink-0  select-none">
                {[["top", "TOP 10"], ["history", "HISTORY"]].map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex-1 py-2 text-[9px] font-mono tracking-widest uppercase transition-colors ${tab === id
                                ? "text-amber-400 border-b border-amber-400"
                                : "text-white/25 hover:text-white/50"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden select-none  flex flex-col px-4 py-3 gap-3">

                {tab === "top" && (
                    <>
                        {/* Period selector */}
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[8.5px] font-mono text-white/20 tracking-widest">PERIOD</span>
                            {PERIODS_TOP.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriodTop(p)}
                                    className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${periodTop === p
                                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                            : "text-white/25 hover:text-white/50 border border-transparent"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="flex-1">
                            {loadingTop ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-5 h-5 border border-white/10 border-t-amber-500 rounded-full animate-spin" />
                                </div>
                            ) : topData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-[10px] font-mono text-white/20 tracking-widest">
                                    NO DATA
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={topData}
                                        layout="vertical"
                                        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                                    >
                                        <XAxis
                                            type="number"
                                            domain={[0, 100]}
                                            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="country"
                                            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "monospace" }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={36}
                                        />
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            cursor={{ fill: "rgba(255,255,255,0.03)" }}
                                        />
                                        <Bar dataKey="index" radius={[0, 3, 3, 0]} maxBarSize={14}>
                                            {topData.map((entry, i) => (
                                                <Cell key={i} fill={tensionColor(entry.index)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </>
                )}

                {tab === "history" && (
                    <>
                        {/* Controls */}
                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[8.5px] font-mono text-white/20 tracking-widest">COUNTRY</span>
                                <input
                                    type="text"
                                    value={histCountry}
                                    onChange={e => setHistCountry(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === "Enter" && fetchHistory()}
                                    placeholder="ISO3"
                                    maxLength={3}
                                    className="w-14 px-2 py-0.5 text-[10px] font-mono uppercase bg-white/5 border border-white/10 rounded text-white/70 placeholder-white/15 focus:outline-none focus:border-amber-500/40"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8.5px] font-mono text-white/20 tracking-widest">PERIOD</span>
                                {PERIODS_HISTORY.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriodHist(p)}
                                        className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${periodHist === p
                                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                                : "text-white/25 hover:text-white/50 border border-transparent"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Line chart */}
                        <div className="flex-1">
                            {loadingHist ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-5 h-5 border border-white/10 border-t-amber-500 rounded-full animate-spin" />
                                </div>
                            ) : histData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-[10px] font-mono text-white/20 tracking-widest">
                                    {histCountry ? `NO DATA FOR ${histCountry}` : "ENTER A COUNTRY CODE"}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={histData.map(d => ({
                                            ...d,
                                            label: formatTimestamp(d.timestamp, periodHist)
                                        }))}
                                        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                                    >
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace" }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: "monospace" }}
                                            axisLine={false}
                                            tickLine={false}
                                            width={28}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => (
                                                <CustomTooltip active={active} payload={payload} label={label} period={periodHist} />
                                            )}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="index"
                                            stroke="#b46400"
                                            strokeWidth={1.5}
                                            dot={false}
                                            activeDot={{ r: 3, fill: "#b46400", strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </>
                )}

            </div>

            {/* Resize Handle */}
            {!expanded && (
                <div
                    onMouseDown={onResizeMouseDown}
                    className="absolute bottom-1 right-1 w-5 h-5 cursor-se-resize opacity-40 hover:opacity-80"
                >
                    <svg viewBox="0 0 10 10" className="w-full h-full opacity-50">
                        <path d="M0 10 L10 0" stroke="white" strokeWidth="1" />
                        <path d="M4 10 L10 4" stroke="white" strokeWidth="1" />
                        <path d="M8 10 L10 8" stroke="white" strokeWidth="1" />
                    </svg>
                </div>
            )}
        </div>
    );
}