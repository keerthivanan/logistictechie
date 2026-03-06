'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    CheckCircle2,
    Circle,
    Loader2,
    Calendar,
    ArrowRight,
    ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
    id: string
    title: string
    description?: string
    task_type?: string
    status: 'PENDING' | 'COMPLETED' | 'ARCHIVED'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    due_date?: string
    created_at: string
}

export default function TasksPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<'NEWEST' | 'PRIORITY'>('NEWEST')
    const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'CRITICAL'>('ALL')

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return
        }

        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_URL}/api/tasks/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setTasks(data)
                }
            } catch (err) {
                console.error('Failed to fetch tasks', err)
            } finally {
                setLoading(false)
            }
        }

        if (user) fetchTasks()
    }, [user, authLoading, router])

    const handleToggle = async (taskId: string) => {
        setTogglingId(taskId)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/api/tasks/${taskId}/toggle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const updatedTask = await res.json()
                setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
            }
        } catch (err) {
            console.error('Failed to toggle task', err)
        } finally {
            setTogglingId(null)
        }
    }

    if (loading || authLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Optimizing Task View</p>
            </div>
        )
    }

    const priorityMap: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

    const sorted = tasks
        .filter(t => filterPriority === 'ALL' || t.priority === filterPriority)
        .sort((a, b) => {
            if (sortOrder === 'PRIORITY') return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

    const pendingTasks = sorted.filter(t => t.status === 'PENDING')
    const completedTasks = sorted.filter(t => t.status === 'COMPLETED')

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 flex-shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold tracking-tight text-white uppercase font-outfit">
                            Mission <span className="text-zinc-600">Control</span>
                        </h1>
                        <div className="h-3 w-px bg-white/10" />
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] font-inter">Protocol: Operational Sync</p>
                    </div>
                    <p className="text-zinc-600 font-medium font-inter text-xs">Executive actions required for cargo synchronization.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/[0.02] border border-white/5 px-5 py-3 rounded-2xl flex flex-col items-center">
                        <span className="text-lg font-bold font-inter text-white">{tasks.filter(t => t.status === 'PENDING').length}</span>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest font-inter">Active</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 px-5 py-3 rounded-2xl flex flex-col items-center">
                        <span className="text-lg font-bold font-inter text-zinc-500">{tasks.filter(t => t.status === 'COMPLETED').length}</span>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest font-inter">Done</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase font-outfit px-3 py-1 bg-white/5 rounded-lg border border-white/5">Active Duty</h3>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 border border-white/5 rounded-full p-1">
                        {(['NEWEST', 'PRIORITY'] as const).map(o => (
                            <button key={o} onClick={() => setSortOrder(o)}
                                className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${sortOrder === o ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                                {o}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-white/5 border border-white/5 rounded-full p-1">
                        {(['ALL', 'HIGH', 'CRITICAL'] as const).map(p => (
                            <button key={p} onClick={() => setFilterPriority(p)}
                                className={`text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all ${filterPriority === p ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content: pending grid | completed list */}
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-3 gap-4 overflow-hidden">
                {/* Pending tasks */}
                <div className="xl:col-span-2 overflow-y-auto custom-scrollbar pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {pendingTasks.length > 0 ? pendingTasks.map(task => (
                                <TaskCard key={task.id} task={task} onToggle={handleToggle} isToggling={togglingId === task.id} />
                            )) : (
                                <div className="col-span-full py-16 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-20">
                                    <CheckCircle2 className="w-8 h-8 mb-3" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Operational Equilibrium Achieved</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Completed tasks */}
                {completedTasks.length > 0 && (
                    <div className="xl:col-span-1 overflow-y-auto custom-scrollbar pr-1">
                        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-inter mb-3">Archived Protocol</h2>
                        <div className="space-y-2">
                            {completedTasks.map(task => (
                                <motion.div layout key={task.id}
                                    className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-2xl group hover:bg-white/[0.04] hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <button onClick={() => handleToggle(task.id)}
                                            className="w-5 h-5 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-black transition-all flex-shrink-0">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </button>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-zinc-400 tracking-tight line-through decoration-zinc-800 truncate">{task.title}</p>
                                            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-0.5">
                                                Resolved {new Date(task.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-zinc-800 flex-shrink-0" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function TaskCard({ task, onToggle, isToggling }: { task: Task; onToggle: (id: string) => void; isToggling: boolean }) {
    return (
        <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 hover:border-white/20 transition-all overflow-hidden">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.priority === 'CRITICAL' ? 'bg-red-500 animate-pulse' : task.priority === 'HIGH' ? 'bg-orange-500' : 'bg-zinc-600'}`} />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest font-inter">{task.priority} Vector</span>
                    </div>
                    <button onClick={() => onToggle(task.id)} disabled={isToggling}
                        className="w-6 h-6 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white hover:text-black transition-all flex-shrink-0 disabled:opacity-50">
                        {isToggling ? <Loader2 className="w-3 h-3 animate-spin text-zinc-500" /> : <Circle className="w-3 h-3" />}
                    </button>
                </div>
                <div className="space-y-1">
                    <h3 className="text-[12px] font-bold text-white font-outfit tracking-tight group-hover:text-emerald-400 transition-colors uppercase leading-tight">{task.title}</h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-inter">{task.description}</p>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-600">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] font-inter">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Limit'}
                        </span>
                    </div>
                    <button onClick={() => onToggle(task.id)} disabled={isToggling}
                        className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors font-inter disabled:opacity-40">
                        Commit <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
