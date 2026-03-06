import { useState } from "react";
import { Tv, BarChart2, Bell, Satellite, View } from "lucide-react";
import LiveModule from "./modules/liveModule.jsx";
import StatsModule from "./modules/statsModule.jsx";
import { ComingSoon } from "./modules/comingSoonModule.jsx";

const MODULES = [
    { id: "live",  icon: Tv,        label: "LIVE TV" },
    { id: "stats", icon: BarChart2, label: "STATS" },
    { id: "alerts",icon: Bell,      label: "ALERTS" },
    { id: "satellite",icon: Satellite,      label: "SATELLITE" },
    { id: "camera",icon: View,      label: "CAMERA" },
];

export default function ModuleToolbar({ selectedCountry }) {
    const [activeModules, setActiveModules] = useState(() => new Set());

    const toggle = (id) => {
        setActiveModules(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <>
            {/* Toolbar */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2">
                {MODULES.map(({ id, icon: Icon, label }) => {
                    const isActive = activeModules.has(id);
                    return (
                        <button
                            key={id}
                            onClick={() => toggle(id)}
                            title={label}
                            className={`
                                group relative flex items-center justify-center
                                w-9 h-9 rounded-lg border transition-all duration-200 select-none
                                ${isActive
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
                            {isActive && (
                                <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-amber-400 shadow shadow-amber-400/50" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Overlays */}
            {activeModules.has("live") && (
                <LiveModule onClose={() => toggle("live")} />
            )}
            {activeModules.has("stats") && (
                <StatsModule
                    selectedCountry={selectedCountry}
                    onClose={() => toggle("stats")}
                />
            )}
            {activeModules.has("alerts") && (
                <ComingSoon label="ALERTS" onClose={() => toggle("alerts")} />
            )}
            {activeModules.has("satellite") && (
                <ComingSoon label="SATELLITE" onClose={() => toggle("satellite")} />
            )}
            {activeModules.has("camera") && (
                <ComingSoon label="CAMERA" onClose={() => toggle("camera")} />
            )}
        </>
    );
}
