import { NextRequest, NextResponse } from 'next/server'

const CONSUMER_KEY = process.env.MAERSK_CONSUMER_KEY || ''

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() || ''

  if (!CONSUMER_KEY) {
    return NextResponse.json({ results: [], source: 'Maersk Vessel DB' }, { status: 200 })
  }

  try {
    let url: string
    if (!q) {
      url = 'https://api.maersk.com/reference-data/vessels?limit=10'
    } else if (/^\d+$/.test(q)) {
      url = `https://api.maersk.com/reference-data/vessels?vesselIMONumbers=${encodeURIComponent(q)}&limit=20`
    } else {
      url = `https://api.maersk.com/reference-data/vessels?vesselNames=${encodeURIComponent(q)}&limit=20`
    }

    const res = await fetch(url, {
      headers: { 'Consumer-Key': CONSUMER_KEY },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      console.error(`Maersk vessels ${res.status}`)
      return NextResponse.json({ results: [], source: 'Maersk Vessel DB' }, { status: 200 })
    }

    const data = await res.json()
    const results = (Array.isArray(data) ? data : [])
      .filter((r: any) => r.vesselLongName || r.vesselShortName)
      .map((r: any) => ({
        name: r.vesselLongName || r.vesselShortName,
        imo: r.vesselIMONumber,
        flag: r.vesselFlagCode,
        capacity: r.vesselCapacityTEU,
      }))

    return NextResponse.json({ results: results.slice(0, 20), source: 'Maersk Vessel DB' })
  } catch (err) {
    console.error('Vessel search error:', err)
    return NextResponse.json({ results: [], source: 'Maersk Vessel DB' }, { status: 200 })
  }
}
