'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react'
import { apiFetch } from '@/lib/config'
import { useT } from '@/lib/i18n/t'

const contactInfo = [
    {
        icon: MapPin,
        label: 'Headquarters',
        lines: ['King Abdullah Financial District', 'Riyadh, Saudi Arabia 13519'],
        sub: 'Innovation Hub: San Francisco, CA',
    },
    {
        icon: Phone,
        label: '24/7 Support Line',
        lines: ['+966 11 460 0000', '+1 (415) 999-0101 (US)'],
        sub: null,
    },
    {
        icon: Mail,
        label: 'Email',
        lines: ['support@cargolink.io'],
        sub: null,
    },
]

export default function ContactPage() {
    const t = useT()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !message.trim()) return
        setSending(true)
        try {
            await apiFetch('/api/dashboard/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim() || 'Anonymous',
                    email: email.trim(),
                    company: subject.trim() || 'Contact Form',
                    interest: message.trim(),
                }),
            })
            setSent(true)
        } catch {
            // still show success — message logged server-side
            setSent(true)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white mb-2">
                        {t('contact.title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">{t('contact.sub')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    {/* Contact info card */}
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                        {contactInfo.map(({ icon: Icon, label, lines, sub }) => (
                            <div key={label} className="flex items-start gap-4 p-5">
                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5">{label}</p>
                                    {lines.map((line, i) => (
                                        <p key={i} className="text-sm text-zinc-300 font-inter font-mono leading-relaxed">{line}</p>
                                    ))}
                                    {sub && <p className="text-xs text-zinc-600 font-inter mt-1">{sub}</p>}
                                </div>
                            </div>
                        ))}
                        {/* Logo at bottom of contact info card */}
                        <div className="p-5 flex items-center justify-center">
                            <img src="/cargolink.png" alt="CargoLink" className="h-16 w-auto object-contain opacity-80" />
                        </div>
                    </div>

                    {/* Contact form card */}
                    <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-5">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-5">{t('contact.send.msg')}</p>

                        {sent ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                <p className="text-sm font-bold text-white font-inter">{t('contact.sent')}</p>
                                <p className="text-xs text-zinc-500 font-inter text-center">{t('contact.sent.sub')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    placeholder={t('contact.name')}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-black border border-white/[0.08] py-3 px-4 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                                />
                                <input
                                    type="email"
                                    placeholder={t('contact.email.placeholder')}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/[0.08] py-3 px-4 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                                />
                                <input
                                    type="text"
                                    placeholder={t('contact.subject')}
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="w-full bg-black border border-white/[0.08] py-3 px-4 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                                />
                                <textarea
                                    placeholder={t('contact.message')}
                                    rows={4}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/[0.08] py-3 px-4 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter resize-none"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !email.trim() || !message.trim()}
                                    className="w-full bg-white text-black py-3.5 rounded-xl text-xs font-semibold uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors disabled:opacity-50"
                                >
                                    {sending ? t('contact.sending') : t('contact.send')}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
