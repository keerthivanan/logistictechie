
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
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
        desc: 'The ocean is unpredictable. Your supply chain shouldn’t be. Sovereign aggregates volume across the world’s most efficient tier-one carriers and sovereign nodes to secure spot rates that beat the market index by an average of 12%.',
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
    'road-freight': {
        title: 'Road Freight Control',
        subtitle: 'Unrivaled FTL and LTL connectivity across the continental logistics grid.',
        icon: Truck,
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=3870&auto=format&fit=crop',
        desc: 'Trucking is the pulse of commerce. Sovereign connects you to a verified fleet of 10,000+ carriers, offering real-time visibility and instant dynamic pricing for every lane. From last-mile delivery to heavy-haul FTL.',
        stats: [
            { label: 'Carrier Network', value: '10k+' },
            { label: 'Weekly Loads', value: '25k' },
            { label: 'On-Time Rate', value: '97.5%' }
        ],
        features: [
            { title: 'Dynamic FTL Routing', desc: 'AI-optimized routes that reduce fuel consumption and transit times by 15%.', icon: Zap },
            { title: 'LTL Consolidation', desc: 'Smarter cargo pooling to cut costs for smaller shipments without sacrificing speed.', icon: Package },
            { title: 'ELD Integration', desc: 'Direct data feed from electronic logging devices for 100% accurate tracking.', icon: Activity }
        ],
        workflow: ['Quote', 'Book', 'Dispatch', 'Transit', 'Delivered'],
        cta: 'Check Trucking Rates',
        ctaLink: '/search?mode=FTL'
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
        desc: 'Visibility is not enough. You need control. Sovereign unifies your ERP, Carriers, and Customs data into a single source of truth, giving you the power to predict and prevent disruptions.',
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
            <section className="relative bg-black min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl mb-12 leading-[1.1] tracking-tighter mx-auto">
                        {slug === 'ocean-freight' ? (
                            <>
                                Dominate the global trade<br />
                                lanes with guaranteed<br />
                                capacity and AI-driven<br />
                                routing.
                            </>
                        ) : service.subtitle}
                    </h1>

                    {/* Stats Row */}
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-12">
                        {service.stats.map((stat: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="text-3xl md:text-4xl font-bold text-white tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <Link href={service.ctaLink} className="inline-flex items-center px-7 py-3.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition-colors text-sm">
                        {service.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* --- MAIN CONTENT & FEATURES --- */}
            <section className="py-24 relative bg-black border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">

                    <div className="grid md:grid-cols-2 gap-20 mb-32 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Why the market <br /> is switching.</h2>
                            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
                                {service.desc}
                            </p>
                        </div>
                        <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                            <img src={service.image} className="w-full h-full object-cover" alt="Feature Visual" />
                        </div>
                    </div>

                    {/* --- FEATURE CARDS GRID --- */}
                    <div className={slug === 'ocean-freight' ? '' : 'mb-32'}>
                        {slug === 'ocean-freight' && (
                            <div className="mb-12 text-center">
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8">Intelligence Protocol</h2>
                            </div>
                        )}
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            {service.features.map((feature: any, i: number) => (
                                <div key={i} className="group space-y-4">
                                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                    <p className="text-zinc-500 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- WORKFLOW STEPS --- */}
                    <div className="border-t border-white/5 pt-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold mb-4">The Protocol</h2>
                        </div>

                        <div className="flex flex-wrap justify-center items-center gap-6">
                            {service.workflow.map((step: string, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="px-8 py-4 rounded-full bg-black border border-white/10 text-white font-bold text-xs uppercase tracking-widest">
                                        <span className="text-blue-500 mr-2">{i + 1}.</span> {step}
                                    </div>
                                    {i < service.workflow.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-zinc-800" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="py-32 bg-black border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to upgrade your logistics?</h2>
                    <p className="text-xl text-gray-400 mb-10">
                        Join 2,000+ forward-thinking shippers who have switched to the Sovereign Operating System.
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
