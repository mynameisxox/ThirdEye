// Keywords found in names of military/coast-guard vessels.
// Applied as a secondary filter after MMSI prefix filtering on the backend.
const MILITARY_NAME_KEYWORDS = [
    "HMS", "HMAS", "HMCS", "HMNZS", "HMIS", "HMSS",
    "USS", "USNS", "USCGC",
    "FS ", "FGS", "SPS", "ITS",
    "HNLMS", "HDMS", "HNoMS", "HSwMS", "FNS",
    "EML", "LNS", "LVNS", "KNM", "KDM",
    "TCG", "HS ", "INS", "PNS", "BNS", "CNS",
    "MNS", "KDB", "KRI", "ROKS", "JS ", "ROCS",
    "HMBS", "VOEA", "RFNS", "CGS", "CCGS",

    "COAST GUARD", "COASTGUARD", "GARDE COTE", "GARDE-CÔTE",
    "GUARDIA COSTIERA", "GUARDIA COSTERA", "KUSTWACHT",
    "KYSTVAKT", "KUSTBEVAKNING", "GRÆNSEVAGTSKIBET",
    "BCG", "PCG", "RBDF", "SCG", "TCG",

    "FRIGATE", "FREGAT", "FREGATE", "FREGATTE",
    "DESTROYER", "ZERSTÖRER",
    "CORVETTE", "KORVETTE",
    "SUBMARINE", "SOUS-MARIN", "UBÅT", "U-BOOT",
    "AIRCRAFT CARRIER", "PORTE-AVION", "PORTAEREI",
    "CRUISER", "KREUZER",
    "MINESWEEPER", "MINESWEEP", "MINENJÄGER", "DRAGUEUR",
    "MINELAYER", "MOUILLEUR",
    "LANDING SHIP", "BATIMENT DE DEBARQUEMENT",
    "AMPHIBIOUS", "AMPHIBIE",
    "PATROL VESSEL", "PATROL BOAT", "PATROUILLEUR",
    "GUNBOAT", "CANONNIERE",
    "TORPEDO", "VEDETTE",
    "SUPPLY SHIP", "RAVITAILLEUR",
    "REPLENISHMENT", "BSAH",
    "HOSPITAL SHIP", "NAVIRE HOPITAL",

    "NAVY", "NAVAL", "WARSHIP", "WARCRAFT",
    "MARINE NATIONALE", "BUNDESMARINE", "REGIA MARINA",
    "ARMADA", "MARINEFARTØY",
    "MILITARY", "MILITAIRE", "MILITÄR",
    "COMBAT", "BATTLESHIP",

    "HYDROGRAPH", "HYDROGRAPHER",
    "SURVEY VESSEL", "SURVEY SHIP", "SURVEYOR",
    "OCEANOGRAPH", "OCEANOGRAPHER",
    "RESEARCH VESSEL MIL",

    "TENDER", "WERKSCHIP",
    "TUG NAVAL", "REMORQUEUR MILITAIRE",
    "DEPOT SHIP", "RAVITAILLEUR",
    "AMMUNITION SHIP", "MUNITIONSSCHIFF",

    "P 0", "P 1", "P 2", "P 3", "P 4", "P 5", "P 6", "P 7", "P 8", "P 9",
    "F 0", "F 1", "F 2", "F 3", "F 4", "F 5", "F 6", "F 7", "F 8", "F 9",
    "D 0", "D 1", "D 2", "D 3", "D 4", "D 5", "D 6", "D 7", "D 8", "D 9",
    "M 0", "M 1", "M 2", "M 3", "M 4", "M 5", "M 6", "M 7", "M 8", "M 9",
    "L 0", "L 1", "L 2", "L 3", "L 4", "L 5", "L 6", "L 7", "L 8", "L 9",

    "ADMIRAL", "AMIRAL", "AMMIRAGLIO",
    "GENERAL ", "GÉNÉRAL", "GENERAAL",
    "COMMANDANT", "COMMANDER", "KOMMANDEUR",
    "KAPITÄN", "KAPITAN",
    "AUDACIOUS", "INVINCIBLE", "INDOMITABLE", "ILLUSTRIOUS",
    "VICTORIOUS", "VALIANT", "VIGILANT", "VENGEANCE",
    "DEFIANT", "DAUNTLESS", "DARING", "DEFENDER",
    "RESOLUTE", "RELENTLESS", "REPULSE",
    "ENTERPRISE", "ENDURANCE", "ENDEAVOUR",
    "PROTECTOR", "PROTECTEUR",
];

/**
 * Filters a list of vessels to keep only those whose name
 * contains a known military/naval keyword.
 * Vessels with empty names are kept (name not yet received from static data).
 */
export function filterNavalVessels(vessels) {
    return vessels.filter(v => {
        const name = (v.name || "").toUpperCase().trim();
        if (!name) return true; // keep if name unknown yet
        return MILITARY_NAME_KEYWORDS.some(kw => name.includes(kw));
    });
}

export const SHIP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <defs>
    <filter id="ship-glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <polygon
    points="10,2 14,10 13,14 10,13 7,14 6,10"
    fill="#4ab8e8"
    stroke="#1a2a3a"
    stroke-width="0.8"
    filter="url(#ship-glow)"
  />
  <circle cx="10" cy="9" r="1.5" fill="#a8dff5" opacity="0.9"/>
</svg>`;

export function svgToDataUrl(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function createShipPopupHTML(p) {
    const name = p.name || "UNKNOWN";
    const mmsi = p.mmsi || "—";
    const speed = p.speed != null ? `${p.speed} kt` : "—";
    const hdg = p.heading != null ? `${p.heading}°` : "—";

    return `
        <div class="font-mono text-[11px] text-[#e8e8e8] bg-[#0b0b0c] px-3 py-2.5 rounded-md leading-relaxed border border-white/5 min-w-[160px] shadow-2xl">
        <div class="text-[#4ab8e8] font-bold text-xs tracking-widest mb-1 uppercase">
            ${p.name || 'Unknown'}
        </div>
        <div class="flex justify-between">
            <span class="text-gray-500 uppercase">MMSI</span>
            <span class="text-gray-300">${p.mmsi || 'N/A'}</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-500 uppercase">Speed</span>
            <span class="text-gray-300">${p.speed || '0'} kn</span>
        </div>
        <div class="flex justify-between">
            <span class="text-gray-500 uppercase">Hdg</span>
            <span class="text-gray-300">${p.bearing || '0'}°</span>
        </div>
    </div>
    `;
}