"use client";

import { useEffect, useRef } from "react";

export interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    label: string;
    sublabel?: string;
    price?: number;
    isFeatured?: boolean;
    isActive?: boolean;
}

interface HostelMapProps {
    markers: MapMarker[];
    center?: [number, number];
    zoom?: number;
    onMarkerClick?: (id: string) => void;
    className?: string;
    activeMarkerId?: string | null;
    /** Single pin mode for hostel detail page */
    singlePin?: boolean;
}

export default function HostelMap({
    markers,
    center,
    zoom = 13,
    onMarkerClick,
    className = "h-full w-full",
    activeMarkerId,
    singlePin = false,
}: HostelMapProps) {
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, any>>(new Map());
    const leafletRef = useRef<any>(null);

    useEffect(() => {
        // Dynamically import Leaflet (prevents SSR issues)
        let isMounted = true;
        (async () => {
            const L = (await import("leaflet")).default;
            leafletRef.current = L;

            if (!mapContainerRef.current || mapRef.current) return;

            const defaultCenter: [number, number] = center || (markers.length > 0
                ? [markers[0].lat, markers[0].lng]
                : [7.9465, -1.0232]); // Ghana centroid fallback

            const map = L.map(mapContainerRef.current, {
                center: defaultCenter,
                zoom,
                scrollWheelZoom: true,
                zoomControl: true,
            });

            mapRef.current = map;

            // OpenStreetMap tiles — completely free
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            // Add markers
            if (isMounted) addMarkers(L, map);
        })();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            markersRef.current.clear();
        };
    }, []);

    // Update markers when data changes
    useEffect(() => {
        if (!mapRef.current || !leafletRef.current) return;
        const L = leafletRef.current;
        const map = mapRef.current;

        // Remove stale markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        addMarkers(L, map);
    }, [markers, activeMarkerId]);

    const addMarkers = (L: any, map: any) => {
        markers.forEach((m) => {
            const isActive = m.id === activeMarkerId;
            const isFeatured = m.isFeatured;

            const bgColor = isActive ? "#1d4ed8" : isFeatured ? "#0f172a" : "#1e293b";
            const textColor = "#ffffff";
            const priceLabel = m.price ? `₵${(m.price / 100).toLocaleString()}` : m.label.slice(0, 8);

            const iconHtml = singlePin
                ? `<div style="
                    width:40px;height:40px;background:${bgColor};border-radius:50% 50% 50% 0;
                    transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 15px rgba(0,0,0,0.3);
                    display:flex;align-items:center;justify-content:center;
                "><div style="transform:rotate(45deg);color:${textColor};font-size:10px;font-weight:bold;">📍</div></div>`
                : `<div style="
                    background:${bgColor};color:${textColor};padding:5px 10px;border-radius:20px;
                    font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 15px rgba(0,0,0,0.25);
                    border:2px solid ${isActive ? "#93c5fd" : "rgba(255,255,255,0.2)"};
                    transform:${isActive ? "scale(1.1)" : "scale(1)"};transition:all 0.2s;
                    letter-spacing:0.02em;
                ">${priceLabel}</div>`;

            const icon = L.divIcon({
                html: iconHtml,
                className: "custom-div-icon",
                iconSize: [0, 0], // Let CSS handle sizing, but needs a size to render
                iconAnchor: singlePin ? [20, 40] : [20, 15],
            });

            const marker = L.marker([m.lat, m.lng], { icon })
                .addTo(map)
                .bindPopup(`
                    <div class="p-1">
                        <p class="font-bold text-sm text-foreground mb-1">${m.label}</p>
                        ${m.sublabel ? `<p class="text-[11px] text-muted-foreground mb-1 font-medium">${m.sublabel}</p>` : ""}
                        ${m.price ? `<p class="text-xs font-bold text-primary">₵${(m.price / 100).toLocaleString()} <span class="text-[10px] text-muted-foreground font-medium">/ Term</span></p>` : ""}
                    </div>
                `, { maxWidth: 220, className: "hostelgh-popup" });

            if (onMarkerClick) {
                marker.on("click", () => onMarkerClick(m.id));
            }

            markersRef.current.set(m.id, marker);
        });

        // Center map based on markers if no explicit center provided
        if (markers.length > 0 && !center) {
            const coords = markers.map((m) => [m.lat, m.lng] as [number, number]);
            if (markers.length === 1) {
                map.setView(coords[0], zoom || 15);
            } else {
                try {
                    map.fitBounds(coords, { padding: [40, 40], maxZoom: 15 });
                } catch { /* ignore */ }
            }
        }
    };

    return (
        <div
            ref={mapContainerRef}
            className={className}
            style={{ minHeight: "300px" }}
        />
    );
}
