'use client'

import { TrendingUp, Activity, BarChart2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MetricsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metric 1 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs font-mono text-green-400">+12.5%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">2.1k</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Quote Potential</div>

                {/* Sparkline Mock */}
                <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-blue-500"
                    ></motion.div>
                </div>
            </motion.div>

            {/* Metric 2 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:bg-zinc-900 transition-colors group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                        <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-xs font-mono text-blue-400">STABLE</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">98.2%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Uptime Reliability</div>

                {/* Sparkline Mock */}
                <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="h-full bg-purple-500"
                    ></motion.div>
                </div>
            </motion.div>

            {/* Metric 3 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-950 border border-white/10 rounded-2xl p-6 hover:bg-zinc-900 transition-colors group md:col-span-2"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-white font-bold">Traffic Value</div>
                            <div className="text-xs text-gray-500">Monetary Equivalent</div>
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">$42,890</div>
                </div>

                {/* Graph Mock */}
                <div className="flex items-end gap-1 h-12">
                    {[40, 60, 45, 70, 50, 80, 75, 90, 85, 100].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.5, delay: 0.7 + (i * 0.05) }}
                            className="flex-1 bg-zinc-800 hover:bg-green-500 transition-colors rounded-t-sm"
                        ></motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
