import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Search Freight Routes | Instant Ocean & Air Rates — CargoLink',
    description: 'Search ocean freight, air freight, and LCL rates instantly. Compare routes, transit times, and carriers from CargoLink\'s global network.',
    alternates: { canonical: 'https://cargolink.sa/search' },
    openGraph: {
        title: 'Search Freight Rates — CargoLink',
        description: 'Instant freight rate search. Compare ocean, air and LCL rates from top carriers.',
        url: 'https://cargolink.sa/search',
        siteName: 'CargoLink',
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
