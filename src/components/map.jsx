import React from "react";
import maplibregl, { GlobeControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { feature } from "topojson-client";
import countries10 from "../data/countries-10m.json";
// eslint-disable-next-line no-unused-vars
import { iso3ToName, nameToIso3 } from "../utils/iso3Converter.jsx";
import { getAircraftName, filterMilitary, createAircraftPopupHTML, PLANE_SVG } from "../utils/aircraftUtils.jsx";
import { SHIP_SVG, svgToDataUrl as shipSvgToDataUrl, createShipPopupHTML, filterNavalVessels } from "../utils/navalUtils.jsx";

const FILL_OPACITY = 0.4;
const MIL_API = "http://localhost:8000/proxy/military";
const NAVAL_API = "http://localhost:8000/proxy/naval";
const MIL_REFRESH_MS = 15_000;
const NAVAL_REFRESH_MS = 60_000;

function svgToDataUrl(svg) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export default function MapComponent({ onCountryClick, period, tick, aircraftActive, navalActive, onNavalLoading }) {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const worldGeoJSONRef = React.useRef(null);
    const milIntervalRef = React.useRef(null);
    const navalIntervalRef = React.useRef(null);
    const periodRef = React.useRef(period);
    const applyIndexesRef = React.useRef(null);

    React.useEffect(() => { periodRef.current = period; }, [period]);

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



    const fetchMilitary = React.useCallback(async () => {
        const map = mapInstanceRef.current;
        if (!map || !map.getSource("military")) return;
        try {
            const res = await fetch(MIL_API);
            if (!res.ok) return;
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
        } catch (e) {
            console.warn("Aircraft fetch failed, keeping previous data:", e.message);
        }
    }, []);

    const fetchNaval = React.useCallback(async () => {
        const map = mapInstanceRef.current;
        if (!map || !map.getSource("naval")) return;
        try {
            const res = await fetch(NAVAL_API);
            if (!res.ok) return;
            const data = await res.json();
            const vessels = filterNavalVessels(data.vessels || []);
            map.getSource("naval").setData({
                type: "FeatureCollection",
                features: vessels.map(v => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [v.lon, v.lat] },
                    properties: {
                        mmsi: v.mmsi,
                        name: v.name,
                        speed: v.speed,
                        heading: v.heading,
                    },
                })),
            });
            if (vessels.length > 0) onNavalLoading?.(false);
            console.log(`Naval vessels: ${vessels.length} displayed`);
        } catch (e) {
            console.warn("Naval fetch failed, keeping previous data:", e.message);
        }
    }, [onNavalLoading]);

    React.useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !map.getLayer("military-aircraft")) return;
        map.setLayoutProperty("military-aircraft", "visibility", aircraftActive ? "visible" : "none");
        if (aircraftActive) {
            fetchMilitary();
            milIntervalRef.current = setInterval(fetchMilitary, MIL_REFRESH_MS);
        } else {
            clearInterval(milIntervalRef.current);
        }
    }, [aircraftActive]);

    // Naval visibility toggle
    React.useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !map.getLayer("naval-vessels")) return;
        map.setLayoutProperty("naval-vessels", "visibility", navalActive ? "visible" : "none");
        if (navalActive) {
            onNavalLoading?.(true);
            fetchNaval();
            navalIntervalRef.current = setInterval(fetchNaval, NAVAL_REFRESH_MS);
        } else {
            clearInterval(navalIntervalRef.current);
            onNavalLoading?.(false);
        }
    }, [navalActive]);

    // Initialize map once
    React.useEffect(() => {
        const map = new maplibregl.Map({
            container: mapRef.current,
            style: "/style-black.json",
            center: [0, 20],
            zoom: 2.5,
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
            worldGeoJSON.features.forEach(f => {
                map.setFeatureState({ source: "countries", id: f.id }, { index: 0 });
            });
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

            // Country fill
            map.addSource("countries", { type: "geojson", data: worldGeoJSON });
            map.addLayer({
                id: "countries-fill", type: "fill", source: "countries",
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
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ["military-aircraft", "naval-vessels"]
                });

                if (features.length > 0) return;

                const countryName = e.features[0]?.properties?.name;
                if (countryName) onCountryClick(countryName);
            });

            // Naval vessels
            const shipImg = new Image(20, 20);
            shipImg.onload = () => {
                if (!map.hasImage("ship-icon")) map.addImage("ship-icon", shipImg);
                map.addSource("naval", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
                map.addLayer({
                    id: "naval-vessels", type: "symbol", source: "naval",
                    layout: {
                        "icon-image": "ship-icon",
                        "icon-size": 1,
                        "icon-rotate": ["get", "heading"],
                        "icon-rotation-alignment": "map",
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "visibility": "none",
                    },
                });
                map.on("click", "naval-vessels", (e) => {
                    const p = e.features[0].properties;
                    new maplibregl.Popup({ closeButton: true, maxWidth: "220px", className: "mil-popup" })
                        .setLngLat(e.features[0].geometry.coordinates.slice())
                        .setHTML(createShipPopupHTML(p))
                        .addTo(map);
                });
                map.on("mouseenter", "naval-vessels", () => { map.getCanvas().style.cursor = "pointer"; });
                map.on("mouseleave", "naval-vessels", () => { map.getCanvas().style.cursor = ""; });
            };
            shipImg.src = shipSvgToDataUrl(SHIP_SVG);

            // Military aircraft
            const planeImg = new Image(24, 24);
            planeImg.onload = () => {
                if (!map.hasImage("plane-icon")) map.addImage("plane-icon", planeImg);
                map.addSource("military", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
                map.addLayer({
                    id: "military-aircraft", type: "symbol", source: "military",
                    layout: {
                        "icon-image": "plane-icon",
                        "icon-size": 1,
                        "icon-rotate": ["get", "bearing"],
                        "icon-rotation-alignment": "map",
                        "icon-allow-overlap": true,
                        "icon-ignore-placement": true,
                        "visibility": "none",
                    },
                });
                map.on("click", "military-aircraft", (e) => {
                    const p = e.features[0].properties;
                    new maplibregl.Popup({ closeButton: true, maxWidth: "220px", className: "mil-popup" })
                        .setLngLat(e.features[0].geometry.coordinates.slice())
                        .setHTML(createAircraftPopupHTML(p))
                        .addTo(map);
                });
                map.on("mouseenter", "military-aircraft", () => { map.getCanvas().style.cursor = "pointer"; });
                map.on("mouseleave", "military-aircraft", () => { map.getCanvas().style.cursor = ""; });
            };
            planeImg.src = svgToDataUrl(PLANE_SVG);

            await applyIndexesRef.current();
        });

        return () => {
            clearInterval(milIntervalRef.current);
            clearInterval(navalIntervalRef.current);
            map.remove();
        };
    }, [onCountryClick]);

    React.useEffect(() => {
        if (mapInstanceRef.current?.getSource("countries") && applyIndexesRef.current) {
            applyIndexesRef.current();
        }
    }, [period, tick]);

    return <div ref={mapRef} className="w-full h-full" />;
}