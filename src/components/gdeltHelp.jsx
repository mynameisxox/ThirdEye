import { HelpCircle } from "lucide-react";

export default function GDELTHelp() {
    return(
        <div className="relative group">
                            <HelpCircle size={20} className="text-white/40 hover:text-white/50 cursor-help transition-colors" />

                            <div className="absolute right-0 top-6 w-64 p-3 bg-[#0a0a0a] border border-white/10 rounded shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[60]">
                                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                                    About GDELT Intelligence
                                </div>
                                <div className="text-[9px] leading-relaxed text-white/60 font-sans normal-case">
                                    <p className="mb-2">
                                        <strong className="text-white/90">Standard Feed:</strong> Curated global news from major verified press agencies, updated every 2 minutes.
                                    </p>
                                    <p>
                                        <strong className="text-white/90">GDELT DB:</strong> Real-time global database monitor, updated every 15 minutes. Articles get their average tne calculated, they are auto-filtered for <span className="text-red-400/80">Geopolitical Tension</span> (War, Conflict, Attacks), categorized by machine learning themes and <strong>their titltes are parsed</strong>.
                                    </p>
                                </div>
                                
                                <div className="absolute -top-1 right-1 w-2 h-2 bg-[#0a0a0a] border-t border-l border-white/10 rotate-45"></div>
                            </div>
                        </div>
    )
}