import React from "react";

const PERIODS = [
  { value: "15min", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "1d", label: "1j" },
  { value: "1w", label: "1w" },
];

export default function PeriodSelector({ period, onChange }) {
  const currentIndex = PERIODS.findIndex((p) => p.value === period);

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4
                    bg-primary backdrop-blur-xl
                    border border-secondary
                    rounded-xl shadow-2xl
                    select-none">

      <span className="text-[10px]
                       text-white/30 font-mono">
        PERIOD
      </span>

      <div className="flex items-center">
        {PERIODS.map((p, i) => {
          const isActive = p.value === period;
          const isPast = i < currentIndex;

          {/* Button for each period */}
          return (
            <React.Fragment key={p.value}>
              {i > 0 && (
                <div
                  className={`w-8 h-0.5 rounded transition-colors duration-300
                    ${isPast || isActive
                      ? "bg-accent/70"
                      : "bg-secondary"}`}
                />
              )}

              <button
                onClick={() => onChange(p.value)}
                className={`
                  relative flex items-center justify-center
                  w-9 h-9 rounded-full
                  transition-all duration-200
                  outline-none

                  ${isActive
                    ? "border border-accent bg-accent/20 shadow-[0_0_12px_rgba(180,150,0,0.4)]"
                    : isPast
                    ? "border border-accent/40 bg-accent/10"
                    : "border border-secondary/90 bg-secondary/35 hover:brightness-125"}
                `}
              >
                <span
                  className={`
                    text-[11px] font-mono font-semibold tracking-wide
                    transition-colors duration-200
                    ${isActive ? "text-accent" : "text-white/30"}
                  `}
                >
                  {p.label}
                </span>

                {isActive && (
                  <span className="absolute -inset-1 rounded-full
                                   border border-accent/40
                                   animate-ping" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}