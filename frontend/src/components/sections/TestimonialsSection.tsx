'use client'

import { Star } from 'lucide-react'

const testimonials = [
    {
        name: "Henrik Russell",
        role: "Global Logistics Director",
        quote: "SOVEREIGN has an impressive set of features, super competitive pricing, and the best tracking accuracy in the industry. The UI is very intuitive and the smart use of small diagrams, sparklines and graphs make it easy to follow the progress.",
    },
    {
        name: "Steffan Fisher",
        role: "Supply Chain VP",
        quote: "I love that you can see a side-by-side comparison of spot rates and contract rates. Our last software did not have this feature and it made it difficult to get the overall picture.",
    },
    {
        name: "John Richards",
        role: "Freight Forwarder",
        quote: "The customer support is fantastic and timely. Also, enjoy the rich design of the platform with incredible integrations like ERP and Port Community Systems for added insights gathering.",
    },
    {
        name: "Mathew Cooper",
        role: "Import Manager",
        quote: "One of the best things about SOVEREIGN is the ability to send daily reports that are extremely customizable. Some of my clients have different levels of understanding, so this gives you the ability to showcase brilliant reports.",
    },
    {
        name: "Marvin McKinney",
        role: "CEO, FastShip",
        quote: "SOVEREIGN is truly amazing and delivers what it promises! I signed up two years ago and haven't looked back. It is definitely giving its rivals a run for their money! The way this platform organizes information is unmatched.",
    },
    {
        name: "Ethan Sullivan",
        role: "Logistics Analyst",
        quote: "What I like the most is the visual representation of rankings, especially the overall average position and evolution for specific lanes. In a split second, I can see how well we perform.",
    }
]

export default function TestimonialsSection() {
    return (
        <section className="py-24 bg-black border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by Logistics Pros</h2>
                    <p className="text-gray-400">Don&apos;t just take our word for it. See what experts are saying about our accuracy and design.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-zinc-900/30 border border-white/10 p-8 rounded-2xl hover:bg-zinc-900/50 transition-colors">
                            <div className="mb-6">
                                <h3 className="font-bold text-lg text-white">{t.name}</h3>
                                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">{t.role}</p>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">&quot;{t.quote}&quot;</p>
                            <div className="flex gap-1 mt-6">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
