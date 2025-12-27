import Link from 'next/link'
import { ArrowRight, Check, Zap, Shield, BarChart3, Users } from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden pt-20 lg:pt-24">
        {/* Background elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute -right-40 bottom-20 h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[150px]" />

          {/* Diagonal lines - the kinetic element */}
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hero-diagonals"
                patternUnits="userSpaceOnUse"
                width="80"
                height="80"
              >
                <path
                  d="M-20,20 l40,-40 M0,80 l80,-80 M60,100 l40,-40"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-diagonals)" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm"
              style={{ animationDelay: '0ms' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="text-muted-foreground">
                Now serving <span className="font-medium text-foreground">1,000+</span> elite coaches
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Coaching that</span>
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-foreground via-foreground to-amber-500 bg-clip-text text-transparent">
                  moves mountains
                </span>
                {/* Underline accent */}
                <svg
                  className="absolute -bottom-2 left-0 h-3 w-full text-amber-500"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M1 8.5C47 3.5 153 3.5 199 8.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The premium platform for fitness coaches who refuse to settle.
              Manage clients, deliver programmes, and track results with
              surgical precision.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group relative h-14 overflow-hidden rounded-xl bg-foreground px-8 text-base font-medium text-background transition-all hover:bg-foreground/90"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start free trial
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-xl px-8 text-base font-medium"
                >
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero visual - Dashboard preview */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-foreground/5">
              {/* Window chrome */}
              <div className="mb-2 flex items-center gap-2 px-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              {/* Dashboard mockup */}
              <div className="overflow-hidden rounded-lg bg-muted/50">
                <div className="grid h-80 grid-cols-4 gap-4 p-6 lg:h-96">
                  {/* Sidebar mockup */}
                  <div className="hidden space-y-3 lg:block">
                    <div className="h-8 w-24 rounded bg-muted" />
                    <div className="space-y-2 pt-4">
                      <div className="h-8 rounded bg-foreground/10" />
                      <div className="h-8 rounded bg-muted" />
                      <div className="h-8 rounded bg-muted" />
                      <div className="h-8 rounded bg-muted" />
                    </div>
                  </div>
                  {/* Main content mockup */}
                  <div className="col-span-4 space-y-4 lg:col-span-3">
                    <div className="flex gap-4">
                      <div className="h-10 w-40 rounded bg-muted" />
                      <div className="h-10 flex-1 rounded bg-muted" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="h-24 rounded-lg border border-border bg-card p-4"
                        >
                          <div className="mb-2 h-4 w-12 rounded bg-muted" />
                          <div className="h-6 w-16 rounded bg-amber-500/20" />
                        </div>
                      ))}
                    </div>
                    <div className="h-40 rounded-lg border border-border bg-card" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -left-6 top-1/3 h-12 w-12 rotate-12 rounded-lg bg-amber-500 opacity-80 blur-sm" />
            <div className="absolute -right-4 top-1/2 h-8 w-8 -rotate-12 rounded-full bg-amber-500 opacity-60 blur-sm" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative border-t border-border py-24 lg:py-32">
        {/* Accent line */}
        <div className="absolute left-0 top-0 h-px w-32 bg-gradient-to-r from-amber-500 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-500">
              Why Synced Momentum
            </p>
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Everything a serious coach needs
            </h2>
            <p className="text-lg text-muted-foreground">
              Built from the ground up for coaches who demand excellence from
              their tools.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-3 lg:gap-12">
            <FeatureCard
              icon={Users}
              title="Client Management"
              description="Organise all your clients in one powerful dashboard. Track progress, manage programmes, and communicate seamlessly."
            />
            <FeatureCard
              icon={Zap}
              title="Programme Builder"
              description="Create bespoke training programmes in minutes. Assign, adjust, and iterate with precision and speed."
            />
            <FeatureCard
              icon={BarChart3}
              title="Progress Analytics"
              description="Visualise client progress with detailed analytics. Identify patterns, celebrate wins, and course-correct early."
            />
            <FeatureCard
              icon={Shield}
              title="Check-in System"
              description="Streamlined weekly check-ins that clients love. Gather data, photos, and feedback in one place."
            />
            <FeatureCard
              icon={Zap}
              title="Meal Planning"
              description="Build comprehensive nutrition plans that complement training. Macro tracking and meal suggestions included."
            />
            <FeatureCard
              icon={Users}
              title="Client App"
              description="Your clients get a beautiful mobile app. Workouts, nutrition, and check-ins at their fingertips."
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative bg-foreground py-24 text-background lg:py-32">
        {/* Diagonal pattern overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="testimonial-pattern"
                patternUnits="userSpaceOnUse"
                width="60"
                height="60"
              >
                <path
                  d="M-15,15 l30,-30 M0,60 l60,-60 M45,75 l30,-30"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#testimonial-pattern)" />
          </svg>
        </div>

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-500">
              Trusted by Elite Coaches
            </p>
            <h2 className="mb-16 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Coaches who chose to{' '}
              <span className="text-amber-500">level up</span>
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            <TestimonialCard
              quote="Synced Momentum transformed how I run my business. Client retention is up 40% since switching."
              author="Sarah Mitchell"
              role="Performance Coach"
              location="London"
            />
            <TestimonialCard
              quote="The programme builder alone saves me 10+ hours a week. It's not a tool, it's a competitive advantage."
              author="James Chen"
              role="Strength & Conditioning"
              location="Manchester"
            />
            <TestimonialCard
              quote="My clients love the app. Check-in completion went from 60% to 95%. The data speaks for itself."
              author="Emma Roberts"
              role="Online Coach"
              location="Edinburgh"
            />
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 border-t border-white/10 pt-16 lg:grid-cols-4">
            <StatItem value="1,200+" label="Active coaches" />
            <StatItem value="50,000+" label="Clients managed" />
            <StatItem value="98%" label="Satisfaction rate" />
            <StatItem value="4.9★" label="App Store rating" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-muted/50 p-8 lg:p-16">
            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-amber-500/5 blur-2xl" />

            <div className="relative text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Ready to elevate your coaching?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                Join over 1,000 coaches who&apos;ve made the switch. Start your
                free trial today—no credit card required.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="group relative h-14 overflow-hidden rounded-xl bg-foreground px-8 text-base font-medium text-background transition-all hover:bg-foreground/90"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start your free trial
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-xl px-8 text-base font-medium"
                  >
                    View pricing
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                14 days free · No credit card · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-foreground/20 hover:shadow-lg">
      {/* Hover accent */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/0 blur-2xl transition-all duration-500 group-hover:bg-amber-500/10" />

      <div className="relative">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-amber-500/10">
          <Icon className="h-7 w-7 text-foreground transition-colors group-hover:text-amber-500" />
        </div>
        <h3 className="mb-3 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({
  quote,
  author,
  role,
  location,
}: {
  quote: string
  author: string
  role: string
  location: string
}) {
  return (
    <div className="relative rounded-2xl bg-white/5 p-8 backdrop-blur-sm">
      {/* Quote mark */}
      <div className="mb-4 text-4xl font-serif text-amber-500">&ldquo;</div>
      <p className="mb-6 text-lg leading-relaxed text-white/90">{quote}</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-white/50">
          {role} · {location}
        </p>
      </div>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-amber-500 lg:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-sm text-white/50">{label}</div>
    </div>
  )
}
