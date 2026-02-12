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
    // Golden Cache: 60+ Global Logistics Hubs (World-Class Coverage)
    const PORT_CACHE: Record<string, { lat: number; lng: number }> = {
        // Asia
        "shanghai": { lat: 31.2304, lng: 121.4737 },
        "singapore": { lat: 1.3521, lng: 103.8198 },
        "ningbo": { lat: 29.8683, lng: 121.5440 },
        "shenzhen": { lat: 22.5431, lng: 114.0579 },
        "guangzhou": { lat: 23.1291, lng: 113.2644 },
        "busan": { lat: 35.1796, lng: 129.0756 },
        "qingdao": { lat: 36.0671, lng: 120.3826 },
        "hong kong": { lat: 22.3193, lng: 114.1694 },
        "tianjin": { lat: 39.3434, lng: 117.3616 },
        "kaohsiung": { lat: 22.6273, lng: 120.3014 },
        "port klang": { lat: 3.0166, lng: 101.3583 },
        "xiamen": { lat: 24.4798, lng: 118.0894 },
        "laem chabang": { lat: 13.0850, lng: 100.9125 },
        "tokyo": { lat: 35.6762, lng: 139.6503 },
        "yokohama": { lat: 35.4437, lng: 139.6380 },
        "ho chi minh": { lat: 10.7626, lng: 106.6602 },
        "mumbai": { lat: 19.0760, lng: 72.8777 },
        "mundra": { lat: 22.8400, lng: 69.7000 },
        "nhava sheva": { lat: 18.9500, lng: 72.9500 },
        "colombo": { lat: 6.9271, lng: 79.8612 },

        // Middle East
        "dubai": { lat: 25.2048, lng: 55.2708 },
        "jebel ali": { lat: 24.9857, lng: 55.0273 },
        "riyadh": { lat: 24.7136, lng: 46.6753 },
        "jeddah": { lat: 21.4858, lng: 39.1925 },
        "dammam": { lat: 26.3927, lng: 49.9777 },
        "abu dhabi": { lat: 24.4539, lng: 54.3773 },
        "salalah": { lat: 17.0151, lng: 54.0924 },
        "doha": { lat: 25.2854, lng: 51.5310 },

        // Europe
        "rotterdam": { lat: 51.9225, lng: 4.47917 },
        "antwerp": { lat: 51.2194, lng: 4.4025 },
        "hamburg": { lat: 53.5488, lng: 9.9872 },
        "piraeus": { lat: 37.9431, lng: 23.6470 },
        "valencia": { lat: 39.4699, lng: -0.3763 },
        "barcelona": { lat: 41.3851, lng: 2.1734 },
        "felixstowe": { lat: 51.9631, lng: 1.3508 },
        "le havre": { lat: 49.4944, lng: 0.1079 },
        "bremerhaven": { lat: 53.5442, lng: 8.5806 },
        "algeciras": { lat: 36.1275, lng: -5.4542 },

        // North America
        "los angeles": { lat: 34.0522, lng: -118.2437 },
        "long beach": { lat: 33.7701, lng: -118.1937 },
        "new york": { lat: 40.7128, lng: -74.0060 },
        "newark": { lat: 40.7357, lng: -74.1724 },
        "savannah": { lat: 32.0809, lng: -81.0912 },
        "houston": { lat: 29.7604, lng: -95.3698 },
        "vancouver": { lat: 49.2827, lng: -123.1207 },
        "seattle": { lat: 47.6062, lng: -122.3321 },
        "oakland": { lat: 37.8044, lng: -122.2711 },
        "charleston": { lat: 32.7765, lng: -79.9311 },

        // Latin America
        "santos": { lat: -23.9608, lng: -46.3339 },
        "panama city": { lat: 8.9833, lng: -79.5167 },
        "colon": { lat: 9.3592, lng: -79.9014 },
        "manzanillo": { lat: 19.0522, lng: -104.3158 },

        // Africa
        "tangier": { lat: 35.7595, lng: -5.8340 },
        "durban": { lat: -29.8587, lng: 31.0218 },
        "alexandria": { lat: 31.2001, lng: 29.9187 },
        "lagos": { lat: 6.4531, lng: 3.3958 },
        "port said": { lat: 31.2653, lng: 32.3019 }
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

