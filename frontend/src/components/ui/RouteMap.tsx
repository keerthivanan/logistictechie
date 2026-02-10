"use client";

import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useMemo } from "react";
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

    const options = useMemo(() => ({
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        minZoom: 2,
        mapId: process.env.NEXT_PUBLIC_MAP_ID || "bf19cf086f6f9660", // Enterprise 3D Map ID
    }), []);

    // Placeholder if no key or loading
    if (loadError) {
        return (
            <div className={`flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/10 backdrop-blur-sm ${className}`}>
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white" />
                </div>
                <span className="text-white font-bold mb-1 tracking-wide uppercase text-xs">Satellite Feed Offline</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Configuration Required</span>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={`flex flex-col items-center justify-center bg-black rounded-xl ${className}`}>
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    // 👑 SOVEREIGN GEOCODING ENGINE
    // 1. Check Golden Cache (Zero Latency)
    // 2. Default to Strategic Nodes if unknown

    // Golden Cache: Top 20 Global Logistics Hubs
    const PORT_CACHE: Record<string, { lat: number; lng: number }> = {
        "shanghai": { lat: 31.2304, lng: 121.4737 },
        "singapore": { lat: 1.3521, lng: 103.8198 },
        "ningbo": { lat: 29.8683, lng: 121.5440 },
        "shenzhen": { lat: 22.5431, lng: 114.0579 },
        "guangzhou": { lat: 23.1291, lng: 113.2644 },
        "busan": { lat: 35.1796, lng: 129.0756 },
        "qingdao": { lat: 36.0671, lng: 120.3826 },
        "hong kong": { lat: 22.3193, lng: 114.1694 },
        "tianjin": { lat: 39.3434, lng: 117.3616 },
        "rotterdam": { lat: 51.9225, lng: 4.47917 },
        "dubai": { lat: 25.2048, lng: 55.2708 },
        "jebel ali": { lat: 24.9857, lng: 55.0273 },
        "antwerp": { lat: 51.2194, lng: 4.4025 },
        "hamburg": { lat: 53.5488, lng: 9.9872 },
        "los angeles": { lat: 34.0522, lng: -118.2437 },
        "long beach": { lat: 33.7701, lng: -118.1937 },
        "new york": { lat: 40.7128, lng: -74.0060 },
        "newark": { lat: 40.7357, lng: -74.1724 },
        "savannah": { lat: 32.0809, lng: -81.0912 },
        "tokyo": { lat: 35.6762, lng: 139.6503 },
        "yokohama": { lat: 35.4437, lng: 139.6380 },
        "riyadh": { lat: 24.7136, lng: 46.6753 },
        "jeddah": { lat: 21.4858, lng: 39.1925 },
        "dammam": { lat: 26.3927, lng: 49.9777 }
    };

    const getCoordinates = (loc?: string) => {
        if (!loc) return { lat: 0, lng: 0 };
        const clean = loc.toLowerCase().split(',')[0].trim();
        return PORT_CACHE[clean] || PORT_CACHE["shanghai"]; // Default to Shanghai if unknown (Safe Fallback)
    };

    const originPos = useMemo(() => getCoordinates(origin), [origin]);
    const destPos = useMemo(() => getCoordinates(destination), [destination]);

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={2}
            options={options}
            mapContainerClassName={className}
        >
            <Marker position={originPos} label="A" />
            <Marker position={destPos} label="B" />
            <Polyline
                path={[originPos, destPos]}
                options={{
                    strokeColor: "#FFFFFF",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    geodesic: true, // Curved line
                }}
            />
        </GoogleMap>
    );
}

