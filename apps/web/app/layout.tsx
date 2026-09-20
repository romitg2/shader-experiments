import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'creativeio — shader component gallery',
  description: 'A growing catalog of GPU shader components built on React Three Fiber.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
