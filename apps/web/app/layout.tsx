import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'creatio — shader components for React',
  description: 'Production-ready GPU shader components for React Three Fiber.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
