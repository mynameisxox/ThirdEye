import { useState } from "react";
import { Tv, BarChart2, PlaneTakeoff, Anchor, Video, Bell } from "lucide-react";
import LiveModule from "./modules/liveModule.jsx";
import StatsModule from "./modules/statsModule.jsx";
import CameraModule from "./modules/cameraModule.jsx";
import ComingSoon from "./modules/comingSoonModule.jsx";

const OVERLAY_MODULES = new Set(["live", "stats", "camera", "alerts"]);
const TOGGLE_MODULES = new Set(["aircraft", "naval"]);

const MODULES = [
    { id: "live",     icon: Tv,           label: "LIVE TV"  },
    { id: "stats",    icon: BarChart2,    label: "STATS"    },
    { id: "aircraft", icon: PlaneTakeoff, label: "AIRCRAFT" },
    { id: "naval",    icon: Anchor,       label: "NAVAL"    },
    { id: "camera",   icon: Video,        label: "CAMERA"   },
    { id: "alerts",   icon: Bell,        label: "ALERTS"   },
];

export default function ModuleToolbar({ selectedCountry, onAircraftToggle, onNavalToggle, navalLoading }) {
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [toggles, setToggles] = useState({ aircraft: false, naval: false });

    const handle = (id) => {
        if (TOGGLE_MODULES.has(id)) {
            const next = !toggles[id];
            setToggles(prev => ({ ...prev, [id]: next }));
            if (id === "aircraft") onAircraftToggle?.(next);
            if (id === "naval")    onNavalToggle?.(next);
        } else {
            setActiveOverlay(prev => prev === id ? null : id);
        }
    };

    const isActive = (id) => TOGGLE_MODULES.has(id) ? toggles[id] : activeOverlay === id;

    return (
        <>
            {/* VERTICAL TOOLBAR */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
                {MODULES.map(({ id, icon: Icon, label }) => {
                    const active = isActive(id);
                    return (
                        <button
                            key={id}
                            onClick={() => handle(id)}
                            title={label}
                            className={`
                                group relative flex items-center justify-center
                                w-9 h-9 rounded-lg border transition-all duration-200 select-none
                                ${active
                                    ? "bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-500/10"
                                    : "bg-black/40 border-white/10 text-white/30 hover:border-white/25 hover:text-white/60 hover:bg-white/5"
                                }
                            `}
                        >
                            <Icon size={15} strokeWidth={1.8} />
                            <span className="
                                pointer-events-none absolute left-11 px-2 py-1
                                text-[9px] font-mono tracking-widest uppercase
                                bg-black/80 border border-white/10 rounded text-white/70
                                opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                whitespace-nowrap
                            ">
                                {label}
                            </span>
                            {/* Loading spinner for naval module */}
                            {id === "naval" && active && navalLoading ? (
                                <span className="absolute -right-1 -top-1 w-2 h-2">
                                    <span className="block w-2 h-2 rounded-full border border-amber-400 border-t-transparent animate-spin" />
                                </span>
                            ) : active ? (
                                <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-amber-400 shadow shadow-amber-400/50" />
                            ) : null}
                        </button>
                    );
                })}
            </div>

            {/* OVERLAYS */}
            {activeOverlay === "live" && (
                <LiveModule onClose={() => setActiveOverlay(null)} />
            )}
            {activeOverlay === "stats" && (
                <StatsModule
                    selectedCountry={selectedCountry}
                    onClose={() => setActiveOverlay(null)}
                />
            )}
            {activeOverlay === "camera" && (
                <CameraModule onClose={() => setActiveOverlay(null)} />
            )}
            {activeOverlay === "alerts" && (
                <ComingSoon label="ALERTS" onClose={() => setActiveOverlay(null)} />
            )}
        </>
    );
}