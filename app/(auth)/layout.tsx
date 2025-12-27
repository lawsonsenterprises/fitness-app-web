import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Diagonal accent lines - Kinetic Precision */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[200%] w-1/2 rotate-12 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute -right-1/4 bottom-0 h-[200%] w-1/2 -rotate-12 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Logo header */}
      <header className="relative z-10 flex items-center justify-center py-8">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground transition-transform duration-300 group-hover:scale-105">
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            Synced Momentum
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex min-h-[calc(100vh-120px)] items-center justify-center px-4 pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Synced Momentum. All rights reserved.</p>
      </footer>
    </div>
  )
}
