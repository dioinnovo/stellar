import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DisableGrammarly from '@/components/DisableGrammarly'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Stellar Intelligence Platform',
  description: 'AI-Powered Public Adjusting Revolution',
  keywords: 'insurance, claims, AI, public adjusting, settlement, damage assessment',
  authors: [{ name: 'Stellar Adjusting Services' }],
  icons: {
    icon: '/images/stellar_logo.png',
    shortcut: '/images/stellar_logo.png',
    apple: '/images/stellar_logo.png',
  },
  openGraph: {
    title: 'Stellar Intelligence Platform',
    description: 'Find $80,000+ in Overlooked Coverage in 3 Minutes',
    type: 'website',
    locale: 'en_US',
    siteName: 'Stellar Intelligence Platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <DisableGrammarly />
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}