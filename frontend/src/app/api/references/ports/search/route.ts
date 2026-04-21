import { NextRequest, NextResponse } from 'next/server'

const CONSUMER_KEY = process.env.MAERSK_CONSUMER_KEY || ''

// Builtin fallback — clean port-level entries only (no terminals)
// Format: [name, city, unlocode, country, country_code]
const BUILTIN_PORTS: [string, string, string, string, string][] = [
  ['Port of Shanghai', 'Shanghai', 'CNSHA', 'China', 'CN'],
  ['Port of Ningbo', 'Ningbo', 'CNNBO', 'China', 'CN'],
  ['Port of Shenzhen', 'Shenzhen', 'CNSZX', 'China', 'CN'],
  ['Port of Guangzhou', 'Guangzhou', 'CNGZH', 'China', 'CN'],
  ['Port of Tianjin', 'Tianjin', 'CNTSN', 'China', 'CN'],
  ['Port of Qingdao', 'Qingdao', 'CNTAO', 'China', 'CN'],
  ['Port of Dalian', 'Dalian', 'CNDLC', 'China', 'CN'],
  ['Port of Xiamen', 'Xiamen', 'CNXMN', 'China', 'CN'],
  ['Port of Hong Kong', 'Hong Kong', 'HKHKG', 'Hong Kong', 'HK'],
  ['Port of Singapore', 'Singapore', 'SGSIN', 'Singapore', 'SG'],
  ['Port of Klang', 'Port Klang', 'MYPKG', 'Malaysia', 'MY'],
  ['Port of Tanjung Pelepas', 'Johor', 'MYTPP', 'Malaysia', 'MY'],
  ['Port of Laem Chabang', 'Laem Chabang', 'THLCH', 'Thailand', 'TH'],
  ['Port of Bangkok', 'Bangkok', 'THBKK', 'Thailand', 'TH'],
  ['Port of Jakarta', 'Jakarta', 'IDJKT', 'Indonesia', 'ID'],
  ['Port of Ho Chi Minh City', 'Ho Chi Minh City', 'VNSGN', 'Vietnam', 'VN'],
  ['Port of Hai Phong', 'Hai Phong', 'VNHPH', 'Vietnam', 'VN'],
  ['Port of Kaohsiung', 'Kaohsiung', 'TWKHH', 'Taiwan', 'TW'],
  ['Port of Busan', 'Busan', 'KRPUS', 'South Korea', 'KR'],
  ['Port of Tokyo', 'Tokyo', 'JPTYO', 'Japan', 'JP'],
  ['Port of Yokohama', 'Yokohama', 'JPYOK', 'Japan', 'JP'],
  ['Port of Nagoya', 'Nagoya', 'JPNGO', 'Japan', 'JP'],
  ['Port of Kobe', 'Kobe', 'JPUKB', 'Japan', 'JP'],
  ['Port of Osaka', 'Osaka', 'JPOSA', 'Japan', 'JP'],
  ['Port of Mumbai', 'Mumbai', 'INBOM', 'India', 'IN'],
  ['Port of Chennai', 'Chennai', 'INMAA', 'India', 'IN'],
  ['Port of Mundra', 'Mundra', 'INMUN', 'India', 'IN'],
  ['Port of Kolkata', 'Kolkata', 'INCCU', 'India', 'IN'],
  ['Port of Kochi', 'Kochi', 'INCOK', 'India', 'IN'],
  ['Port of Colombo', 'Colombo', 'LKCMB', 'Sri Lanka', 'LK'],
  ['Port of Karachi', 'Karachi', 'PKKHI', 'Pakistan', 'PK'],
  ['Port of Jeddah', 'Jeddah', 'SAJED', 'Saudi Arabia', 'SA'],
  ['Port of Dammam', 'Dammam', 'SADMM', 'Saudi Arabia', 'SA'],
  ['Port of Dubai', 'Dubai', 'AEJEA', 'United Arab Emirates', 'AE'],
  ['Port of Abu Dhabi', 'Abu Dhabi', 'AEAUH', 'United Arab Emirates', 'AE'],
  ['Port of Sharjah', 'Sharjah', 'AESHJ', 'United Arab Emirates', 'AE'],
  ['Port of Salalah', 'Salalah', 'OMSLL', 'Oman', 'OM'],
  ['Port of Sohar', 'Sohar', 'OMSOH', 'Oman', 'OM'],
  ['Port of Aqaba', 'Aqaba', 'JOAQJ', 'Jordan', 'JO'],
  ['Port of Haifa', 'Haifa', 'ILHFA', 'Israel', 'IL'],
  ['Port of Ashdod', 'Ashdod', 'ILASH', 'Israel', 'IL'],
  ['Port of Port Said', 'Port Said', 'EGPSD', 'Egypt', 'EG'],
  ['Port of Alexandria', 'Alexandria', 'EGALY', 'Egypt', 'EG'],
  ['Port of Casablanca', 'Casablanca', 'MACAS', 'Morocco', 'MA'],
  ['Port of Tangier', 'Tangier', 'MATNR', 'Morocco', 'MA'],
  ['Port of Lagos', 'Lagos', 'NGLOS', 'Nigeria', 'NG'],
  ['Port of Durban', 'Durban', 'ZADUR', 'South Africa', 'ZA'],
  ['Port of Cape Town', 'Cape Town', 'ZACPT', 'South Africa', 'ZA'],
  ['Port of Mombasa', 'Mombasa', 'KEMBA', 'Kenya', 'KE'],
  ['Port of Rotterdam', 'Rotterdam', 'NLRTM', 'Netherlands', 'NL'],
  ['Port of Amsterdam', 'Amsterdam', 'NLAMS', 'Netherlands', 'NL'],
  ['Port of Hamburg', 'Hamburg', 'DEHAM', 'Germany', 'DE'],
  ['Port of Antwerp', 'Antwerp', 'BEANR', 'Belgium', 'BE'],
  ['Port of Felixstowe', 'Felixstowe', 'GBFXT', 'United Kingdom', 'GB'],
  ['Port of Southampton', 'Southampton', 'GBSOU', 'United Kingdom', 'GB'],
  ['Port of Le Havre', 'Le Havre', 'FRLEH', 'France', 'FR'],
  ['Port of Marseille', 'Marseille', 'FRMRS', 'France', 'FR'],
  ['Port of Barcelona', 'Barcelona', 'ESBCN', 'Spain', 'ES'],
  ['Port of Valencia', 'Valencia', 'ESVLC', 'Spain', 'ES'],
  ['Port of Algeciras', 'Algeciras', 'ESALG', 'Spain', 'ES'],
  ['Port of Piraeus', 'Piraeus', 'GRPIR', 'Greece', 'GR'],
  ['Port of Genoa', 'Genoa', 'ITGOA', 'Italy', 'IT'],
  ['Port of Gioia Tauro', 'Gioia Tauro', 'ITGIT', 'Italy', 'IT'],
  ['Port of Gdansk', 'Gdańsk', 'PLGDN', 'Poland', 'PL'],
  ['Port of Gothenburg', 'Gothenburg', 'SEGOT', 'Sweden', 'SE'],
  ['Port of New York', 'New York', 'USNYC', 'United States', 'US'],
  ['Port of Los Angeles', 'Los Angeles', 'USLAX', 'United States', 'US'],
  ['Port of Long Beach', 'Long Beach', 'USLGB', 'United States', 'US'],
  ['Port of Seattle', 'Seattle', 'USSEA', 'United States', 'US'],
  ['Port of Houston', 'Houston', 'USHOU', 'United States', 'US'],
  ['Port of Savannah', 'Savannah', 'USSAV', 'United States', 'US'],
  ['Port of Norfolk', 'Norfolk', 'USORF', 'United States', 'US'],
  ['Port of Miami', 'Miami', 'USMIA', 'United States', 'US'],
  ['Port of Charleston', 'Charleston', 'USCHS', 'United States', 'US'],
  ['Port of Baltimore', 'Baltimore', 'USBAL', 'United States', 'US'],
  ['Port of Vancouver', 'Vancouver', 'CAVAN', 'Canada', 'CA'],
  ['Port of Montreal', 'Montreal', 'CAMTR', 'Canada', 'CA'],
  ['Port of Santos', 'Santos', 'BRSSZ', 'Brazil', 'BR'],
  ['Port of Rio de Janeiro', 'Rio de Janeiro', 'BRRIO', 'Brazil', 'BR'],
  ['Port of Buenos Aires', 'Buenos Aires', 'ARBUE', 'Argentina', 'AR'],
  ['Port of Callao', 'Lima', 'PECLL', 'Peru', 'PE'],
  ['Port of Balboa', 'Panama City', 'PABLB', 'Panama', 'PA'],
  ['Port of Cartagena', 'Cartagena', 'COCTG', 'Colombia', 'CO'],
  ['Port of Manila', 'Manila', 'PHMNL', 'Philippines', 'PH'],
]

function fallbackSearch(q: string, country: string) {
  const ql = q.toLowerCase()
  const cl = country.toLowerCase()
  const results = BUILTIN_PORTS.filter(([, city, code, , cc]) => {
    if (country && cc.toLowerCase() !== cl) return false
    if (ql && !city.toLowerCase().includes(ql) && !code.toLowerCase().includes(ql)) return false
    return true
  })
  results.sort((a, b) => (a[1].toLowerCase().startsWith(ql) ? -1 : 1))
  return results.slice(0, 20).map(([, city, code, cname, cc]) => ({
    name: city, city, code, country: cname, country_code: cc, region: '', type: '',
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
      params.push('locationType=PORT')
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
      const code = item.UNLocationCode?.trim() || ''
      if (!code || !city) continue
      // Standard UNLOCODEs are exactly 5 chars — longer codes are terminal sub-identifiers
      if (code.length !== 5) continue
      if (seen.has(code)) continue
      seen.add(code)
      results.push({
        name: city, city, code,
        country: item.countryName || '',
        country_code: item.countryCode || '',
        region: item.UNRegionCode || '',
        type: '',
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
