const MILITARY_AIRCRAFT = {
    // Fighters
    F14: "Grumman F-14 Tomcat",
    F15: "McDonnell Douglas F-15 Eagle",
    F16: "General Dynamics F-16 Fighting Falcon",
    F18: "McDonnell Douglas F/A-18 Hornet",
    F22: "Lockheed Martin F-22 Raptor",
    F35: "Lockheed Martin F-35 Lightning II",
    F4: "McDonnell Douglas F-4 Phantom II",
    F5: "Northrop F-5 Tiger",
    F104: "Lockheed F-104 Starfighter",
    F111: "General Dynamics F-111 Aardvark",

    // Russian fighters
    MIG21: "Mikoyan-Gurevich MiG-21",
    MIG23: "Mikoyan-Gurevich MiG-23",
    MIG29: "Mikoyan-Gurevich MiG-29",
    MIG31: "Mikoyan-Gurevich MiG-31 Foxhound",
    SU24: "Sukhoi Su-24",
    SU25: "Sukhoi Su-25",
    SU27: "Sukhoi Su-27",
    SU30: "Sukhoi Su-30",
    SU33: "Sukhoi Su-33",
    SU34: "Sukhoi Su-34",
    SU35: "Sukhoi Su-35",
    SU57: "Sukhoi Su-57",

    // European fighters
    M2K: "Dassault Mirage 2000",
    MIR2: "Dassault Mirage 2000",
    RAFA: "Dassault Rafale",
    RFL: "Dassault Rafale",
    EUFI: "Eurofighter Typhoon",
    TYPH: "Eurofighter Typhoon",
    JAS39: "Saab JAS 39 Gripen",
    GRIP: "Saab JAS 39 Gripen",

    // Bombers
    B1: "Rockwell B-1B Lancer",
    B2: "Northrop B-2 Spirit",
    B52: "Boeing B-52 Stratofortress",
    TU95: "Tupolev Tu-95 Bear",
    TU160: "Tupolev Tu-160 Blackjack",

    // Tankers
    KC10: "McDonnell Douglas KC-10 Extender",
    KC135: "Boeing KC-135 Stratotanker",
    KC46: "Boeing KC-46 Pegasus",
    A330MRTT: "Airbus A330 MRTT",

    // Transport
    C17: "Boeing C-17 Globemaster III",
    C130: "Lockheed C-130 Hercules",
    C5: "Lockheed C-5 Galaxy",
    C2: "Grumman C-2 Greyhound",
    C27: "Leonardo C-27J Spartan",
    A400: "Airbus A400M Atlas",
    IL76: "Ilyushin Il-76",

    // Surveillance
    E3: "Boeing E-3 Sentry AWACS",
    E8: "Northrop Grumman E-8 JSTARS",
    E2: "Northrop Grumman E-2 Hawkeye",
    P3: "Lockheed P-3 Orion",
    P8: "Boeing P-8 Poseidon",
    RC135: "Boeing RC-135 Rivet Joint",
    EP3: "Lockheed EP-3 Aries",
    U2: "Lockheed U-2 Dragon Lady",

    // Drones
    MQ1: "General Atomics MQ-1 Predator",
    MQ9: "General Atomics MQ-9 Reaper",
    RQ4: "Northrop Grumman RQ-4 Global Hawk",
    RQ170: "Lockheed Martin RQ-170 Sentinel",
};


export const PLANE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <defs>
    <filter id="plane-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <path
    d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
    fill="#d3d3d3"
    filter="url(#plane-glow)"
  />
</svg>`;

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

export const MILITARY_TYPES = new Set(Object.keys(MILITARY_AIRCRAFT));

export function isMilitaryType(type) {
  if (!type) return false;
  return MILITARY_TYPES.has(type.toUpperCase());
}

export function getAircraftName(type) {
  if (!type) return "Unknown aircraft";
  return MILITARY_AIRCRAFT[type.toUpperCase()] || type.toUpperCase();
}

export function filterMilitary(aircraft) {
  {/* true if can be considered as miliraty aircraft */}
  return aircraft.filter(a => {
    if (a.lon == null || a.lat == null) return false;
    //  const alt = Number(a.alt_baro);
    //  if (!isNaN(alt) && alt < 1000) return false;
    //  const spd = Number(a.gs);
    //  if (!isNaN(spd) && spd < 120) return false;
    return isMilitaryType(a.t);
  });
}