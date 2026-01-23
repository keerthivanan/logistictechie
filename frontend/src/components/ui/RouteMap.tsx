"use client";

import { useLoadScript, GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

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
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "", // Use empty string to avoid crash, will error gracefully
    });

    const options = useMemo(() => ({
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        minZoom: 2,
    }), []);

    // Placeholder if no key or loading
    if (loadError) {
        return (
            <div className={`flex flex-col items-center justify-center bg-black/40 rounded-xl border border-blue-500/20 backdrop-blur-sm ${className}`}>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <span className="text-blue-400 font-bold mb-1 tracking-wide uppercase text-xs">Satellite Feed Offline</span>
                <span className="text-[10px] text-gray-500">API Key Configuration Required</span>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-900 rounded-xl ${className}`}>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    // TODO: Implement GeographyService to get lat/lng from origin/dest strings
    // For now, static markers for demo
    const originPos = { lat: 31.2304, lng: 121.4737 }; // Shanghai
    const destPos = { lat: 24.4893, lng: 39.1557 }; // Riyadh (Example)

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
                    strokeColor: "#3b82f6",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    geodesic: true, // Curved line
                }}
            />
        </GoogleMap>
    );
}
