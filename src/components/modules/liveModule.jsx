import { useState, useRef, useEffect } from "react";
import { X, Maximize2, Minimize2, GripHorizontal } from "lucide-react";

const CHANNELS = [
    { id: "france24", label: "France 24", flag: "🇫🇷", videoId: "l8PMl7tUDIE" },
    { id: "skynews", label: "Sky News", flag: "🇬🇧", videoId: "YDvsBbKfLPA" },
    { id: "bloomberg", label: "Bloomberg", flag: "🇺🇸", videoId: "iEpJwprxDdk" },
    { id: "dw", label: "DW News", flag: "🇩🇪", videoId: "LuKwFajn37U" },
    { id: "aljazeera", label: "Al Jazeera", flag: "🇶🇦", videoId: "gCNeDWCI0vo" },
    { id: "euronews", label: "Euronews", flag: "🇪🇺", videoId: "pykpO5kQJ98" },
];

const DEFAULT_POS = { x: 64, y: 16 };

export default function LiveModule({ onClose }) {
    const [focused, setFocused] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const [pos, setPos] = useState(DEFAULT_POS);
    const [size, setSize] = useState({ width: 620, height: 420 });

    const dragging = useRef(false);
    const resizing = useRef(false);

    const dragOffset = useRef({ x: 0, y: 0 });

    const panelRef = useRef(null);

    const onHeaderMouseDown = (e) => {
        if (e.target.closest("button")) return;

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
                width: Math.max(420, newWidth),
                height: Math.max(300, newHeight),
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

    const width = expanded ? 900 : size.width;
    const height = expanded ? 620 : size.height;

    const focusedChannel = CHANNELS.find((c) => c.id === focused);

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

                    <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/50">
                        Live TV
                    </span>

                    <span className="flex items-center gap-1.5 text-[9px] font-mono text-red-500 tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        ON AIR
                    </span>

                    {focused && (
                        <button
                            onClick={() => setFocused(null)}
                            className="text-[9px] font-mono text-amber-400/70 hover:text-amber-400 transition-colors tracking-wider"
                        >
                            ← ALL CHANNELS
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setExpanded((e) => !e)}
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

            {/* Content */}
            <div className="flex-1 overflow-hidden select-none">
                {focusedChannel ? (
                    <div className="w-full h-full">
                        <iframe
                            src={`https://www.youtube.com/embed/${focusedChannel.videoId}?autoplay=1&mute=0`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-3 grid-rows-2 h-full gap-px bg-white/5">
                        {CHANNELS.map((channel) => (
                            <div
                                key={channel.id}
                                className="relative group bg-black overflow-hidden cursor-pointer"
                                onClick={() => setFocused(channel.id)}
                            >
                                <iframe
                                    src={`https://www.youtube.com/embed/${channel.videoId}?autoplay=1&mute=1`}
                                    className="w-full h-full pointer-events-none"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />

                                {/* Channel label */}
                                <div className="absolute top-0 left-0 right-0 px-2 py-1.5 bg-linear-to-t from-black/80 to-transparent flex items-center justify-between">
                                    <span className="text-[9px] font-mono tracking-wider text-white/70 uppercase">
                                        {channel.flag} {channel.label}
                                    </span>

                                    <span className="text-[8px] font-mono text-red-400/70 tracking-widest">
                                        LIVE
                                    </span>
                                </div>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-150 flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono tracking-widest text-white/80 bg-black/60 px-3 py-1 rounded">
                                        CLICK TO FOCUS
                                    </span>
                                </div>
                            </div>
                        ))}
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