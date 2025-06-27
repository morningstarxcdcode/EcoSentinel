/**
 * EcoSentinel - AI-Powered Environmental Intelligence Platform
 * Root Layout Component
 * 
 * @author morningstarxcdcode
 * @version 1.0.0
 * @license MIT
 * @repository https://github.com/morningstarxcdcode/ecosentinel
 */

import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EcoSentinel - AI-Powered Environmental Monitoring',
  description: 'Real-time environmental monitoring and AI-powered climate action platform',
  keywords: 'climate, environment, AI, monitoring, sustainability, hackathon',
  authors: [{ name: 'EcoSentinel Team' }],
  openGraph: {
    title: 'EcoSentinel - AI-Powered Environmental Monitoring',
    description: 'Real-time environmental monitoring and AI-powered climate action platform',
    url: 'https://ecosentinel.vercel.app',
    siteName: 'EcoSentinel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EcoSentinel Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcoSentinel - AI-Powered Environmental Monitoring',
    description: 'Real-time environmental monitoring and AI-powered climate action platform',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
