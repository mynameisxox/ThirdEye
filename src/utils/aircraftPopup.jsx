export function createAircraftPopupHTML(p) {
    {/* Returns popup content */ }

    return `
  <div class="font-mono text-[11px] bg-[#0b0b0c] text-gray-300 p-3 rounded-lg border border-white/5 min-w-[180px]">

    <div class="text-amber-500 font-bold text-xs tracking-widest mb-0.5">
      ${p.callsign || "UNKNOWN"}
    </div>

    <div class="text-[10px] text-gray-400 mb-2 tracking-wide">
      ${p.aircraft}
    </div>

    <div class="grid grid-cols-[40px_1fr] gap-y-1 text-[10px] tracking-wider">

      <span class="text-gray-500">HEX</span>
      <span class="text-gray-300">${p.icao}</span>

      <span class="text-gray-500">TYPE</span>
      <span class="text-gray-300">${p.type}</span>

      <span class="text-gray-500">ALT</span>
      <span class="text-gray-300">${p.altitude ? Number(p.altitude).toLocaleString() + " ft" : "—"}</span>

      <span class="text-gray-500">SPD</span>
      <span class="text-gray-300">${p.speed ? p.speed + " kt" : "—"}</span>

    </div>

  </div>
  `;
}