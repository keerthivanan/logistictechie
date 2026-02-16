'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [preferences, setPreferences] = useState({ email: true, sms: false })

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return
            const res = await fetch('http://localhost:8000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setUser(data)
            if (data.preferences) {
                try {
                    setPreferences(JSON.parse(data.preferences))
                } catch (e) {
                    console.error('Failed to parse preferences', e)
                }
            }
        } catch (e) {
            console.error('Failed to fetch user', e)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('http://localhost:8000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: user.full_name,
                    company_name: user.company_name,
                    preferences: JSON.stringify(preferences)
                })
            })
            if (res.ok) {
                setMessage('Sovereign Profile updated!')
                setTimeout(() => setMessage(''), 3000)
            }
        } catch (e) {
            setMessage('Error saving profile.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing Identity...</div>
        </div>
    )

    return (
        <div className="max-w-4xl space-y-8 pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold">Settings</h2>

            <form onSubmit={handleSave} className="bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Profile Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-tighter">Full Name</label>
                        <input
                            type="text"
                            value={user?.full_name || ''}
                            onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                            className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-white transition-all outline-none"
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-tighter">Company Name</label>
                        <input
                            type="text"
                            value={user?.company_name || ''}
                            onChange={(e) => setUser({ ...user, company_name: e.target.value })}
                            className="w-full bg-black border border-white/10 p-3 rounded-lg text-white focus:border-white transition-all outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-tighter">Email Address (Locked)</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full bg-black/50 border border-white/5 p-3 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    {message && <span className="text-sm text-green-400 animate-pulse font-bold">{message}</span>}
                </div>
            </form>

            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Notifications
                </h3>
                <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group p-4 bg-black/50 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                        <span className="font-medium text-gray-300">Email notifications for new quotes</span>
                        <input
                            type="checkbox"
                            checked={preferences.email}
                            onChange={(e) => setPreferences({ ...preferences, email: e.target.checked })}
                            className="w-5 h-5 accent-white rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group p-4 bg-black/50 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                        <span className="font-medium text-gray-300">SMS alerts for shipment delays</span>
                        <input
                            type="checkbox"
                            checked={preferences.sms}
                            onChange={(e) => setPreferences({ ...preferences, sms: e.target.checked })}
                            className="w-5 h-5 accent-white rounded"
                        />
                    </label>
                </div>
                <p className="mt-4 text-[10px] text-gray-500 text-center italic">
                    Notification nodes are managed by the Sovereign Sentinel protocol.
                </p>
            </div>
        </div>
    )
}
