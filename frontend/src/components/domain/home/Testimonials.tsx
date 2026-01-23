"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
    {
        quote: "LogiTech transformed how we manage our supply chain. The real-time tracking and instant quotes have saved us countless hours.",
        author: "Sarah Chen",
        role: "VP of Operations",
        company: "TechCorp Industries",
        rating: 5,
        image: null
    },
    {
        quote: "The AI-powered predictions are incredibly accurate. We've reduced our transit delays by 40% since switching to LogiTech.",
        author: "Marcus Rodriguez",
        role: "Logistics Director",
        company: "Global Exports Ltd",
        rating: 5,
        image: null
    },
    {
        quote: "Finally, a logistics platform that actually works. The interface is beautiful and the support team is exceptional.",
        author: "Ahmed Al-Rashid",
        role: "CEO",
        company: "Gulf Trade Solutions",
        rating: 5,
        image: null
    }
];

export function TestimonialsSection() {
    const { t } = useLanguage();

    return (
        <section className="relative py-32 bg-black overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

            <div className="container relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <p className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-4">Testimonials</p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                        {t('testimonials.title')}
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('testimonials.subtitle')}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group"
                        >
                            <div className="h-full p-8 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.05] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.1] hover:from-white/[0.08]">
                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">{testimonial.author}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role} • {testimonial.company}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-20 text-center"
                >
                    <p className="text-gray-500 text-sm mb-6">Trusted by industry leaders worldwide</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                        {/* Placeholder logos - these would be real company logos */}
                        <div className="text-gray-500 text-2xl font-bold tracking-tight">DHL</div>
                        <div className="text-gray-500 text-2xl font-bold tracking-tight">FEDEX</div>
                        <div className="text-gray-500 text-2xl font-bold tracking-tight">MAERSK</div>
                        <div className="text-gray-500 text-2xl font-bold tracking-tight">MSC</div>
                        <div className="text-gray-500 text-2xl font-bold tracking-tight">CMA</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
