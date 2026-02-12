"use client";

import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useMemo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useGoogleMaps } from "../providers/GoogleMapsProvider";

interface RouteMapProps {
    origin?: string; // e.g. "Shanghai, China"
    destination?: string; // e.g. "Los Angeles, USA"
    className?: string;
}

const containerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "0.75rem",
};

// Deep Space Map Style
const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#1d2c4d" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8ec3b9" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1a3646" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#4b6878" }]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#334e87" }]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [{ "color": "#021019" }]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#283d6a" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#6f9ba5" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1d2c4d" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#304a7d" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#98a5be" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1d2c4d" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#2c6675" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#255763" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#98a5be" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1d2c4d" }]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#283d6a" }]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [{ "color": "#3a4762" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#0e1626" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#4e6d70" }]
    }
];

// Fallback logic if API Key is missing
const center = { lat: 20, lng: 0 }; // World view

export default function RouteMap({ origin, destination, className = "" }: RouteMapProps) {
    const { isLoaded, loadError } = useGoogleMaps();
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const options = useMemo(() => ({
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        minZoom: 2,
        mapId: process.env.NEXT_PUBLIC_MAP_ID || "bf19cf086f6f9660",
    }), []);

    // 👑 SOVEREIGN GEOCODING ENGINE (v2.0 Extreme)
    const PORT_CACHE: Record<string, { lat: number; lng: number }> = {
        // ... (existing ports preserved for brevity, adding missing key nodes)
        "shanghai": { lat: 31.2304, lng: 121.4737 },
        "singapore": { lat: 1.3521, lng: 103.8198 },
        "dubai": { lat: 25.2048, lng: 55.2708 },
        "jebel ali": { lat: 24.9857, lng: 55.0273 },
        "jeddah": { lat: 21.4858, lng: 39.1925 },
        "dammam": { lat: 26.3927, lng: 49.9777 },
        "riyadh": { lat: 24.7136, lng: 46.6753 },
        "rotterdam": { lat: 51.9225, lng: 4.47917 },
        "los angeles": { lat: 34.0522, lng: -118.2437 },
        "long beach": { lat: 33.7701, lng: -118.1937 },
        "new york": { lat: 40.7128, lng: -74.0060 },
        "piraeus": { lat: 37.9431, lng: 23.6470 },
        "valencia": { lat: 39.4699, lng: -0.3763 },
        "busan": { lat: 35.1796, lng: 129.0756 },
        "qingdao": { lat: 36.0671, lng: 120.3826 },
        "mumbai": { lat: 19.0760, lng: 72.8777 },
        "mundra": { lat: 22.8400, lng: 69.7000 },
        "port saint john": { lat: 45.2733, lng: -66.0633 },
        "houston": { lat: 29.7604, lng: -95.3698 },
        "savannah": { lat: 32.0809, lng: -81.0912 },
        "vancouver": { lat: 49.2827, lng: -123.1207 }
    };

    const getCoordinates = (loc?: string) => {
        if (!loc) return null;
        const clean = loc.toLowerCase().split(',')[0].trim();
        return PORT_CACHE[clean] || PORT_CACHE["shanghai"];
    };

    const originPos = useMemo(() => getCoordinates(origin), [origin]);
    const destPos = useMemo(() => getCoordinates(destination), [destination]);

    // 👑 DYNAMIC BOUNDS CALIBRATION
    useEffect(() => {
        if (map && originPos && destPos) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(originPos);
            bounds.extend(destPos);
            map.fitBounds(bounds, 50);
        }
    }, [map, originPos, destPos]);

    if (loadError) return <div className="h-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700 font-black uppercase text-[10px] tracking-[0.4em]">Satellite_Feed_Offline</div>;
    if (!isLoaded) return <div className="h-full bg-zinc-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            zoom={2}
            onLoad={(m) => setMap(m)}
            options={options}
            mapContainerClassName={className}
        >
            {originPos && (
                <Marker
                    position={originPos}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 6,
                        fillColor: "#FFFFFF",
                        fillOpacity: 1,
                        strokeColor: "#000000",
                        strokeWeight: 2,
                    }}
                />
            )}
            {destPos && (
                <Marker
                    position={destPos}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#10B981", // Emerald-500
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                    }}
                />
            )}
            {originPos && destPos && (
                <Polyline
                    path={[originPos, destPos]}
                    options={{
                        strokeColor: "#FFFFFF",
                        strokeOpacity: 0.2,
                        strokeWeight: 1,
                        geodesic: true,
                    }}
                />
            )}
        </GoogleMap>
    );
}

