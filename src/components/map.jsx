import React from "react";
import maplibregl, { GlobeControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { feature } from "topojson-client";
import countries10 from "../data/countries-10m.json";
// eslint-disable-next-line no-unused-vars
import { iso3ToName, nameToIso3 } from "../utils/iso3Converter.jsx";
import { createAircraftPopupHTML } from "../utils/aircraftPopup.jsx";
import { getAircraftName, filterMilitary } from "../utils/militaryUtils.jsx";

const FILL_OPACITY = 0.4;
const MIL_API = "http://localhost:8000/proxy/military";
const MIL_REFRESH_MS = 15_000;

const PLANE_SVG = `
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


function svgToDataUrl(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export default function MapComponent({ onCountryClick, period, tick }) {
    function fixAntimeridian(geojson) {
        geojson.features = geojson.features.map(f => {
            if (f.properties.name === "Russia") {
                f.geometry.coordinates = f.geometry.coordinates.map(polygon =>
                    polygon.map(ring =>
                        ring.map(([lon, lat]) => [lon < 0 ? lon + 360 : lon, lat])
                    )
                );
            }
            return f;
        });
        return geojson;
    }

    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const worldGeoJSONRef = React.useRef(null);
    const milIntervalRef = React.useRef(null);
    const periodRef = React.useRef(period);
    const applyIndexesRef = React.useRef(null);

    React.useEffect(() => { periodRef.current = period; }, [period]);

    // Fetch and update military aircraft layer
    const fetchMilitary = React.useCallback(async () => {
        const map = mapInstanceRef.current;
        if (!map || !map.getSource("military")) return;
        try {
            const res = await fetch(MIL_API);
            const data = await res.json();
            const filtered = filterMilitary(data.ac || []);

            map.getSource("military").setData({
                type: "FeatureCollection",
                features: filtered.map(a => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [a.lon, a.lat] },
                    properties: {
                        icao: a.hex || "",
                        callsign: (a.flight || a.r || "").trim(),
                        type: a.t || "",
                        aircraft: getAircraftName(a.t),
                        altitude: a.alt_baro || 0,
                        speed: Math.round(a.gs || 0),
                        bearing: a.track || 0,
                    },
                })),
            });
            console.log(`Military aircraft: ${filtered.length} displayed`);
        } catch (e) {
            console.error("Failed to fetch military aircraft:", e);
        }
    }, []);

    // Initialize map once
    React.useEffect(() => {
        const map = new maplibregl.Map({
            container: mapRef.current,
            style: "/style-black.json",
            center: [0, 20],
            zoom: 2,
            attributionControl: false,
            dragRotate: false,
            touchPitch: false,
            renderWorldCopies: false,
        });

        mapInstanceRef.current = map;
        map.addControl(new GlobeControl(), "bottom-right");

        let worldGeoJSON = feature(countries10, countries10.objects.countries);
        worldGeoJSON = fixAntimeridian(worldGeoJSON);
        worldGeoJSON.features.forEach((f, i) => { if (f.id === undefined) f.id = i; });
        worldGeoJSONRef.current = worldGeoJSON;

        applyIndexesRef.current = async () => {
            if (!map || !worldGeoJSON) return;
            let countryIndexes = {};
            try {
                const res = await fetch(`http://localhost:8000/final_index/average?period=${periodRef.current}`);
                countryIndexes = await res.json();
            } catch (e) {
                console.error("Failed to fetch country indexes:", e);
            }

            // Reset all
            worldGeoJSON.features.forEach(f => {
                map.setFeatureState({ source: "countries", id: f.id }, { index: 0 });
            });

            // Apply — nameToIso3 is a dictionary object, use bracket notation
            worldGeoJSON.features.forEach(f => {
                const iso3 = nameToIso3(f.properties.name);
                const index = iso3 ? countryIndexes[iso3] : undefined;
                if (index !== undefined && index >= 5) {
                    map.setFeatureState({ source: "countries", id: f.id }, { index });
                }
            });
        };

        map.on("load", async () => {
            map.setProjection({ type: "globe" });

            // --- Country fill ---
            map.addSource("countries", { type: "geojson", data: worldGeoJSON });

            map.addLayer({
                id: "countries-fill",
                type: "fill",
                source: "countries",
                paint: { "fill-color": "rgba(0,0,0,0)", "fill-opacity": 1 },
            }, "place_country_major");

            map.setPaintProperty("countries-fill", "fill-color", [
                "case",
                [">=", ["coalesce", ["feature-state", "index"], 0], 60], `rgba(160, 20, 20, ${FILL_OPACITY})`,
                [">=", ["coalesce", ["feature-state", "index"], 0], 40], `rgba(180, 60, 10, ${FILL_OPACITY})`,
                [">=", ["coalesce", ["feature-state", "index"], 0], 20], `rgba(180, 100, 0, ${FILL_OPACITY})`,
                [">=", ["coalesce", ["feature-state", "index"], 0], 10], `rgba(160, 140, 0, ${FILL_OPACITY})`,
                "rgba(0,0,0,0)",
            ]);

            map.on("click", "countries-fill", (e) => {
                const countryName = e.features[0]?.properties?.name;
                if (countryName) onCountryClick(countryName);
            });

            // Military aircraft
            const img = new Image(24, 24);
            img.onload = () => {
                if (!map.hasImage("plane-icon")) {
                    map.addImage("plane-icon", img);
                }

                map.addSource("military", {
                    type: "geojson",
                    data: { type: "FeatureCollection", features: [] },
                });

                map.addLayer({
                    id: "military-aircraft",
                    type: "symbol",
                    source: "military",
                    layout: {
                        "icon-image": "plane-icon",
                        "icon-size": 1,
                        "icon-rotate": ["get", "bearing"],
                        "icon-rotation-alignment": "map",
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                    },
                });

                // Click popup
                map.on("click", "military-aircraft", (e) => {
                    const p = e.features[0].properties;
                    const coords = e.features[0].geometry.coordinates.slice();
                    new maplibregl.Popup({ closeButton: true, maxWidth: "220px", className: "mil-popup" })
                        .setLngLat(coords)
                        .setHTML(createAircraftPopupHTML(p))
                        .addTo(map);
                });

                map.on("mouseenter", "military-aircraft", () => { map.getCanvas().style.cursor = "pointer"; });
                map.on("mouseleave", "military-aircraft", () => { map.getCanvas().style.cursor = ""; });

                // Initial fetch then every 15s
                fetchMilitary();
                milIntervalRef.current = setInterval(fetchMilitary, MIL_REFRESH_MS);
            };
            img.src = svgToDataUrl(PLANE_SVG);

            // Initial index load
            await applyIndexesRef.current();
        });

        return () => {
            clearInterval(milIntervalRef.current);
            map.remove();
        };
    }, [fetchMilitary, onCountryClick]);

    // Re-apply indexes on period/tick change
    React.useEffect(() => {
        if (mapInstanceRef.current?.getSource("countries") && applyIndexesRef.current) {
            applyIndexesRef.current();
        }
    }, [period, tick]);

    return <div ref={mapRef} className="w-full h-full" />;
}