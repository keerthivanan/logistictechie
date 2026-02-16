'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const locations = [
    { x: 20, y: 30, name: 'New York' },
    { x: 48, y: 25, name: 'London' },
    { x: 52, y: 28, name: 'Rotterdam' },
    { x: 75, y: 35, name: 'Dubai' },
    { x: 85, y: 45, name: 'Singapore' },
    { x: 92, y: 40, name: 'Shanghai' },
    { x: 15, y: 45, name: 'Los Angeles' },
    { x: 30, y: 75, name: 'Santos' },
    { x: 55, y: 80, name: 'Cape Town' },
    { x: 88, y: 70, name: 'Sydney' },
];

const routes = [
    { start: 0, end: 1 }, // NY -> London
    { start: 1, end: 3 }, // London -> Dubai
    { start: 3, end: 4 }, // Dubai -> Singapore
    { start: 4, end: 5 }, // Singapore -> Shanghai
    { start: 5, end: 6 }, // Shanghai -> LA (Pacific)
    { start: 0, end: 7 }, // NY -> Santos
    { start: 1, end: 8 }, // London -> Cape Town
    { start: 4, end: 9 }, // Singapore -> Sydney
];

export default function GlobalNetworkMap() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative w-full aspect-[2/1] bg-[#050505] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

            {/* World Map SVG (Simplified) */}
            <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                <path
                    d="M18,12 C15,15 10,18 8,22 C10,25 15,28 15,35 C15,40 20,45 25,42 C28,40 32,35 30,25 C35,22 40,15 35,10 C30,8 20,10 18,12 Z
                       M45,10 C42,12 40,18 42,22 C45,25 50,25 55,20 C60,18 55,10 50,8 C48,8 46,9 45,10 Z
                       M65,15 C62,18 60,25 62,30 C65,35 70,35 75,30 C80,25 78,15 70,12 C68,12 66,13 65,15 Z
                       M85,35 C82,38 80,45 82,48 C85,50 90,48 92,45 C94,40 90,32 85,35 Z"
                    fill="currentColor"
                    className="text-white"
                />
                {/* Abstract Continents approximation for style */}
                <path d="M10,10 Q20,5 30,15 T50,15 T70,15 T90,20 V40 H10 Z" fill="none" stroke="none" />
            </svg>

            {/* Connection Lines */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
                {routes.map((route, i) => {
                    const start = locations[route.start];
                    const end = locations[route.end];
                    return (
                        <motion.path
                            key={i}
                            d={`M${start.x},${start.y} Q${(start.x + end.x) / 2},${(start.y + end.y) / 2 - 10} ${end.x},${end.y}`}
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="0.3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
                        />
                    );
                })}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00f2fe" stopOpacity="0" />
                        <stop offset="50%" stopColor="#4facfe" stopOpacity="1" />
                        <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Location Dots */}
            {locations.map((loc, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                >
                    <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                    {/* Tooltip on Hover */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-300 pointer-events-none whitespace-nowrap">
                        {loc.name}
                    </div>
                </motion.div>
            ))}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
        </div>
    );
}
