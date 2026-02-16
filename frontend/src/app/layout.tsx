import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OMEGO - The Global Logistics OS',
  description: 'The world\'s most advanced digital freight marketplace. Compare rates, automate tenders, and orchestrate global trade.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
