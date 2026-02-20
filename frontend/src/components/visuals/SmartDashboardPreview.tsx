'use client';

import { motion } from 'framer-motion';
import { Activity, Box, Map, PieChart, TrendingUp, Users } from 'lucide-react';

export default function SmartDashboardPreview() {
    return (
        <div className="relative w-full max-w-5xl mx-auto aspect-video bg-black/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-black/40 border-r border-white/5 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Box className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">SOVEREIGN OS</span>
                </div>

                <div className="space-y-2">
                    {['Dashboard', 'Shipments', 'Analytics', 'Network'].map((item, i) => (
                        <div key={item} className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            {i === 0 && <Activity className="w-4 h-4" />}
                            {i === 1 && <Box className="w-4 h-4" />}
                            {i === 2 && <PieChart className="w-4 h-4" />}
                            {i === 3 && <Map className="w-4 h-4" />}
                            <span className="text-sm font-medium">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
                    <div className="text-xs text-blue-400 mb-1">System Status</div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-green-400">Operational</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="absolute left-64 top-0 right-0 bottom-0 p-8 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">Logistics Overview</h2>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm">Last 24 Hours</div>
                        <div className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium">Export Report</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Active Shipments', value: '1,248', change: '+12%', icon: Box, color: 'text-blue-400' },
                        { label: 'On-Time Delivery', value: '98.4%', change: '+2.1%', icon: TrendingUp, color: 'text-green-400' },
                        { label: 'Total Volume', value: '45.2k TEU', change: '+8%', icon: Activity, color: 'text-purple-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 bg-white/5 border border-white/10 rounded-xl"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 bg-white/5 rounded-lg ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                                    {stat.change} <TrendingUp className="w-3 h-3" />
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-6 h-full">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <h3 className="text-lg font-bold mb-4">Live Map</h3>
                        <div className="absolute inset-0 top-16 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-10 bg-center"></div>
                        {/* Simulated Live Dots */}
                        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                        <Box className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Shipment #293{i}8</div>
                                        <div className="text-xs text-gray-500">Arrived at Port of Rotterdam</div>
                                    </div>
                                    <div className="ml-auto text-xs text-gray-600">2m ago</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
