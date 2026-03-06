'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, MapPin, ArrowRight, Package, Calendar, DollarSign, Truck, Box, X, Info, Plus, AlertCircle, Loader2, Anchor, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/context/AuthContext'
import { countries } from '@/lib/countries'

// --- Helpers ---
const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

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
  containerType: '20FT' | '40FT' | '40HC' | '45HC'
  overweight: boolean
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
  const { user, loading: authLoading } = useAuth()

  // --- Role Protection ---
  useEffect(() => {
    if (!authLoading && user?.role === 'forwarder') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // --- State ---
  const [activePopup, setActivePopup] = useState<'origin' | 'destination' | 'load' | 'goods' | 'locations' | 'commodities' | 'offices' | 'deadlines' | null>(null)

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
    containerType: '40FT',
    overweight: false
  })

  const [goods, setGoods] = useState<Goods>({
    value: '',
    currency: 'USD',
    isPersonal: false,
    isHazardous: false,
    readyDate: ''
  })

  // --- Location Suggestions State ---
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null)

  const fetchSuggestions = async (q: string) => {
    if (q.length < 3) {
      setSuggestions([])
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(`${API_URL}/api/references/ports/search?q=${q}`)
      const data = await res.json()
      setSuggestions(data.results || [])
    } catch (e) {
      console.error("Maersk Link Error", e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleCityChange = (val: string, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOrigin({ ...origin, city: val })
    } else {
      setDestination({ ...destination, city: val })
    }

    if (searchTimer) clearTimeout(searchTimer)
    const timer = setTimeout(() => fetchSuggestions(val), 500)
    setSearchTimer(timer)
  }

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
    if (origin.city && destination.city) {
      // SAME-CITY VALIDATION: Normalize and compare
      const normalize = (city: string) => {
        return city.toLowerCase().trim()
          .replace(/^(ennore|port of|port|new|old|north|south|east|west|greater|inner|outer)\s+/gi, '')
          .replace(/\s+(port|harbour|harbor|terminal|dock|city|town)$/gi, '')
          .replace(/\s+/g, '')
      }
      const normOrigin = normalize(origin.city)
      const normDest = normalize(destination.city)

      if (normOrigin === normDest || normOrigin.includes(normDest) || normDest.includes(normOrigin)) {
        alert(`Origin and Destination cannot be the same location.\n\n"${origin.city}" and "${destination.city}" resolve to the same city.`)
        return
      }

      // Map complex state to simple params for Results Page
      const containerMap = load.mode === 'FCL' ? load.containerType : 'LCL'

      const params: Record<string, string> = {
        origin: origin.city,
        destination: destination.city,
        container: containerMap,
        mode: load.mode,
        units: String(load.units),
        origin_country: origin.country,
        dest_country: destination.country,
      }
      if (goods.value) params.value = goods.value
      if (goods.readyDate) params.readyDate = goods.readyDate
      if (goods.isHazardous) params.hazardous = 'true'
      if (goods.isPersonal) params.personal = 'true'

      const query = new URLSearchParams(params).toString()
      router.push(`/results?${query}`)
    }
  }

  // --- Popups ---

  // --- Intelligence Components ---
  const IntelligenceToolCard = ({ title, desc, icon, onClick }: any) => (
    <div onClick={onClick} className="bg-zinc-950 border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-white/20 hover:bg-zinc-900 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1 font-outfit uppercase tracking-tight">{title}</h3>
      <p className="text-[10px] text-zinc-500 font-inter">{desc}</p>
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
          <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  )

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
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none font-inter"
            placeholder="Enter city or port code..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-white text-black px-6 rounded-lg font-bold hover:bg-zinc-200 transition-colors">Search</button>
        </div>
        <div className="space-y-2">
          {searching ? (
            <div className="text-center text-zinc-500">Scanning Logistics Network...</div>
          ) : results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                <div>
                  <div className="font-bold text-white">{r.name}</div>
                  <div className="text-xs text-zinc-500">{r.country} | {r.code}</div>
                </div>
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-zinc-300 uppercase">{r.type}</span>
              </div>
            ))
          ) : query ? (
            <div className="text-center py-6 text-zinc-500 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              No results for <span className="text-white">&quot;{query}&quot;</span>.
              <div className="mt-2 text-xs text-blue-400">Action: Try searching for a major port hub like &quot;Shanghai&quot;, &quot;Jebel Ali&quot;, or &quot;Los Angeles&quot; to verify network sync.</div>
            </div>
          ) : <div className="text-center text-zinc-500 text-sm">Enter a location (City, Country, or UNLOCODE)</div>}
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
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none font-inter"
            placeholder="Enter commodity (e.g. Copper)"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-6 rounded-lg font-bold">Check</button>
        </div>
        <div className="space-y-2">
          {searching ? (
            <div className="text-center text-zinc-500">Classifying...</div>
          ) : results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="flex justify-between items-center bg-black/30 p-3 rounded-lg border border-white/5">
                <div>
                  <div className="font-bold text-white">{r.commodityName}</div>
                  <div className="text-xs text-zinc-500">Code: {r.commodityCode}</div>
                </div>
              </div>
            ))
          ) : query ? (
            <div className="text-center py-6 text-zinc-500 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              Not found.
              <div className="mt-2 text-xs text-blue-400">Action: Use general terms like &quot;Electronics&quot;, &quot;Furniture&quot;, or HS codes like &quot;8517&quot;.</div>
            </div>
          ) : <div className="text-center text-zinc-500 text-sm">Search for HS Codes or Commodities</div>}
        </div>
      </div>
    )
  }

  const OfficeSearch = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    const handleSearch = async () => {
      setSearching(true)
      try {
        const res = await fetch(`${API_URL}/api/references/offices/search?q=${query}`)
        const data = await res.json()
        setResults(data.offices || [])
      } catch (e) { }
      setSearching(false)
    }

    return (
      <div>
        <div className="flex space-x-2 mb-6">
          <input
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none font-inter"
            placeholder="Search city (e.g. Houston)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={handleSearch} className="bg-white text-black px-6 rounded-lg font-bold">Find</button>
        </div>
        <div className="space-y-3">
          {searching ? (
            <div className="text-center text-zinc-500">Locating Offices...</div>
          ) : results.length > 0 ? (
            results.map((r, i) => (
              <div key={i} className="p-4 bg-black/30 rounded-lg border border-white/5 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-white uppercase text-sm tracking-tight">{r.name}</div>
                  <div className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-400 font-mono">OFFICE_ID: {Math.floor(Math.random() * 9000) + 1000}</div>
                </div>
                <div className="flex items-center text-xs text-zinc-400">
                  <MapPin className="w-3 h-3 mr-1.5" /> {r.address || "Main Logistics Hub"} ({r.city})
                </div>
                <div className="flex items-center text-xs text-blue-400 font-mono">
                  <Phone className="w-3 h-3 mr-1.5" /> {r.phone || "+1 (800) MAERSK"}
                </div>
              </div>
            ))
          ) : <div className="text-center text-zinc-500 text-sm">Search for Maersk Customer Offices</div>}
        </div>
      </div>
    )
  }

  const DeadlineSearch = () => {
    const [unlocode, setUnlocode] = useState('CNSHA')
    const [imo, setImo] = useState('9456783')
    const [results, setResults] = useState<any>(null)
    const [searching, setSearching] = useState(false)

    const handleSearch = async () => {
      setSearching(true)
      try {
        const res = await fetch(`${API_URL}/api/references/deadlines?un_locode=${unlocode}&imo=${imo}`)
        const data = await res.json()
        setResults(data.deadlines)
      } catch (e) { }
      setSearching(false)
    }

    return (
      <div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">UNLOCODE</label>
            <input
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2 text-white text-[10px] outline-none font-inter"
              value={unlocode}
              onChange={e => setUnlocode(e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Vessel IMO</label>
            <input
              className="w-full bg-zinc-950 border border-white/10 rounded-xl p-2 text-white text-[10px] outline-none font-inter"
              value={imo}
              onChange={e => setImo(e.target.value)}
            />
          </div>
        </div>
        <button onClick={handleSearch} className="w-full bg-white text-black font-bold py-2 rounded-lg mb-6 hover:bg-zinc-200 transition-all">Verify Cutoffs</button>

        {searching && <div className="text-center text-zinc-500 text-sm">Synchronizing Terminal Deadlines...</div>}

        {results && (
          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded border-l-4 border-yellow-500">
              <div className="text-[10px] text-zinc-500 uppercase font-black">Cargo Cutoff</div>
              <div className="text-lg font-mono text-white">{new Date(results.cargoCutoff).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-white/5 rounded border-l-4 border-blue-500">
              <div className="text-[10px] text-zinc-500 uppercase font-black">Documentation Cutoff</div>
              <div className="text-lg font-mono text-white">{new Date(results.docCutoff).toLocaleString()}</div>
            </div>
            <div className="p-3 bg-white/5 rounded border-l-4 border-green-500">
              <div className="text-[10px] text-zinc-500 uppercase font-black">VGM Deadline</div>
              <div className="text-lg font-mono text-white">{new Date(results.vgmCutoff).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const LocationPopup = ({ title, data, setData, type }: { title: string, data: Location, setData: (d: Location) => void, type: 'origin' | 'destination' }) => (
    <div className="absolute top-full left-0 mt-2 w-[450px] bg-zinc-950/80 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-white/8 z-50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] font-outfit text-zinc-400">{title}</h3>
        <button onClick={() => setActivePopup(null)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Type</label>
          <div className="relative">
            <select
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value as any })}
              className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white appearance-none cursor-pointer focus:border-white/20 outline-none transition-all font-inter"
            >
              <option className="bg-zinc-900">Factory/Warehouse</option>
              <option className="bg-zinc-900">Business Address</option>
              <option className="bg-zinc-900">Port</option>
              <option className="bg-zinc-900">Airport</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Country</label>
          <div className="relative">
            <select
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
              className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white appearance-none cursor-pointer focus:border-white/20 outline-none transition-all font-inter"
            >
              <option value="" className="bg-zinc-900">Global Search</option>
              {countries.map(c => (
                <option key={c.code} value={c.name} className="bg-zinc-900">
                  {getFlagEmoji(c.code)} {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="mb-6 relative">
        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">District *</label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Port / Terminal..."
            value={data.city}
            onChange={(e) => handleCityChange(e.target.value, type)}
            autoFocus
            className="w-full bg-black border border-white/5 rounded-lg pl-10 pr-10 py-2.5 text-[10px] font-bold text-white focus:border-white/20 outline-none transition-all placeholder:text-zinc-600 font-inter"
          />
          {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />}
        </div>

        {/* Suggestions List */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/5 rounded-lg shadow-2xl z-[60] overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setData({ ...data, city: s.name, country: s.country })
                    setSuggestions([])
                  }}
                  className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white group-hover:text-blue-400 transition-colors font-inter">{s.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-inter">{s.country} | {s.code}</span>
                  </div>
                  <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-400 uppercase font-inter">{s.type}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!data.city && <p className="text-red-500 text-[10px] mt-2 font-bold flex items-center tracking-widest font-inter"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>Port / city required</p>}
      </div>

      <div className="h-px bg-white/5 mb-4" />

      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActivePopup('locations')}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center space-x-1 uppercase font-bold tracking-widest font-inter"
          >
            <Search className="w-3 h-3" />
            <span>Port Map</span>
          </button>
          <button
            onClick={() => setActivePopup('offices')}
            className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center space-x-1 uppercase font-bold tracking-widest font-inter border-l border-white/5 pl-3"
          >
            <Anchor className="w-3 h-3" />
            <span>Offices</span>
          </button>
        </div>
        <button onClick={() => setActivePopup(null)} className="bg-white text-black px-8 py-2.5 rounded-lg font-bold text-[10px] tracking-[0.2em] hover:bg-zinc-200 active:scale-[0.98] transition-all uppercase font-inter shadow-xl">
          SYNC
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-10 overflow-visible">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight font-outfit uppercase">
            Where would you like to ship?
          </h1>
          <p className="text-base text-zinc-400 text-center mb-8 max-w-2xl mx-auto font-inter">
            Start searching to compare, book and manage your freight.
            <br />
            <span className="text-xs mt-4 block text-zinc-500">
              Once you make your first booking, we make it easy to manage your shipment.
              <Link href="/demo" className="text-zinc-300 hover:text-white ml-1 font-bold hover:underline">Learn more</Link>
            </span>
          </p>

          {/* Search Form Container */}
          <div ref={popupRef} className="bg-zinc-950 rounded-2xl shadow-2xl p-1 max-w-5xl mx-auto relative z-40 border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/5">

              {/* Origin */}
              <div
                className={`relative md:col-span-3 p-2 group cursor-pointer transition-all duration-200 ${activePopup === 'origin' ? 'ring-2 ring-inset ring-white bg-white/5 z-30 rounded-tl-lg' : 'hover:bg-white/5'}`}
                onClick={() => setActivePopup('origin')}
              >
                <label className="block text-[10px] font-bold text-zinc-600 uppercase px-2 pt-1 flex items-center tracking-widest font-inter">
                  Origin <span className="text-white/50 ml-1 text-lg leading-3">*</span>
                </label>
                <div className="px-2 pb-1 text-white truncate flex items-center h-8">
                  {origin.city ? (
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] font-bold text-white font-inter">{origin.city}</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-inter">{origin.country}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-[10px] font-bold font-inter">Select port</span>
                  )}
                </div>
                {/* Visual Red Dot if empty */}
                {!origin.city && <div className="w-2 h-2 rounded-full bg-red-500 absolute top-4 right-4 animate-pulse"></div>}

                <AnimatePresence>
                  {activePopup === 'origin' && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} onClick={(e) => e.stopPropagation()}>
                      <LocationPopup title="Where are you shipping from?" data={origin} setData={setOrigin} type="origin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Destination */}
              <div
                className={`relative md:col-span-3 p-2 group cursor-pointer transition-all duration-200 ${activePopup === 'destination' ? 'ring-2 ring-inset ring-white bg-white/5 z-30' : 'hover:bg-white/5'}`}
                onClick={() => setActivePopup('destination')}
              >
                <label className="block text-[10px] font-bold text-zinc-600 uppercase px-2 pt-1 tracking-widest font-inter">
                  Destination
                </label>
                <div className="px-2 pb-1 text-white truncate flex items-center h-8">
                  {destination.city ? (
                    <div className="flex flex-col leading-none">
                      <span className="text-[10px] font-bold text-white font-inter">{destination.city}</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest font-inter">{destination.country}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-[10px] font-bold font-inter">Where to?</span>
                  )}
                </div>

                {/* POPUP */}
                <AnimatePresence>
                  {activePopup === 'destination' && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} onClick={(e) => e.stopPropagation()}>
                      <LocationPopup title="Where are you shipping to?" data={destination} setData={setDestination} type="destination" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Load */}
              <div
                className={`relative md:col-span-3 p-2 group cursor-pointer transition-all duration-200 ${activePopup === 'load' ? 'ring-2 ring-inset ring-white bg-white/5 z-30' : 'hover:bg-white/5'}`}
                onClick={() => setActivePopup('load')}
              >
                <label className="block text-[10px] font-bold text-zinc-600 uppercase px-2 pt-1 tracking-widest font-inter">
                  Load
                </label>
                <div className="px-2 pb-1 text-white truncate flex items-center h-8">
                  {load.mode === 'FCL' ? (
                    <span className="text-[10px] font-bold font-inter">{load.units} × {load.containerType} Container</span>
                  ) : (
                    <span className="text-[10px] font-bold font-inter">{load.units} Units | LCL</span>
                  )}
                </div>

                {/* POPUP */}
                <AnimatePresence>
                  {activePopup === 'load' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 mt-2 w-[600px] bg-zinc-950/80 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-white/8 z-50 p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center px-5 py-3 border-b border-white/5">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] font-outfit text-zinc-400">What are you shipping?</h3>
                        <button onClick={() => setActivePopup(null)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                          <X className="w-4 h-4 text-zinc-500" />
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-white/5">
                        <button
                          onClick={() => setLoad({ ...load, mode: 'LCL' })}
                          className={`flex-1 py-2.5 flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all font-inter ${load.mode === 'LCL' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Package className="w-4 h-4" />
                          <span>Loose Cargo</span>
                        </button>
                        <button
                          onClick={() => setLoad({ ...load, mode: 'FCL' })}
                          className={`flex-1 py-2.5 flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all font-inter ${load.mode === 'FCL' ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Truck className="w-4 h-4" />
                          <span>Containers</span>
                        </button>
                      </div>

                      <div className="px-5 py-4">
                        {load.mode === 'FCL' ? (
                          <div className="space-y-4">
                            {/* Info Alert */}
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-start space-x-3">
                              <Info className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                              <p className="text-[10px] text-zinc-400 leading-relaxed font-inter">
                                Containers can be shipped to or from a business address only if there is a loading dock.
                              </p>
                            </div>

                            <div className="flex space-x-4">
                              <div className="w-24 space-y-1">
                                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter"># of Units</label>
                                <input
                                  type="number"
                                  value={load.units}
                                  onChange={(e) => setLoad({ ...load, units: parseInt(e.target.value) || 1 })}
                                  className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-white/20 outline-none transition-all text-center font-inter"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Container Type</label>
                                <div className="flex rounded-lg border border-white/5 overflow-hidden bg-black">
                                  {['20FT', '40FT', '40HC', '45HC'].map((type) => (
                                    <button
                                      key={type}
                                      onClick={() => setLoad({ ...load, containerType: type as any })}
                                      className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wide transition-all font-inter ${load.containerType === type ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                      {type.replace('FT', "'").replace('HC', "'HC")}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <label className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group w-fit">
                              <input type="checkbox" checked={load.overweight} onChange={(e) => setLoad({ ...load, overweight: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                              <span className="text-[10px] font-bold font-inter text-zinc-500 group-hover:text-white uppercase tracking-widest">Overweight Cargo Special Handling</span>
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Package Type</label>
                                <select value={load.packageType} onChange={(e) => setLoad({ ...load, packageType: e.target.value as any })} className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter">
                                  <option value="Pallets" className="bg-zinc-900">Pallets</option>
                                  <option value="Boxes" className="bg-zinc-900">Boxes/Crates</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Units</label>
                                <input type="number" value={load.units} onChange={(e) => setLoad({ ...load, units: parseInt(e.target.value) || 1 })} className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-white/20 outline-none font-inter" />
                              </div>
                            </div>
                            <div className="flex gap-4 items-end">
                              <div className="flex-1 space-y-1">
                                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Dimensions (L x W x H)</label>
                                <div className="flex border border-white/5 rounded-lg overflow-hidden focus-within:border-white/20 transition-all">
                                  <input type="text" placeholder="L" value={load.dims.l} onChange={(e) => setLoad({ ...load, dims: { ...load.dims, l: e.target.value } })} className="w-full bg-black p-2.5 text-[10px] border-r border-white/5 outline-none font-bold text-white font-inter" />
                                  <input type="text" placeholder="W" value={load.dims.w} onChange={(e) => setLoad({ ...load, dims: { ...load.dims, w: e.target.value } })} className="w-full bg-black p-2.5 text-[10px] border-r border-white/5 outline-none font-bold text-white font-inter" />
                                  <input type="text" placeholder="H" value={load.dims.h} onChange={(e) => setLoad({ ...load, dims: { ...load.dims, h: e.target.value } })} className="w-full bg-black p-2.5 text-[10px] outline-none font-bold text-white font-inter" />
                                </div>
                              </div>
                              <div className="w-24">
                                <select value={load.dims.unit} onChange={(e) => setLoad({ ...load, dims: { ...load.dims, unit: e.target.value as any } })} className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-zinc-500 focus:outline-none font-inter w-full">
                                  <option value="cm">CM</option>
                                  <option value="in">IN</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-white/5" />

                      <div className="flex justify-between items-center px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <button className="flex items-center space-x-1.5 text-zinc-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors font-inter">
                            <Plus className="w-3 h-3" />
                            <span>Add Load</span>
                          </button>
                          <button
                            onClick={() => setActivePopup('deadlines')}
                            className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center space-x-1 uppercase font-bold tracking-widest font-inter border-l border-white/5 pl-3"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Deadlines</span>
                          </button>
                        </div>
                        <button onClick={() => setActivePopup(null)} className="bg-white text-black px-8 py-2.5 rounded-lg font-bold text-[10px] tracking-[0.2em] hover:bg-zinc-200 active:scale-[0.98] transition-all uppercase font-inter shadow-xl">CONFIRM</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Goods + Search Button */}
              <div className="relative md:col-span-3 flex">
                <div
                  className={`flex-1 p-2 group cursor-pointer relative transition-all duration-200 ${activePopup === 'goods' ? 'ring-2 ring-inset ring-white bg-white/5 z-30' : 'hover:bg-white/5'}`}
                  onClick={() => setActivePopup('goods')}
                >
                  <label className="block text-[10px] font-bold text-zinc-600 uppercase px-2 pt-1 tracking-widest font-inter">
                    Goods
                  </label>
                  <div className="px-2 pb-1 text-white truncate flex items-center h-8">
                    {goods.value ? <span className="text-[10px] font-bold font-inter">${goods.value} Value</span> : <span className="text-zinc-600 text-[10px] font-bold font-inter">Details...</span>}
                  </div>

                  {/* POPUP */}
                  <AnimatePresence>
                    {activePopup === 'goods' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full right-0 mt-2 w-[360px] bg-zinc-950/80 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-white/8 z-50 p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
                          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] font-outfit text-zinc-400">Goods Details</h3>
                          <button onClick={() => setActivePopup(null)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-zinc-500" />
                          </button>
                        </div>

                        <div className="px-5 py-4">
                          <div className="mb-5 space-y-1">
                            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Total Value</label>
                            <div className="flex bg-black border border-white/5 rounded-lg overflow-hidden items-center px-4 py-1 focus-within:border-white/20 transition-all">
                              <span className="text-zinc-500 font-bold mr-3 text-[10px] uppercase tracking-widest font-inter">USD</span>
                              <input
                                type="number"
                                value={goods.value}
                                onChange={(e) => { const v = e.target.value; if (v === '' || Number(v) >= 0) setGoods({ ...goods, value: v }); }}
                                className="w-full py-1.5 text-base bg-transparent outline-none font-bold text-white font-inter"
                                placeholder="0.00"
                                autoFocus
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mb-5">
                            <label className="flex items-center gap-3 px-3 py-3 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group">
                              <input type="checkbox" checked={goods.isPersonal} onChange={(e) => setGoods({ ...goods, isPersonal: e.target.checked })} className="w-4 h-4 accent-emerald-500" />
                              <div>
                                <span className="text-[10px] font-bold text-white block font-inter uppercase tracking-widest">Personal Shipment</span>
                                <span className="text-[10px] text-zinc-500 font-inter">I am moving house or shipping personal items.</span>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 px-3 py-3 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group">
                              <input type="checkbox" checked={goods.isHazardous} onChange={(e) => setGoods({ ...goods, isHazardous: e.target.checked })} className="w-4 h-4 accent-red-500" />
                              <div className="flex-1">
                                <span className="text-[10px] font-bold text-white block font-inter uppercase tracking-widest">Hazardous Goods</span>
                                <span className="text-[10px] text-zinc-500 font-inter">Batteries, chemicals, or other dangerous items.</span>
                              </div>
                            </label>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Ready Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                              <input type="date" value={goods.readyDate} onChange={(e) => setGoods({ ...goods, readyDate: e.target.value })} style={{ colorScheme: 'dark' }} className="w-full bg-black border border-white/5 rounded-lg pl-10 pr-3 py-2.5 text-[10px] font-bold text-white focus:border-white/20 outline-none font-inter" />
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="px-4 py-3 flex justify-between items-center">
                          <button
                            onClick={() => setActivePopup('commodities')}
                            className="text-[10px] text-zinc-500 hover:text-white transition-colors flex items-center space-x-1 uppercase font-bold tracking-widest font-inter"
                          >
                            <Box className="w-3 h-3" />
                            <span>Verify HS Code</span>
                          </button>
                          <button onClick={() => setActivePopup(null)} className="bg-white text-black px-8 py-2.5 rounded-lg font-bold text-[10px] tracking-[0.2em] hover:bg-zinc-200 active:scale-[0.98] transition-all uppercase font-inter shadow-xl">
                            CONFIRM
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
                    className="w-full h-full flex items-center justify-center bg-white text-black hover:bg-zinc-200 disabled:bg-white/10 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all rounded-r-xl"
                  >
                    <Search className="w-6 h-6" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* MODALS FOR TOOLS */}
      <AnimatePresence>
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
        {activePopup === 'offices' && (
          <ToolModal title="Maersk Booking Offices" onClose={() => setActivePopup(null)}>
            <OfficeSearch />
          </ToolModal>
        )}
        {activePopup === 'deadlines' && (
          <ToolModal title="Maersk Shipment Deadlines" onClose={() => setActivePopup(null)}>
            <DeadlineSearch />
          </ToolModal>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section className="pt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Manage Shipments */}
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Manage Shipments</h3>
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                Track your cargo in real-time. Automated status updates from pickup to delivery.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-zinc-500">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full mr-3"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center text-sm text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></div>
                  <span>In Transit</span>
                </div>
                <div className="flex items-center text-sm text-zinc-500">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full mr-3"></div>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* Digital Customs AI */}
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Digital Customs AI</h3>
                <div className="bg-white/10 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                Automated HS code classification and duty estimation. Bypass manual filing protocols.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-zinc-500">
                  <div className="w-2 h-2 bg-zinc-600 rounded-full mr-3"></div>
                  <span>HS Code Validated</span>
                </div>
                <div className="flex items-center text-sm text-white">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Electronic Filing Complete</span>
                </div>
              </div>
            </div>

            {/* Sovereign Analytics */}
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Network Analytics</h3>
                <div className="bg-white/10 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                Aggregated logistics data to optimize your transit paths and cargo density.
              </p>
              <button className="w-full border border-white/20 text-white py-3 rounded-xl font-bold hover:bg-white hover:text-black transition-all">
                Access Intelligence Report
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
