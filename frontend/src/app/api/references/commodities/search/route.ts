import { NextRequest, NextResponse } from 'next/server'

const CONSUMER_KEY = process.env.MAERSK_CONSUMER_KEY || ''

const HS_FALLBACK: Record<string, string[]> = {} // empty — Maersk only

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || ''

  if (!CONSUMER_KEY) {
    return NextResponse.json({ results: [], source: 'maersk', error: 'API key not configured' }, { status: 200 })
  }

  try {
    const url = q
      ? `https://api.maersk.com/commodity-classifications?commodityName=${encodeURIComponent(q)}`
      : `https://api.maersk.com/commodity-classifications`

    const res = await fetch(url, {
      headers: { 'Consumer-Key': CONSUMER_KEY },
      next: { revalidate: 300 }, // cache 5 min
    })

    if (!res.ok) {
      console.error(`Maersk commodities ${res.status}`)
      return NextResponse.json({ results: [], source: 'maersk' }, { status: 200 })
    }

    const data = await res.json()
    const commodities = Array.isArray(data) ? data : (data.commodities || [])

    const results = commodities
      .filter((r: any) => r.commodityName)
      .map((r: any) => {
        const hsCodes: any[] = r.hsCommodities || []
        return {
          id: r.commodityCode,
          name: r.commodityName,
          type: (r.cargoTypes?.[0]) || 'DRY',
          hs_code: hsCodes[0]?.hsCommodityCode || null,
          hs_codes: hsCodes
            .filter((h: any) => h.hsCommodityCode)
            .map((h: any) => ({ code: h.hsCommodityCode, name: h.hsCommodityName })),
        }
      })

    return NextResponse.json({ results: results.slice(0, 50), source: 'maersk-live' })
  } catch (err) {
    console.error('Commodity search error:', err)
    return NextResponse.json({ results: [], source: 'maersk' }, { status: 200 })
  }
}
