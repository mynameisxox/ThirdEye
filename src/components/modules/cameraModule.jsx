import { useState, useRef, useEffect } from "react";
import { X, Maximize2, Minimize2, GripHorizontal, Search, Camera } from "lucide-react";

const CAMERAS = [
    {id: "ukraine1", label: "Ukraine", location: "...", country: "Ukraine", flag: "🇺🇦", videoId: "R-qCsZ1obbc"},
    { id: "middleeast-iran-israel-syria", label:"Middle East",location:  "Iran/Israel/Syria",flag: "🇮🇷 🇮🇱 🇸🇾", videoId: "gmtlJ_m2r5A" },
    {id: "ukraine2", label: "Ukraine", location: "Kharkiv/Donetsk/Kyiv/Sumy", country: "Ukraine", flag: "🇺🇦", videoId: "11mdFpvFvqU"},
    { id: "middleeast-lebanon-israel-jerusalem", label:"Middle East",location: "Beirut/Tel Aviv/Jerusalem", country: "Lebanon/Israel/Jerusalem", flag: "🇱🇧 🇮🇱", videoId: "i2lzz1epI44" },
    { id: "ukraine3", label: "Ukraine", location:"Kyiv/Odessa/Kharkiv/Kramatorsk/Sloviansk/Donetsk/Dnipro",country:"Ukraine", flag: "🇺🇦",  videoId: "e2gC37ILQmk" },
    { id: "middleeast-iran-israel-lebanon", label:"Middle East",location:  "Iran/Israel/Lebanon",flag: "🇱🇧 🇮🇷 🇮🇱", videoId: "4E-iFtUM2kk" },
    //{ id: "iss", label: "Space station", location: "Orbite", country: "Space", flag: "🌍", videoId: "vytmBNhc9ig" },
    //{ id: "jackson", label: "Town Square", location: "Jackson Hole", country: "États-Unis", flag: "🇺🇸", videoId: "1EiC9bvVGnk" },
    
];

const DEFAULT_POS = { x: 80, y: 40 };

export default function CameraModule({ onClose }) {
    const [focused, setFocused] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [pos, setPos] = useState(DEFAULT_POS);
    const [size, setSize] = useState({ width: 680, height: 480 });

    const dragging = useRef(false);
    const resizing = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const panelRef = useRef(null);

    const onHeaderMouseDown = (e) => {
        if (e.target.closest("button") || e.target.closest("input")) return;

        dragging.current = true;
        dragOffset.current = {
            x: e.clientX - pos.x,
            y: e.clientY - pos.y,
        };
        document.body.style.userSelect = "none";
    };

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!dragging.current) return;
            setPos({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            });
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

    const onResizeMouseDown = (e) => {
        e.stopPropagation();
        resizing.current = true;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const onMouseMove = (e) => {
            if (!resizing.current) return;

            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);

            setSize({
                width: Math.max(480, newWidth),
                height: Math.max(360, newHeight),
            });
        };

        const onMouseUp = () => {
            resizing.current = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const width = expanded ? 960 : size.width;
    const height = expanded ? 640 : size.height;

    const focusedCamera = CAMERAS.find((c) => c.id === focused);

    const filteredCameras = CAMERAS.filter(c => {
    const query = searchQuery.toLowerCase();
    
    const label = (c.label || "").toLowerCase();
    const country = (c.country || "").toLowerCase();
    const location = (c.location || "").toLowerCase();

    return label.includes(query) || 
           country.includes(query) || 
           location.includes(query);
});

    return (
        <div
            ref={panelRef}
            className="absolute z-60 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 flex flex-col"
            style={{
                left: pos.x,
                top: pos.y,
                width,
                height,
            }}
        >
            {/* Header */}
            <div
                onMouseDown={onHeaderMouseDown}
                className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 cursor-grab active:cursor-grabbing shrink-0 select-none"
            >
                <div className="flex items-center gap-3">
                    <GripHorizontal size={13} className="text-white/20" />
                    <Camera size={13} className="text-emerald-400" />
                    
                    <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/50">
                        World Cams
                    </span>

                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-500 tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                    </span>

                    {focused && (
                        <button
                            onClick={() => setFocused(null)}
                            className="text-[9px] font-mono text-amber-400/70 hover:text-amber-400 transition-colors tracking-wider ml-2"
                        >
                            ← Back to all cams
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {!focused && (
                        <div className="relative group flex items-center">
                            <Search size={12} className="absolute left-2 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search (e.g.: Ukraine, Lebanon...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-md py-1 pl-6 pr-2 text-[10px] text-white/80 font-mono placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all w-48"
                            />
                        </div>
                    )}

                    <button
                        onClick={() => setExpanded((e) => !e)}
                        className="text-white/25 hover:text-white/60 transition-colors ml-2"
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

            {/* Content */}
            <div className="flex-1 overflow-hidden select-none bg-black/50">
                {focusedCamera ? (
                    <div className="w-full h-full relative">
                        <iframe
                            src={`https://www.youtube.com/embed/${focusedCamera.videoId}?autoplay=1&mute=0&live=1`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                            allowFullScreen
                        />
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md flex flex-col pointer-events-none">
                            <span className="text-[10px] font-mono tracking-wider text-white uppercase">
                                {focusedCamera.flag} {focusedCamera.label}
                            </span>
                            <span className="text-[9px] font-mono text-white/50">
                                {focusedCamera.location}, {focusedCamera.country}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[1fr] h-full gap-1 p-1 overflow-y-auto scrollbar-modern">
                        {filteredCameras.length > 0 ? (
                            filteredCameras.map((camera) => (
                                <div
                                    key={camera.id}
                                    className="relative group bg-black overflow-hidden cursor-pointer rounded-sm min-h-[140px]"
                                    onClick={() => setFocused(camera.id)}
                                >
                                    <iframe
                                        src={`https://www.youtube.com/embed/${camera.videoId}?autoplay=1&mute=1&controls=0`}
                                        className="w-full h-[140%] -top-[20%] relative pointer-events-none"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                        allowFullScreen
                                    />

                                    <div className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono tracking-wider text-white/90 uppercase truncate pr-2">
                                                {camera.flag} {camera.location}
                                            </span>
                                            <span className="text-[8px] font-mono text-emerald-400/80 tracking-widest shrink-0">
                                                LIVE
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-mono text-white/40 truncate">
                                            {camera.label}
                                        </span>
                                    </div>

                                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-150 flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono tracking-widest text-white/90 bg-black/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded">
                                           CLICK TO FOCUS 
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full h-full flex flex-col items-center justify-center text-white/30 space-y-3">
                                <Camera size={32} className="opacity-50" />
                                <span className="text-xs font-mono uppercase tracking-widest">No cameras found</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Resize handle */}
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