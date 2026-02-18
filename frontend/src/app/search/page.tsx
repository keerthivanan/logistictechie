'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, MapPin, ArrowRight, Package, Calendar, DollarSign, Truck, Box, X, Info, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '@/components/layout/Footer'

// --- Types ---
type Location = {
  type: 'Factory/Warehouse' | 'Business Address' | 'Port' | 'Airport'
  country: string
  city: string
  zip: string
}

type Load = {
  mode: 'LCL' | 'FCL' | 'Air'
  units: number
  packageType: 'Pallets' | 'Boxes' | 'Crates'
  dims: { l: string; w: string; h: string; unit: 'cm' | 'in' }
  weight: { value: string; unit: 'kg' | 'lb' }
  containerType: '20FT' | '40FT' | '40HC'
}

type Goods = {
  value: string
  currency: 'USD' | 'EUR' | 'CNY'
  isPersonal: boolean
  isHazardous: boolean
  readyDate: string
}

export default function SearchPage() {
  const router = useRouter()

  // --- State ---
  const [activePopup, setActivePopup] = useState<'origin' | 'destination' | 'load' | 'goods' | 'vessels' | 'locations' | 'commodities' | null>(null)

  const [origin, setOrigin] = useState<Location>({
    type: 'Factory/Warehouse',
    country: 'China',
    city: '',
    zip: ''
  })

  const [destination, setDestination] = useState<Location>({
    type: 'Business Address',
    country: 'United States',
    city: '',
    zip: ''
  })

  const [load, setLoad] = useState<Load>({
    mode: 'FCL',
    units: 1,
    packageType: 'Pallets',
    dims: { l: '120', w: '100', h: '100', unit: 'cm' },
    weight: { value: '500', unit: 'kg' },
    containerType: '40FT'
  })

  const [goods, setGoods] = useState<Goods>({
    value: '',
    currency: 'USD',
    isPersonal: false,
    isHazardous: false,
    readyDate: ''
  })

  // --- Refs for Click Outside ---
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- Handlers ---
  const handleSearch = () => {
    if (origin.city && destination.city && goods.value) {
      // Map complex state to simple params for Results Page
      const containerMap = load.mode === 'FCL' ? load.containerType : 'LCL'

      const query = new URLSearchParams({
        origin: origin.city, // e.g. "Shanghai"
        destination: destination.city, // e.g. "New York"
        container: containerMap,
        value: goods.value
      }).toString()
      router.push(`/results?${query}`)
    }
  }

  // --- Popups ---

  // --- Maersk Components ---
  const MaerskToolCard = ({ title, desc, icon, onClick }: any) => (
    <div onClick={onClick} className="bg-black border border-white/10 rounded-xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-zinc-900 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  )

  const ToolModal = ({ title, onClose, children }: any) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  )

  const VesselList = () => {
    const [vessels, setVessels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      fetch(`${API_URL}/api/vessels/active`)
        .then(res => res.json())
        .then(data => {
          setVessels(data.vessels || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [])

    if (loading) return <div className="text-center py-10 text-gray-400">Syncing with Global AIS Network...</div>

    return (
      <div className="space-y-3">
        {vessels.map((v, i) => (
          <div key={i} className="flex justify-between items-center bg-black/50 p-4 rounded-lg border border-white/5">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-bold text-white">{v.name}</div>
                <div className="text-xs text-gray-500">IMO: {v.imo} | Flag: {v.flag}</div>
              </div>
            </div>
            <div className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded font-bold">ACTIVE</div>
          </div>
        ))}
      </div>
    )
  }

  const LocationSearch = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    const handleSearch = async () => {
      setSearching(true)
      try {
        const res = await fetch(`${API_URL}/api/references/ports/search?q=${query}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch (e) { }
      setSearching(false)
    }

    return (
      <div>
        <div className="flex space-x-2 mb-6">
          <input
            className="flex-1 bg-black border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            placeholder="Enter city or port code..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-6 rounded-lg font-bold">Search</button>
        </div>
        <div className="space-y-2">
          {searching ? (
            <div className="text-center text-gray-500">Scanning Logistics Network...</div>
          ) : results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                <div>
                  <div className="font-bold text-white">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.country} | {r.code}</div>
                </div>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 uppercase">{r.type}</span>
              </div>
            ))
          ) : <div className="text-center text-gray-500 text-sm">Enter a location to search</div>}
        </div>
      </div>
    )
  }

  const CommoditySearch = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    const handleSearch = async () => {
      setSearching(true)
      try {
        const res = await fetch(`${API_URL}/api/references/commodities/search?q=${query}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch (e) { }
      setSearching(false)
    }

    return (
      <div>
        <div className="flex space-x-2 mb-6">
          <input
            className="flex-1 bg-black border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            placeholder="Enter commodity (e.g. Copper)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-6 rounded-lg font-bold">Check</button>
        </div>
        <div className="space-y-2">
          {searching ? (
            <div className="text-center text-gray-500">Classifying...</div>
          ) : results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                <div>
                  <div className="font-bold text-white">{r.commodityName}</div>
                  <div className="text-xs text-gray-500">Code: {r.commodityCode}</div>
                </div>
              </div>
            ))
          ) : <div className="text-center text-gray-500 text-sm">Search for HS Codes</div>}
        </div>
      </div>
    )
  }

  const LocationPopup = ({ title, data, setData }: { title: string, data: Location, setData: (d: Location) => void }) => (
    <div className="absolute top-full left-0 mt-2 w-[450px] bg-white text-black rounded-xl shadow-2xl border border-gray-200 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl tracking-tight text-gray-900">{title}</h3>
        <button onClick={() => setActivePopup(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
          <X className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Type</label>
          <div className="relative group">
            <select
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value as any })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-medium appearance-none cursor-pointer group-hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            >
              <option>Factory/Warehouse</option>
              <option>Business Address</option>
              <option>Port</option>
              <option>Airport</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Country</label>
          <div className="relative group">
            <select
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-medium appearance-none cursor-pointer group-hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            >
              <option value="China">🇨🇳 China</option>
              <option value="United States">🇺🇸 United States</option>
              <option value="India">🇮🇳 India</option>
              <option value="Germany">🇩🇪 Germany</option>
              <option value="United Kingdom">🇬🇧 United Kingdom</option>
              <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
              <option value="Vietnam">🇻🇳 Vietnam</option>
              <option value="Japan">🇯🇵 Japan</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Address / City</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter city, port, or zip code..."
            value={data.city}
            onChange={(e) => setData({ ...data, city: e.target.value })}
            autoFocus
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm transition-all placeholder:text-gray-400"
          />
        </div>
        {!data.city && <p className="text-red-500 text-xs mt-2 font-medium flex items-center animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>Required to search rates</p>}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button title="Confirm Selection" onClick={() => setActivePopup(null)} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:transform active:scale-95 transition-all">
          Confirm Location
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold tracking-tight text-white">OMEGO</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-visible">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            Where would you like to ship?
          </h1>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Start searching to compare, book and manage your freight.
            <br />
            <span className="text-sm mt-4 block text-gray-500">
              Once you make your first booking, we make it easy to manage your shipment.
              <Link href="/demo" className="text-blue-500 hover:text-blue-400 ml-1 font-medium hover:underline">Learn more</Link>
            </span>
          </p>

          {/* Search Form Container */}
          <div ref={popupRef} className="bg-white rounded-lg shadow-2xl p-1 max-w-5xl mx-auto relative z-40">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">

              {/* Origin */}
              <div
                className={`relative md:col-span-3 p-2 group cursor-pointer transition-all duration-200 ${activePopup === 'origin' ? 'ring-2 ring-inset ring-blue-600 bg-blue-50/30 z-30 rounded-tl-lg' : 'hover:bg-gray-50'}`}
                onClick={() => setActivePopup('origin')}
              >
                <label className="block text-xs font-bold text-gray-500 uppercase px-2 pt-1 flex items-center tracking-wider">
                  Origin <span className="text-red-500 ml-1 text-lg leading-3">*</span>
                </label>
                <div className="px-2 pb-1 text-black font-bold text-lg truncate flex items-center h-8">
                  {origin.city ? (
                    <div className="flex flex-col leading-none">
                      <span className="text-[15px]">{origin.city}</span>
                      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{origin.country}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 font-normal text-base">Factory/Warehouse</span>
                  )}
                </div>
                {/* Visual Red Dot if empty */}
                {!origin.city && <div className="w-2 h-2 rounded-full bg-red-500 absolute top-4 right-4 animate-pulse"></div>}

                {/* POPUP */}
                <AnimatePresence>
                  {activePopup === 'origin' && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} onClick={(e) => e.stopPropagation()}>
                      <LocationPopup title="Where are you shipping from?" data={origin} setData={setOrigin} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Destination */}
              <div
                className={`relative md:col-span-3 p-2 group cursor-pointer transition-all duration-200 ${activePopup === 'destination' ? 'ring-2 ring-inset ring-blue-600 bg-blue-50/30 z-30' : 'hover:bg-gray-50'}`}
                onClick={() => setActivePopup('destination')}
              >
                <label className="block text-xs font-bold text-gray-500 uppercase px-2 pt-1 tracking-wider">
                  Destination
                </label>
                <div className="px-2 pb-1 text-black font-bold text-lg truncate flex items-center h-8">
                  {destination.city ? (
                    <div className="flex flex-col leading-none">
                      <span className="text-[15px]">{destination.city}</span>
                      <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{destination.country}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 font-normal text-base">Where to?</span>
                  )}
                </div>

                {/* POPUP */}
                <AnimatePresence>
                  {activePopup === 'destination' && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} onClick={(e) => e.stopPropagation()}>
                      <LocationPopup title="Where are you shipping to?" data={destination} setData={setDestination} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Load */}
              <div
                className={`relative md:col-span-3 p-2 group cursor-pointer transition-all duration-200 ${activePopup === 'load' ? 'ring-2 ring-inset ring-blue-600 bg-blue-50/30 z-30' : 'hover:bg-gray-50'}`}
                onClick={() => setActivePopup('load')}
              >
                <label className="block text-xs font-bold text-gray-500 uppercase px-2 pt-1 tracking-wider">
                  Load
                </label>
                <div className="px-2 pb-1 text-black font-bold text-lg truncate flex items-center h-8">
                  {load.mode === 'FCL' ? (
                    <span className="text-[15px]">{load.units} × {load.containerType} Container</span>
                  ) : (
                    <span className="text-[15px]">{load.units} Units | LCL</span>
                  )}
                </div>

                {/* POPUP */}
                <AnimatePresence>
                  {activePopup === 'load' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 mt-2 w-[600px] bg-white text-black rounded-xl shadow-2xl border border-gray-200 z-50 p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-gray-900">What are you shipping?</h3>
                          <div className="group relative">
                            <Search className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute left-1/2 bottom-full mb-2 w-48 -translate-x-1/2 rounded bg-black p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                              Help text about load types...
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setActivePopup(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                          <X className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-gray-200">
                        <button
                          onClick={() => setLoad({ ...load, mode: 'LCL' })}
                          className={`flex-1 py-4 flex items-center justify-center space-x-2 text-sm font-bold border-b-2 transition-all hover:bg-gray-50 ${load.mode === 'LCL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                          <Package className="w-5 h-5" />
                          <span>Loose Cargo</span>
                        </button>
                        <button
                          onClick={() => setLoad({ ...load, mode: 'FCL' })}
                          className={`flex-1 py-4 flex items-center justify-center space-x-2 text-sm font-bold border-b-2 transition-all hover:bg-gray-50 ${load.mode === 'FCL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                          <Truck className="w-5 h-5" />
                          <span>Containers</span>
                        </button>
                      </div>

                      <div className="p-6">
                        {load.mode === 'FCL' ? (
                          <div className="space-y-6">
                            {/* Info Alert */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r flex items-start space-x-3">
                              <div className="bg-blue-100 p-1 rounded-full text-blue-600 mt-0.5">
                                <Info className="w-4 h-4" />
                              </div>
                              <p className="text-sm text-blue-900 leading-relaxed">
                                Containers can be shipped to or from a business address only if there is a loading dock.
                              </p>
                            </div>

                            <div className="flex space-x-6">
                              <div className="w-24">
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider"># of units</label>
                                <input
                                  type="number"
                                  value={load.units}
                                  onChange={(e) => setLoad({ ...load, units: parseInt(e.target.value) || 1 })}
                                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Container Type</label>
                                <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                                  {['20FT', '40FT', '40HC', '45HC'].map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => setLoad({ ...load, containerType: type as any })}
                                      className={`flex-1 py-2 text-sm font-bold rounded transition-all ${load.containerType === type ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                      {type.replace('FT', "'").replace('HC', "'HC")}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <label className="flex items-center space-x-3 cursor-pointer select-none group w-fit">
                              <div className="relative flex items-center">
                                <input type="checkbox" className="peer w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors">Overweight</span>
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Package Type</label>
                                <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer bg-white">
                                  <option>Pallets</option>
                                  <option>Boxes/Crates</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Units</label>
                                <input type="number" defaultValue="1" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                              </div>
                            </div>
                            <div className="flex gap-4 items-end">
                              <div className="flex-1">
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Dimensions (L x W x H)</label>
                                <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                                  <input type="text" placeholder="L" className="w-full p-2.5 text-sm border-r outline-none font-medium" />
                                  <input type="text" placeholder="W" className="w-full p-2.5 text-sm border-r outline-none font-medium" />
                                  <input type="text" placeholder="H" className="w-full p-2.5 text-sm outline-none font-medium" />
                                </div>
                              </div>
                              <div className="w-24">
                                <select className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-medium bg-gray-50 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer">
                                  <option>cm</option>
                                  <option>in</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center bg-gray-50 p-6 border-t border-gray-100">
                        <button className="flex items-center space-x-2 text-blue-600 font-bold text-sm hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                          <Plus className="w-4 h-4" />
                          <span>Add Another Load</span>
                        </button>
                        <button onClick={() => setActivePopup(null)} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:transform active:scale-95 transition-all">Confirm</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Goods + Search Button */}
              <div className="relative md:col-span-3 flex">
                <div
                  className={`flex-1 p-2 group cursor-pointer relative transition-all duration-200 ${activePopup === 'goods' ? 'ring-2 ring-inset ring-blue-600 bg-blue-50/30 z-30' : 'hover:bg-gray-50'}`}
                  onClick={() => setActivePopup('goods')}
                >
                  <label className="block text-xs font-bold text-gray-500 uppercase px-2 pt-1 tracking-wider">
                    Goods
                  </label>
                  <div className="px-2 pb-1 text-black font-bold text-lg truncate flex items-center h-8">
                    {goods.value ? <span className="text-[15px]">${goods.value} Value</span> : <span className="text-gray-400 font-normal text-base">Details...</span>}
                  </div>

                  {/* POPUP */}
                  <AnimatePresence>
                    {activePopup === 'goods' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full right-0 mt-2 w-[400px] bg-white text-black rounded-xl shadow-2xl border border-gray-200 z-50 p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                          <h3 className="font-bold text-lg text-gray-900">Goods Details</h3>
                          <button onClick={() => setActivePopup(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
                            <X className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                          </button>
                        </div>

                        <div className="p-6">
                          <div className="mb-6">
                            <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Total Value</label>
                            <div className="flex border border-gray-200 rounded-lg overflow-hidden items-center px-4 py-1 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                              <span className="text-gray-400 font-bold mr-3 text-sm">USD</span>
                              <input
                                type="number"
                                value={goods.value}
                                onChange={(e) => setGoods({ ...goods, value: e.target.value })}
                                className="w-full py-2 text-lg outline-none font-bold text-gray-900"
                                placeholder="0.00"
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="space-y-4 mb-6">
                            <label className="flex items-start space-x-3 cursor-pointer select-none group p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-all">
                              <div className="relative flex items-center mt-0.5">
                                <input type="checkbox" className="peer w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900 block group-hover:text-blue-700 transition-colors">Personal Shipment</span>
                                <span className="text-xs text-gray-500">I am moving house or shipping personal items.</span>
                              </div>
                            </label>
                            <label className="flex items-start space-x-3 cursor-pointer select-none group p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-all">
                              <div className="relative flex items-center mt-0.5">
                                <input type="checkbox" className="peer w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 block group-hover:text-red-700 transition-colors">Hazardous Goods</span>
                                <span className="text-xs text-gray-500">Batteries, chemicals, or other dangerous items.</span>
                              </div>
                            </label>
                          </div>

                          <div>
                            <label className="text-sm font-bold text-gray-500 uppercase block mb-2 tracking-wider">Ready Date</label>
                            <div className="relative">
                              <input type="date" className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all uppercase text-gray-600" />
                              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
                          <button onClick={() => setActivePopup(null)} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:transform active:scale-95 transition-all">
                            Confirm
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Action */}
                <div className="w-20 flex items-center justify-center">
                  <button
                    onClick={handleSearch}
                    disabled={!origin.city || !destination.city}
                    className="w-full h-full flex items-center justify-center bg-black text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all rounded-r-xl"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Maersk Power Tools Section */}
      <section className="py-12 bg-zinc-900/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Maersk Intelligence Network</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. VESSEL TRACKER */}
            <MaerskToolCard
              title="Active Fleet"
              desc="Real-time position of 17,990+ Vessels."
              icon={<Truck className="w-6 h-6 text-blue-400" />}
              onClick={() => setActivePopup('vessels')}
            />

            {/* 2. LOCATION FINDER */}
            <MaerskToolCard
              title="Port Lookup"
              desc="Search 50,000+ Global Logistics Nodes."
              icon={<MapPin className="w-6 h-6 text-green-400" />}
              onClick={() => setActivePopup('locations')}
            />

            {/* 3. COMMODITY CHECKER */}
            <MaerskToolCard
              title="Commodity Class"
              desc="Verify HS Codes & Restricted Goods."
              icon={<Box className="w-6 h-6 text-purple-400" />}
              onClick={() => setActivePopup('commodities')}
            />
          </div>
        </div>
      </section>

      {/* MODALS FOR TOOLS */}
      <AnimatePresence>
        {activePopup === 'vessels' && (
          <ToolModal title="Global Active Fleet" onClose={() => setActivePopup(null)}>
            <VesselList />
          </ToolModal>
        )}
        {activePopup === 'locations' && (
          <ToolModal title="Global Port Search" onClose={() => setActivePopup(null)}>
            <LocationSearch />
          </ToolModal>
        )}
        {activePopup === 'commodities' && (
          <ToolModal title="Commodity Classifier" onClose={() => setActivePopup(null)}>
            <CommoditySearch />
          </ToolModal>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section className="py-20 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Manage Shipments */}
            <div className="bg-black border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Manage Shipments</h3>
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Track your cargo in real-time. Automated status updates from pickup to delivery.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center text-sm text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                  <span>In Transit</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* Manage Payments */}
            <div className="bg-black border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Payment Portal</h3>
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Centralized billing. Pay suppliers and carriers directly through our secure platform.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                  <span>Invoice #1024 - Paid</span>
                </div>
                <div className="flex items-center text-sm text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Invoice #1025 - Due</span>
                </div>
              </div>
            </div>

            {/* Omego Credit */}
            <div className="bg-black border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Credit Line</h3>
                <div className="bg-white/10 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Flexible payment terms for qualified businesses. Keep your cash flow moving.
              </p>
              <button className="w-full border border-white/20 text-white py-3 rounded-xl font-bold hover:bg-white hover:text-black transition-all">
                Apply for Credit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
