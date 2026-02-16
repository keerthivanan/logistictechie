'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Ship, Globe, Zap } from 'lucide-react'
import { API_URL } from '@/lib/config'
import { useEffect, useState } from 'react'

interface TickerItem {
    symbol: string
    value: string
    change: string
    up: boolean
    alert?: boolean
}

export default function MarketTicker() {
    const [tickerItems, setTickerItems] = useState<TickerItem[]>([])

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const res = await fetch(`${API_URL}/api/status/pulse`)
                const data = await res.json()
                if (data.feed) {
                    setTickerItems(data.feed)
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchTicker()
        const interval = setInterval(fetchTicker, 30000)
        return () => clearInterval(interval)
    }, [])

    if (tickerItems.length === 0) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] w-full bg-black border-b border-white/10 overflow-hidden h-10 flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>

            <div className="flex items-center px-4 bg-zinc-900 h-full border-r border-white/10 z-20">
                <Activity className="w-4 h-4 text-blue-500 mr-2 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wider whitespace-nowrap">SOVEREIGN WIRE</span>
            </div>

            <motion.div
                className="flex items-center space-x-12 px-4 whitespace-nowrap"
                animate={{ x: [0, -2000] }}
                transition={{
                    repeat: Infinity,
                    duration: 120, // Slower for readability
                    ease: "linear"
                }}
            >
                {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold tracking-tight ${item.alert ? 'text-orange-500' : 'text-gray-400'} uppercase`}>
                            {item.symbol}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-white">
                            {item.value}
                        </span>
                        <div className={`flex items-center text-[10px] font-bold ${item.up ? 'text-green-500' : 'text-red-500'}`}>
                            {item.alert ? (
                                <AlertTriangle className="w-3 h-3 mr-1" />
                            ) : item.up ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {item.change}
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}
