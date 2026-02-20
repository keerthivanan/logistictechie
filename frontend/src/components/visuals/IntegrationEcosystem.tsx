'use client';

import { motion } from 'framer-motion';
import { Database, Server, Smartphone, Globe, Lock, Workflow } from 'lucide-react';

export default function IntegrationEcosystem() {
    return (
        <section className="py-24 bg-black border-y border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                            <Workflow className="w-4 h-4" /> Seamless Integration
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Your Stack, Supercharged.</h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Sovereign isn't just another tool; it's the connective tissue of your logistics operations.
                            We integrate natively with your existing ERPs, WMS, and TMS platforms.
                        </p>

                        <div className="space-y-4">
                            {[
                                { title: 'Two-Way Sync', desc: 'Push orders and pull tracking data automatically.' },
                                { title: 'EDI & API Ready', desc: 'Support for all major EDI standards (X12, EDIFACT) and REST API.' },
                                { title: 'Legacy Compatible', desc: 'Works with on-premise Oracle/SAP instances via secure gateway.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="mt-1">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative h-[500px] flex items-center justify-center">
                        {/* Central Node */}
                        <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center z-10 shadow-[0_0_50px_rgba(147,51,234,0.5)] relative">
                            <div className="absolute inset-0 border-4 border-purple-400/30 rounded-full animate-ping"></div>
                            <span className="font-bold text-2xl tracking-tighter text-white">SOV</span>
                        </div>

                        {/* Orbiting Satellites */}
                        {[
                            { icon: Database, bg: 'bg-blue-500', label: 'SAP' },
                            { icon: Server, bg: 'bg-green-500', label: 'Oracle' },
                            { icon: Smartphone, bg: 'bg-orange-500', label: 'Mobile' },
                            { icon: Globe, bg: 'bg-cyan-500', label: 'Web' },
                            { icon: Lock, bg: 'bg-red-500', label: 'Security' },
                        ].map((node, i) => (
                            <motion.div
                                key={i}
                                className={`absolute w-16 h-16 ${node.bg} rounded-2xl flex items-center justify-center shadow-lg z-10`}
                                animate={{
                                    rotate: 360,
                                }}
                                style={{
                                    originX: "-120px", // Orbit radius
                                    originY: "50%",
                                    top: "50%",
                                    left: "65%", // Center + Radius offset
                                    rotate: i * (360 / 5)
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                                    <node.icon className="w-8 h-8 text-white" />
                                </motion.div>
                            </motion.div>
                        ))}

                        {/* Connecting Lines (Static SVG backing) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 animate-spin-slow" viewBox="0 0 500 500">
                            <circle cx="250" cy="250" r="150" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                            <circle cx="250" cy="250" r="100" fill="none" stroke="white" strokeWidth="1" opacity="0.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
}
