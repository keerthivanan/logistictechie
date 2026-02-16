'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    const toggleDropdown = (label: string) => {
        if (activeDropdown === label) {
            setActiveDropdown(null)
        } else {
            setActiveDropdown(label)
        }
    }

    const navItems = [
        {
            label: "Marketplace",
            children: [
                { label: "Importers & Exporters", href: "/importers-exporters" },
                { label: "Forwarders", href: "/forwarders" },
                { label: "Carriers", href: "/carriers" }
            ]
        },
        {
            label: "Company",
            children: [
                { label: "About Us", href: "/about" },
                { label: "Careers", href: "/careers" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" }
            ]
        },
        {
            label: "Tools",
            children: [
                { label: "Freight Calculator", href: "/tools/calculator" },
                { label: "HS Codes", href: "/tools/hs-codes" }
            ]
        }
    ]

    return (
        <nav className="fixed top-10 left-0 right-0 bg-black/80 backdrop-blur-md z-40 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-4 bg-white rounded-sm group-hover:h-6 transition-all duration-300"></div>
                                <div className="w-2 h-4 bg-white/70 rounded-sm group-hover:h-5 transition-all duration-300"></div>
                                <div className="w-2 h-4 bg-white/40 rounded-sm group-hover:h-4 transition-all duration-300"></div>
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">OMEGO</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center space-x-8">
                        {navItems.map((item) => (
                            <div key={item.label} className="relative group">
                                <button className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-white transition-colors py-2">
                                    <span>{item.label}</span>
                                    <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                </button>

                                {/* Dropdown */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                                    <div className="bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-2 w-56 ring-1 ring-white/5">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/login" className="text-sm font-medium text-white hover:text-gray-300 transition-colors">Log In</Link>
                        <Link
                            href="/search"
                            className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all transform hover:scale-105"
                        >
                            Compare Rates
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white p-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-zinc-950 border-t border-white/10 absolute w-full left-0 z-50 h-screen overflow-y-auto">
                    <div className="px-4 pt-4 pb-20 space-y-6">
                        {navItems.map((item) => (
                            <div key={item.label}>
                                <button
                                    onClick={() => toggleDropdown(item.label)}
                                    className="flex items-center justify-between w-full text-left text-lg font-bold text-white mb-2"
                                >
                                    {item.label}
                                    <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                                </button>
                                {activeDropdown === item.label && (
                                    <div className="pl-4 space-y-3 border-l-2 border-white/10 ml-2">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.label}
                                                href={child.href}
                                                className="block text-gray-400 hover:text-white py-1"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-8 border-t border-white/10 space-y-4">
                            <Link href="/login" className="block text-center w-full py-4 text-white font-bold border border-white/10 rounded-xl">Log In</Link>
                            <Link
                                href="/search"
                                className="block bg-white text-black px-6 py-4 rounded-xl font-bold text-center w-full"
                            >
                                Compare Rates
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
