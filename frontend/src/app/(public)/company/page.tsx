"use client";

import { motion } from "framer-motion";
import { Users, Target, Award, Globe, MapPin, Mail, Linkedin, CheckCircle } from "lucide-react";

export default function CompanyPage() {

    const values = [
        {
            icon: Target,
            title: "Precision",
            description: "Every detail matters. We deliver accurate quotes and reliable tracking information."
        },
        {
            icon: Users,
            title: "Transparency",
            description: "No hidden fees, no surprises. Complete visibility into your shipment costs and status."
        },
        {
            icon: Award,
            title: "Excellence",
            description: "We set the standard for digital freight forwarding with industry-leading technology."
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Local expertise in every market, with coverage spanning 200+ countries worldwide."
        },
    ];

    const stats = [
        { value: "50+", label: "Carrier Partners" },
        { value: "200+", label: "Countries Served" },
        { value: "10K+", label: "Daily Shipments" },
        { value: "99.9%", label: "Platform Uptime" },
    ];

    const team = [
        { name: "Sarah Mitchell", role: "CEO & Founder", bio: "15+ years in global logistics and supply chain management." },
        { name: "David Chen", role: "CTO", bio: "Former engineering lead at top logistics technology companies." },
        { name: "Maria Garcia", role: "VP Operations", bio: "Expert in carrier relations and freight operations." },
    ];

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            {/* Hero Section */}
            <section className="container max-w-5xl mx-auto px-6 text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">About Us</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Transforming Global Logistics
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        We&apos;re building the future of freight forwarding—making global shipping
                        as simple and transparent as booking a flight.
                    </p>
                </motion.div>
            </section>

            {/* Stats Row */}
            <section className="container max-w-7xl mx-auto px-6 mb-24">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center hover:border-zinc-700 transition-all"
                        >
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                            <span className="text-zinc-500 text-sm">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission Section */}
            <section className="container max-w-7xl mx-auto px-6 mb-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-sm font-medium text-emerald-500 mb-4 block">Our Mission</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Making Freight Simple
                        </h2>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>
                                For too long, the freight industry has been plagued by complexity,
                                opacity, and inefficiency. We're changing that.
                            </p>
                            <p>
                                Our platform connects shippers directly with carriers, providing
                                real-time visibility into rates, schedules, and shipment status.
                                No more phone calls, spreadsheets, or waiting days for a quote.
                            </p>
                            <p>
                                We believe that every business—from startups to enterprises—deserves
                                access to the same powerful logistics tools and competitive rates.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8"
                    >
                        <h3 className="text-xl font-semibold text-white mb-6">Platform Capabilities</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Multi-Carrier Rate Comparison", status: "Live" },
                                { label: "Real-Time Container Tracking", status: "Live" },
                                { label: "Instant Quote Generation", status: "Live" },
                                { label: "AI-Powered Documentation", status: "Beta" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                                    <span className="text-zinc-300">{item.label}</span>
                                    <div className="flex items-center gap-2 text-emerald-500 text-sm">
                                        <CheckCircle className="h-4 w-4" />
                                        {item.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="container max-w-7xl mx-auto px-6 mb-24 border-t border-zinc-900 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">Our Values</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">What Drives Us</h2>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-6">
                    {values.map((v, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:text-black transition-colors">
                                <v.icon className="h-6 w-6" />
                            </div>
                            <h4 className="font-semibold text-white mb-2">{v.title}</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">{v.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section className="container max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12"
                >
                    <div className="text-center mb-12">
                        <span className="text-sm font-medium text-emerald-500 mb-4 block">Get in Touch</span>
                        <h2 className="text-3xl font-bold text-white">Contact Us</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: MapPin, title: "Headquarters", sub: "Singapore • Dubai • Rotterdam" },
                            { icon: Mail, title: "Email Us", sub: "hello@phoenixos.com" },
                            { icon: Linkedin, title: "Follow Us", sub: "linkedin.com/company/phoenixos" },
                        ].map((c, i) => (
                            <div key={i} className="text-center">
                                <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <c.icon className="h-5 w-5 text-white" />
                                </div>
                                <div className="font-semibold text-white mb-1">{c.title}</div>
                                <div className="text-zinc-500 text-sm">{c.sub}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>
        </main>
    );
}
