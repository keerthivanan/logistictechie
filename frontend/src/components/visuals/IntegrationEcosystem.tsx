'use client';

import { motion } from 'framer-motion';
import { Database, Server, Smartphone, Globe, Lock, Workflow } from 'lucide-react';

const integrationNodes = [
    { icon: Database, label: 'SAP' },
    { icon: Server, label: 'Oracle' },
    { icon: Smartphone, label: 'Mobile' },
    { icon: Globe, label: 'REST API' },
    { icon: Lock, label: 'Security' },
];

const RADIUS = 145;
const ICON_SIZE = 56;
const TOTAL = integrationNodes.length;

export default function IntegrationEcosystem() {
    return (
        <section className="py-24 bg-black border-y border-white/[0.05] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* Left — text */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-xs font-inter mb-6">
                            <Workflow className="w-3.5 h-3.5" /> Seamless Integration
                        </div>
                        <h2 className="text-3xl font-black tracking-tight mb-5 font-outfit text-white">
                            Your Stack, Supercharged.
                        </h2>
                        <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-inter">
                            CargoLink isn&apos;t just another tool — it&apos;s the connective tissue of your logistics operations.
                            We integrate natively with your existing ERPs, WMS, and TMS platforms.
                        </p>

                        <div className="space-y-3">
                            {[
                                { title: 'Two-Way Sync', desc: 'Push orders and pull tracking data automatically.' },
                                { title: 'EDI & API Ready', desc: 'Support for all major EDI standards (X12, EDIFACT) and REST API.' },
                                { title: 'Legacy Compatible', desc: 'Works with on-premise Oracle/SAP instances via secure gateway.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.10] transition-all">
                                    <div className="mt-0.5 shrink-0">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white font-inter">{item.title}</h4>
                                        <p className="text-xs text-zinc-500 font-inter mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — orbital diagram */}
                    <div className="relative h-[420px] flex items-center justify-center">

                        {/* Orbit ring */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 420 420"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <circle
                                cx="210" cy="210" r={RADIUS}
                                fill="none"
                                stroke="white"
                                strokeWidth="1"
                                strokeOpacity="0.06"
                                strokeDasharray="4 6"
                            />
                            {/* Inner ring */}
                            <circle
                                cx="210" cy="210" r="72"
                                fill="none"
                                stroke="white"
                                strokeWidth="1"
                                strokeOpacity="0.04"
                            />
                        </svg>

                        {/* Central node */}
                        <div className="relative z-10 w-28 h-28 rounded-full bg-[#0e0e0e] border border-white/[0.10] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                            {/* Subtle pulse ring */}
                            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
                            <span className="font-black text-xl tracking-tight text-white font-outfit">CL</span>
                        </div>

                        {/* Orbiting satellites */}
                        {integrationNodes.map((node, i) => {
                            const initialAngle = (i * 360) / TOTAL;
                            return (
                                <motion.div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: 0,
                                        height: 0,
                                        originX: '0px',
                                        originY: '0px',
                                    }}
                                    initial={{ rotate: initialAngle }}
                                    animate={{ rotate: initialAngle + 360 }}
                                    transition={{
                                        duration: 28,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                >
                                    <motion.div
                                        style={{
                                            position: 'absolute',
                                            top: -(RADIUS + ICON_SIZE / 2),
                                            left: -(ICON_SIZE / 2),
                                            width: ICON_SIZE,
                                            height: ICON_SIZE,
                                        }}
                                        initial={{ rotate: -initialAngle }}
                                        animate={{ rotate: -(initialAngle + 360) }}
                                        transition={{
                                            duration: 28,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    >
                                        <div className="w-full h-full bg-[#0e0e0e] border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center gap-0.5 hover:border-white/20 transition-colors">
                                            <node.icon className="w-5 h-5 text-zinc-400" />
                                            <span className="text-[9px] text-zinc-600 font-inter font-bold tracking-wider uppercase">{node.label}</span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}
