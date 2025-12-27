'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 z-50 w-full">
      {/* Backdrop blur container */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />

      {/* Accent line - the kinetic element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <nav className="container relative mx-auto flex h-16 items-center justify-between px-4 lg:h-20 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {/* Logo mark - abstract S that suggests forward motion */}
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-foreground lg:h-10 lg:w-10">
            <div className="absolute -left-1 top-1/2 h-3 w-6 -translate-y-1/2 skew-x-[-20deg] bg-amber-500 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute -right-1 top-1/2 h-3 w-6 -translate-y-1/2 skew-x-[-20deg] bg-background transition-transform duration-300 group-hover:-translate-x-1" />
          </div>

          {/* Wordmark */}
          <span className="font-semibold tracking-tight text-foreground lg:text-lg">
            Synced<span className="text-amber-500">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.name}
              {pathname === item.href && (
                <span className="absolute bottom-0 left-4 right-4 h-px bg-amber-500" />
              )}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-foreground/90"
          >
            <span className="relative z-10">Get Started</span>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'absolute left-0 right-0 top-full overflow-hidden bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out md:hidden',
          mobileMenuOpen ? 'max-h-80 border-b border-border' : 'max-h-0'
        )}
      >
        <div className="container space-y-1 px-4 py-4">
          {navigation.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'block rounded-lg px-4 py-3 text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              style={{
                transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-8px)',
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-foreground px-4 py-3 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
