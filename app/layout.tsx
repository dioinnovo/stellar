import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DisableGrammarly from '@/components/DisableGrammarly'

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
      </body>
    </html>
  )
}