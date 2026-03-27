import { NextRequest, NextResponse } from 'next/server'

const CONSUMER_KEY = process.env.MAERSK_CONSUMER_KEY || ''

// Builtin fallback — same data as backend/app/data/ports.py
// Format: [name, city, unlocode, country, country_code]
const BUILTIN_PORTS: [string, string, string, string, string][] = [
  ['Shanghai Yangshan Deep Water Port', 'Shanghai', 'CNSHA', 'China', 'CN'],
  ['Ningbo-Zhoushan Port', 'Ningbo', 'CNNBO', 'China', 'CN'],
  ['Shenzhen Yantian Terminal', 'Shenzhen', 'CNSZX', 'China', 'CN'],
  ['Guangzhou Nansha Port', 'Guangzhou', 'CNGZH', 'China', 'CN'],
  ['Tianjin Xingang Port', 'Tianjin', 'CNTSN', 'China', 'CN'],
  ['Qingdao Port', 'Qingdao', 'CNTAO', 'China', 'CN'],
  ['Dalian Port', 'Dalian', 'CNDLC', 'China', 'CN'],
  ['Hong Kong International Terminals', 'Hong Kong', 'HKHKG', 'Hong Kong', 'HK'],
  ['Singapore PSA Terminals', 'Singapore', 'SGSIN', 'Singapore', 'SG'],
  ['Port Klang (Westports)', 'Klang', 'MYPKG', 'Malaysia', 'MY'],
  ['Tanjung Pelepas', 'Johor', 'MYPTP', 'Malaysia', 'MY'],
  ['Laem Chabang Port', 'Laem Chabang', 'THLCH', 'Thailand', 'TH'],
  ['Jakarta Tanjung Priok', 'Jakarta', 'IDJKT', 'Indonesia', 'ID'],
  ['Ho Chi Minh City Port', 'Ho Chi Minh City', 'VNSGN', 'Vietnam', 'VN'],
  ['Kaohsiung Port', 'Kaohsiung', 'TWKHH', 'Taiwan', 'TW'],
  ['Busan New Port', 'Busan', 'KRPUS', 'South Korea', 'KR'],
  ['Tokyo Port', 'Tokyo', 'JPTYO', 'Japan', 'JP'],
  ['Yokohama Port', 'Yokohama', 'JPYOK', 'Japan', 'JP'],
  ['Nagoya Port', 'Nagoya', 'JPNGO', 'Japan', 'JP'],
  ['Kobe Port', 'Kobe', 'JPUKB', 'Japan', 'JP'],
  ['Mumbai JNPT', 'Mumbai', 'INNSA', 'India', 'IN'],
  ['Chennai Port', 'Chennai', 'INMAA', 'India', 'IN'],
  ['Mundra Port', 'Mundra', 'INMUN', 'India', 'IN'],
  ['Kolkata Port', 'Kolkata', 'INCCU', 'India', 'IN'],
  ['Cochin Port', 'Kochi', 'INCOK', 'India', 'IN'],
  ['Colombo Port', 'Colombo', 'LKCMB', 'Sri Lanka', 'LK'],
  ['Karachi Port', 'Karachi', 'PKKHI', 'Pakistan', 'PK'],
  ['Jeddah Islamic Port', 'Jeddah', 'SAJED', 'Saudi Arabia', 'SA'],
  ['King Abdulaziz Port Dammam', 'Dammam', 'SADMM', 'Saudi Arabia', 'SA'],
  ['Dubai Jebel Ali Port', 'Dubai', 'AEJEA', 'United Arab Emirates', 'AE'],
  ['Abu Dhabi Khalifa Port', 'Abu Dhabi', 'AEAUH', 'United Arab Emirates', 'AE'],
  ['Salalah Port', 'Salalah', 'OMMCT', 'Oman', 'OM'],
  ['Sohar Port', 'Sohar', 'OMSOH', 'Oman', 'OM'],
  ['Kuwait Port', 'Kuwait City', 'KWKWI', 'Kuwait', 'KW'],
  ['Bahrain Khalifa Bin Salman Port', 'Manama', 'BHBAH', 'Bahrain', 'BH'],
  ['Doha Port', 'Doha', 'QADOH', 'Qatar', 'QA'],
  ['Aqaba Container Terminal', 'Aqaba', 'JOAQJ', 'Jordan', 'JO'],
  ['Haifa Port', 'Haifa', 'ILHFA', 'Israel', 'IL'],
  ['Port Said East Port', 'Port Said', 'EGPSD', 'Egypt', 'EG'],
  ['Alexandria Port', 'Alexandria', 'EGALY', 'Egypt', 'EG'],
  ['Casablanca Port', 'Casablanca', 'MACAS', 'Morocco', 'MA'],
  ['Tanger Med Port', 'Tangier', 'MATAN', 'Morocco', 'MA'],
  ['Lagos Apapa Port', 'Lagos', 'NGLOS', 'Nigeria', 'NG'],
  ['Durban Port', 'Durban', 'ZADUR', 'South Africa', 'ZA'],
  ['Cape Town Port', 'Cape Town', 'ZACPT', 'South Africa', 'ZA'],
  ['Mombasa Port', 'Mombasa', 'KEMBA', 'Kenya', 'KE'],
  ['Dar es Salaam Port', 'Dar es Salaam', 'TZDAR', 'Tanzania', 'TZ'],
  ['Rotterdam Port', 'Rotterdam', 'NLRTM', 'Netherlands', 'NL'],
  ['Hamburg Port', 'Hamburg', 'DEHAM', 'Germany', 'DE'],
  ['Antwerp-Bruges Port', 'Antwerp', 'BEANR', 'Belgium', 'BE'],
  ['Felixstowe Port', 'Felixstowe', 'GBFXT', 'United Kingdom', 'GB'],
  ['Southampton Port', 'Southampton', 'GBSOU', 'United Kingdom', 'GB'],
  ['Le Havre Port', 'Le Havre', 'FRLEH', 'France', 'FR'],
  ['Barcelona Port', 'Barcelona', 'ESBCN', 'Spain', 'ES'],
  ['Valencia Port', 'Valencia', 'ESVLC', 'Spain', 'ES'],
  ['Piraeus Port', 'Piraeus', 'GRPIR', 'Greece', 'GR'],
  ['Genova Port', 'Genova', 'ITGOA', 'Italy', 'IT'],
  ['Gioia Tauro Port', 'Gioia Tauro', 'ITGIT', 'Italy', 'IT'],
  ['Gdansk Port', 'Gdansk', 'PLGDN', 'Poland', 'PL'],
  ['New York/New Jersey Port', 'New York', 'USNYC', 'United States', 'US'],
  ['Los Angeles Port', 'Los Angeles', 'USLAX', 'United States', 'US'],
  ['Long Beach Port', 'Long Beach', 'USLGB', 'United States', 'US'],
  ['Seattle/Tacoma Port', 'Seattle', 'USSEA', 'United States', 'US'],
  ['Houston Ship Channel', 'Houston', 'USHOU', 'United States', 'US'],
  ['Savannah Port', 'Savannah', 'USSAV', 'United States', 'US'],
  ['Norfolk Port', 'Norfolk', 'USORF', 'United States', 'US'],
  ['Miami Port', 'Miami', 'USMIA', 'United States', 'US'],
  ['Vancouver Port', 'Vancouver', 'CAVAN', 'Canada', 'CA'],
  ['Santos Port', 'Santos', 'BRSSZ', 'Brazil', 'BR'],
  ['Buenos Aires Port', 'Buenos Aires', 'ARBUE', 'Argentina', 'AR'],
  ['Callao Port', 'Lima', 'PECLL', 'Peru', 'PE'],
  ['Panama Cristobal', 'Colón', 'PACRZ', 'Panama', 'PA'],
  ['Balboa Port', 'Panama City', 'PABLB', 'Panama', 'PA'],
]

function fallbackSearch(q: string, country: string) {
  const ql = q.toLowerCase()
  const cl = country.toLowerCase()
  let results = BUILTIN_PORTS.filter(([name, city, code, cname, cc]) => {
    if (country && cc.toLowerCase() !== cl) return false
    if (ql && !city.toLowerCase().includes(ql) && !name.toLowerCase().includes(ql) && !code.toLowerCase().includes(ql)) return false
    return true
  })
  results.sort((a, b) => (a[1].toLowerCase().startsWith(ql) ? -1 : 1))
  return results.slice(0, 20).map(([name, city, code, cname, cc]) => ({
    name, city, code, country: cname, country_code: cc, region: '', type: 'PORT',
  }))
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || ''
  const country = req.nextUrl.searchParams.get('country')?.trim() || ''
  const termType = req.nextUrl.searchParams.get('term_type')?.toUpperCase() || ''

  if (!q && !country) {
    return NextResponse.json({ results: fallbackSearch('', country), source: 'builtin' })
  }

  if (!CONSUMER_KEY) {
    return NextResponse.json({ results: fallbackSearch(q, country), source: 'builtin' })
  }

  try {
    const params = [`cityName=${encodeURIComponent(q)}|contains`, 'limit=50']
    if (country) params.push(`countryCode=${encodeURIComponent(country)}`)
    if (termType === 'CFS') {
      params.push('locationType=CONTAINER FREIGHT STATION')
    } else {
      params.push('locationType=TERMINAL')
    }

    const url = `https://api.maersk.com/reference-data/locations?${params.join('&')}`
    const res = await fetch(url, {
      headers: { 'Consumer-Key': CONSUMER_KEY },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json({ results: fallbackSearch(q, country), source: 'builtin' })
    }

    const data = await res.json()
    const seen = new Set<string>()
    const results: any[] = []

    for (const item of (Array.isArray(data) ? data : [])) {
      const city = item.cityName?.trim() || ''
      const locName = item.locationName?.trim() || ''
      const code = item.UNLocationCode?.trim() || ''
      if (!code || !city) continue
      const display = locName && locName !== city ? locName : city
      const key = `${code}_${display.toUpperCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      results.push({
        name: display, city, code,
        country: item.countryName || '',
        country_code: item.countryCode || '',
        region: item.UNRegionCode || '',
        type: item.locationType || 'TERMINAL',
      })
    }

    const ql = q.toLowerCase()
    results.sort((a, b) => (a.city.toLowerCase().startsWith(ql) ? -1 : 1))

    if (results.length > 0) {
      return NextResponse.json({ results: results.slice(0, 20), source: 'maersk-live' })
    }
    return NextResponse.json({ results: fallbackSearch(q, country), source: 'builtin' })
  } catch (err) {
    console.error('Port search error:', err)
    return NextResponse.json({ results: fallbackSearch(q, country), source: 'builtin' })
  }
}
