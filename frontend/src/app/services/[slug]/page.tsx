'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Ship, Plane, Warehouse, Anchor, BarChart, ShieldCheck,
    ArrowRight, CheckCircle, Clock, Zap, Globe, TrendingUp,
    FileCheck, Truck, Package, Activity
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// --- MAGNUM OPUS DATA DICTIONARY ---
const services: Record<string, any> = {
    'ocean-freight': {
        title: 'Ocean Freight Control',
        subtitle: 'Dominate the global trade lanes with guaranteed capacity and AI-driven routing.',
        icon: Ship,
        image: 'https://images.unsplash.com/photo-1543329241-7667232247fb?q=80&w=2070&auto=format&fit=crop',
        desc: 'The ocean is unpredictable. Your supply chain shouldn’t be. OMEGO aggregates volume across 50+ major carriers (Maersk, MSC, CMA CGM) to secure spot rates that beat the market index by an average of 12%.',
        stats: [
            { label: 'Global Carriers', value: '50+' },
            { label: 'Daily TEUs', value: '12k' },
            { label: 'On-Time Rate', value: '98%' }
        ],
        features: [
            { title: 'AIS Satellite Tracking', desc: 'Real-time visibility down to the container level, powered by localized satellite telemetry.', icon: Globe },
            { title: 'Guaranteed Allocation', desc: 'Secure space during peak season with our locked-in block space agreements.', icon: ShieldCheck },
            { title: 'Green Channels', desc: 'Carbon-neutral shipping options to meet your ESG sustainability targets.', icon: FileCheck }
        ],
        workflow: ['Quote', 'Book', 'Gate-In', 'Sail', 'Release'],
        cta: 'Search Ocean Rates',
        ctaLink: '/search?mode=FCL'
    },
    'air-freight': {
        title: 'Air Freight Precision',
        subtitle: 'Mach-speed logistics for high-value, time-critical cargo.',
        icon: Plane,
        image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=3870&auto=format&fit=crop',
        desc: 'When "tomorrow" is too late. Our NFO (Next Flight Out) and chartered solutions ensure your cargo lands before your competitors even take off. We bypass congestion with direct tarmac access.',
        stats: [
            { label: 'Airports Served', value: '250+' },
            { label: 'Transit Time', value: '<24h' },
            { label: 'Success Rate', value: '99.9%' }
        ],
        features: [
            { title: 'NFO (Next Flight Out)', desc: 'Immediate dispatch on the next available commercial or cargo flight.', icon: Zap },
            { title: 'Cold Chain Pharma', desc: 'Temperature-controlled logistics for sensitive medical and perishable goods.', icon: Activity },
            { title: 'DDP Express', desc: 'Delivered Duty Paid options for seamless door-to-door execution.', icon: Truck }
        ],
        workflow: ['Pickup', 'Tarmac', 'Flight', 'Clearance', 'Delivery'],
        cta: 'Get Air Quote',
        ctaLink: '/search?mode=AIR'
    },
    'customs-compliance': {
        title: 'AI Customs Clearance',
        subtitle: 'Zero-friction border crossings powered by generative AI.',
        icon: ShieldCheck,
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=3870&auto=format&fit=crop',
        desc: 'Stop letting paperwork delay your supply chain. Our AI engine classifies HS codes with 99.9% accuracy and auto-files entry documents with CBP, FDA, and global customs authorities.',
        stats: [
            { label: 'Clearance Time', value: '<2h' },
            { label: 'Penalty Save', value: '$15M+' },
            { label: 'Countries', value: '180+' }
        ],
        features: [
            { title: 'Auto-Classification', desc: 'AI automatically detects the correct HS Code for your products.', icon: FileCheck },
            { title: 'Duty Drawback', desc: 'Recover overpaid duties with our automated audit and refund engine.', icon: TrendingUp },
            { title: 'Risk Shield', desc: 'Proactive alerts for regulatory changes and trade restriction updates.', icon: ShieldCheck }
        ],
        workflow: ['Upload', 'Analyze', 'Classify', 'File', 'Release'],
        cta: 'Find HS Codes',
        ctaLink: '/tools/hs-codes'
    },
    'smart-warehousing': {
        title: 'Smart Warehousing',
        subtitle: 'On-demand fulfillment network powered by robotics.',
        icon: Warehouse,
        image: 'https://images.unsplash.com/photo-1589792923962-537704632910?q=80&w=3870&auto=format&fit=crop',
        desc: 'Scale your footprint without the CapEx. Access 500+ tech-enabled fulfillment centers worldwide. Pay only for the space you use and let our robots handle the picking.',
        stats: [
            { label: 'Global Nodes', value: '500+' },
            { label: 'Pick Speed', value: '2s' },
            { label: 'Accuracy', value: '99.99%' }
        ],
        features: [
            { title: 'Robotic Fulfillment', desc: 'Automated picking arms and AMRs ensure 100% order accuracy.', icon: Zap },
            { title: 'Inventory Optimization', desc: 'AI distributes stock closer to your customers to cut delivery costs.', icon: TrendingUp },
            { title: 'Same-Day Delivery', desc: 'Enable Amazon-like delivery speeds for your own brand.', icon: Truck }
        ],
        workflow: ['Inbound', 'Store', 'Order', 'Pick', 'Ship'],
        cta: 'Join Network',
        ctaLink: '/signup'
    },
    'port-drayage': {
        title: 'Port Drayage & Trucking',
        subtitle: 'Seamless first-mile connectivity to eliminate demurrage.',
        icon: Anchor,
        image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=3870&auto=format&fit=crop',
        desc: 'The gap between port and warehouse is where money is lost. We bridge it with a digital fleet of 10,000+ chassis and drayage trucks, all trackable in real-time.',
        stats: [
            { label: 'Truck Network', value: '10k+' },
            { label: 'Demurrage Saved', value: '$40M' },
            { label: 'On-time Gate', value: '97%' }
        ],
        features: [
            { title: 'Instant Chassis', desc: 'Never miss a container pickup due to chassis shortages again.', icon: Truck },
            { title: 'Gate Automation', desc: 'Digital appointment booking with all major terminals (LA/LB, NY/NJ).', icon: Clock },
            { title: 'Street Turns', desc: 'Optimize empty container returns to save money and reduce emissions.', icon: Globe }
        ],
        workflow: ['Vessel Arrival', 'Discharge', 'Pickup', 'Dray', 'Drop'],
        cta: 'Track Fleet',
        ctaLink: '/tracking'
    },
    'supply-chain-tower': {
        title: 'Supply Chain Control Tower',
        subtitle: 'The centralized operating system for global trade.',
        icon: BarChart,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3870&auto=format&fit=crop',
        desc: 'Visibility is not enough. You need control. OMEGO unifies your ERP, Carriers, and Customs data into a single source of truth, giving you the power to predict and prevent disruptions.',
        stats: [
            { label: 'Data Points', value: '1B+' },
            { label: 'Integrations', value: '50+' },
            { label: 'ROI', value: '10x' }
        ],
        features: [
            { title: 'Predictive ETAs', desc: 'Machine learning algorithms that predict delays 3 days before they happen.', icon: Activity },
            { title: 'Landed Cost', desc: 'Calculate the true profitability of every SKU in your inventory.', icon: TrendingUp },
            { title: 'Supplier Scorecards', desc: 'Rate your vendors based on real-world performance data.', icon: CheckCircle }
        ],
        workflow: ['Connect', 'Visualize', 'Analyze', 'Predict', 'Act'],
        cta: 'View Dashboard',
        ctaLink: '/dashboard'
    }
};



export default function ServicePage() {
    const params = useParams();
    const slug = params.slug as string;
    const service = services[slug];

    if (!service) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
                    <Link href="/" className="text-blue-500 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    const Icon = service.icon;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 z-10">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 backdrop-blur-md mb-8 border border-white/10 shadow-2xl">
                        <Icon className="w-8 h-8 text-blue-400" />
                        <span className="ml-3 text-sm font-bold text-blue-200 tracking-widest uppercase">
                            OMEGO {slug.replace('-', ' ')}
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 max-w-4xl">
                        {service.title}
                    </h1>

                    <p className="text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                        {service.subtitle}
                    </p>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mb-12 border-t border-white/10 pt-8">
                        {service.stats.map((stat: any, i: number) => (
                            <div key={i}>
                                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <Link href={service.ctaLink} className="group inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]">
                        {service.cta}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* --- MAIN CONTENT & FEATURES --- */}
            <section className="py-32 relative bg-zinc-950">
                <div className="max-w-7xl mx-auto px-4">

                    <div className="grid md:grid-cols-2 gap-20 mb-32 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Why Industry Leaders Choose OMEGO.</h2>
                            <p className="text-lg text-gray-400 leading-relaxed">
                                {service.desc}
                            </p>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                            <img src={service.image} className="relative z-10 rounded-3xl border border-white/10 shadow-2xl rotate-1 hover:rotate-0 transition-all duration-700" alt="Dashboard Preview" />
                        </div>
                    </div>

                    {/* --- FEATURE CARDS GRID --- */}
                    <div className="mb-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Engineered for Perfection</h2>
                            <p className="text-gray-400">Every component is optimized for speed, cost, and reliability.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {service.features.map((feature: any, i: number) => (
                                <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <feature.icon className="w-6 h-6 text-blue-400 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- WORKFLOW STEPS --- */}
                    <div className="border-t border-white/10 pt-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">Operational Workflow</h2>
                            <p className="text-gray-400">How we execute your shipments from start to finish.</p>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                            {service.workflow.map((step: string, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="px-6 py-3 rounded-full bg-zinc-900 border border-white/10 text-white font-bold text-sm">
                                        <span className="text-blue-500 mr-2">0{i + 1}.</span> {step}
                                    </div>
                                    {i < service.workflow.length - 1 && (
                                        <div className="w-12 h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent hidden md:block"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-24 bg-gradient-to-b from-zinc-950 to-blue-950/20 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to upgrade your logistics?</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Join 2,000+ forward-thinking shippers who have switched to the OMEGO Operating System.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
                            Get Started Now
                        </Link>
                        <Link href="/contact" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
