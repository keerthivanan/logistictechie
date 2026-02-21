'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ClipboardList,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle,
    ArrowRight,
    Loader2,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { API_URL } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
    id: string;
    title: string;
    description?: string;
    task_type?: string;
    status: 'PENDING' | 'COMPLETED' | 'ARCHIVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    due_date?: string;
    created_at: string;
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
                console.error("Failed to fetch tasks", err)
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
            console.error("Failed to toggle task", err)
        } finally {
            setTogglingId(null)
        }
    }

    if (loading || authLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-white opacity-10" />
                <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em]">Optimizing Task View</p>
            </div>
        )
    }

    // Apply Sorting and Filtering
    const sortedAndFilteredTasks = tasks
        .filter(t => filterPriority === 'ALL' || t.priority === filterPriority)
        .sort((a, b) => {
            if (sortOrder === 'PRIORITY') {
                const priorityMap = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
                return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0)
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

    const pendingTasks = sortedAndFilteredTasks.filter(t => t.status === 'PENDING')
    const completedTasks = sortedAndFilteredTasks.filter(t => t.status === 'COMPLETED')

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-6">
            {/* Header section with strategic overview */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operational Protocol</span>
                    </div>
                    <h1 className="text-5xl font-bold font-outfit tracking-tighter uppercase italic italic-none">Mission Control <span className="text-zinc-700">/</span> Tasks</h1>
                    <p className="text-zinc-500 font-medium font-inter max-w-md">Executive actions required for cargo synchronization and multi-modal stability.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl flex flex-col items-center group cursor-default">
                        <span className="text-2xl font-bold font-outfit text-white group-hover:text-emerald-400 transition-colors">{tasks.filter(t => t.status === 'PENDING').length}</span>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active Vectors</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl flex flex-col items-center group cursor-default">
                        <span className="text-2xl font-bold font-outfit text-zinc-500">{tasks.filter(t => t.status === 'COMPLETED').length}</span>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Resolved</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* Active Tasks Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] font-outfit flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Active Duty
                        </h2>
                        <div className="flex items-center gap-6">
                            <div className="flex bg-white/5 rounded-full p-1">
                                <button
                                    onClick={() => setSortOrder('NEWEST')}
                                    className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${sortOrder === 'NEWEST' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    Newest
                                </button>
                                <button
                                    onClick={() => setSortOrder('PRIORITY')}
                                    className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${sortOrder === 'PRIORITY' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                                >
                                    Priority
                                </button>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex bg-white/5 rounded-full p-1">
                                {(['ALL', 'HIGH', 'CRITICAL'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setFilterPriority(p)}
                                        className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${filterPriority === p ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {pendingTasks.length > 0 ? (
                                pendingTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} onToggle={handleToggle} isToggling={togglingId === task.id} />
                                ))
                            ) : (
                                <div className="col-span-full py-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-20">
                                    <CheckCircle2 className="w-10 h-10 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-[0.2em]">Operational Equilibrium Achieved</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Recently Resolved Section */}
                {completedTasks.length > 0 && (
                    <section className="space-y-6 pt-12 border-t border-white/5">
                        <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] font-outfit">Archived Protocol</h2>
                        <div className="space-y-3 max-w-3xl">
                            {completedTasks.map((task) => (
                                <motion.div
                                    layout
                                    key={task.id}
                                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleToggle(task.id)}
                                            className="w-5 h-5 rounded-full border border-emerald-500/50 flex items-center justify-center text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black transition-all"
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                        </button>
                                        <div>
                                            <p className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors tracking-tight line-through decoration-zinc-800">{task.title}</p>
                                            <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-0.5">Resolved {new Date(task.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}

function TaskCard({ task, onToggle, isToggling }: { task: Task, onToggle: (id: string) => void, isToggling: boolean }) {
    const priorityColors = {
        CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/20',
        HIGH: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        MEDIUM: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        LOW: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/20 transition-all shadow-2xl overflow-hidden"
        >
            {/* Visual background element */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-blue-500/5 transition-all duration-700" />

            <div className="relative space-y-6">
                <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </span>
                    <button
                        onClick={() => onToggle(task.id)}
                        disabled={isToggling}
                        className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all group/check disabled:opacity-50"
                    >
                        {isToggling ? <Loader2 className="w-3 h-3 animate-spin text-zinc-500" /> : <Circle className="w-3 h-3 group-hover/check:scale-125 transition-transform" />}
                    </button>
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white font-outfit tracking-tight group-hover:text-emerald-400 transition-colors">{task.title}</h3>
                    <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-inter font-medium">{task.description}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-zinc-600">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Deadline'}
                            </span>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">
                        Execute <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
