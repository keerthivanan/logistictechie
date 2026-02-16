'use client'

import { Download, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Invoice {
    id: string
    date: string
    desc: string
    amount: string
    status: string
}

interface BillingData {
    invoices: Invoice[]
    stats: {
        outstanding: string
        last_payment: string
        credit_limit: string
        usage_percent: number
    }
}

export default function BillingPage() {
    const [data, setData] = useState<BillingData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        fetch('http://localhost:8000/api/billing/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
    )

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Billing & Invoices</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Outstanding Balance</div>
                    <div className="text-3xl font-bold text-white tracking-tighter">{data?.stats.outstanding || '$0.00'}</div>
                    <button
                        onClick={async () => {
                            const token = localStorage.getItem('token')
                            const res = await fetch('http://localhost:8000/api/billing/pay/all', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` }
                            })
                            if (res.ok) {
                                // Refresh data
                                const res2 = await fetch('http://localhost:8000/api/billing/me', {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                })
                                const data2 = await res2.json()
                                if (data2.success) setData(data2.data)
                            }
                        }}
                        className="mt-4 w-full bg-white text-black py-2 rounded-lg font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Pay All Owed
                    </button>
                </div>
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Last Payment</div>
                    <div className="text-3xl font-bold text-white">{data?.stats.last_payment || '$0.00'}</div>
                    <div className="text-xs text-gray-500 mt-2">Authenticated via Sovereign Ledger</div>
                </div>
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Credit Limit</div>
                    <div className="text-3xl font-bold text-white">{data?.stats.credit_limit}</div>
                    <div className="w-full bg-black/50 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-green-500 h-full transition-all duration-1000"
                            style={{ width: `${data?.stats.usage_percent ?? 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold">Invoice History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black/50 text-gray-400 text-sm uppercase">
                                <th className="px-6 py-4">Invoice</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Download</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {data?.invoices.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-white">{row.id}</td>
                                    <td className="px-6 py-4 text-gray-300">{row.date}</td>
                                    <td className="px-6 py-4 text-gray-300">{row.desc}</td>
                                    <td className="px-6 py-4 font-bold">{row.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-gray-400 hover:text-white">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
