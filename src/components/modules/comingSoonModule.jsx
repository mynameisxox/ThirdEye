import {X } from "lucide-react";

export default function ComingSoon({ label, onClose }) {
    return (
        <div className="absolute top-1/2 left-15 z-40 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 uppercase">{label}</span>
                <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="flex items-center justify-center h-32 text-[10px] font-mono text-white/20 tracking-widest">
                COMING SOON
            </div>
        </div>
    );
}