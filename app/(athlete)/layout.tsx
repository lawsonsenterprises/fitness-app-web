import { AthleteSidebar } from '@/components/athlete/sidebar'

export default function AthleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop only, mobile uses bottom nav */}
      <AthleteSidebar />

      {/* Main content - with padding for mobile bottom nav */}
      <main className="min-h-screen pb-20 transition-all duration-300 lg:pb-0 lg:pl-64">
        {children}
      </main>
    </div>
  )
}
