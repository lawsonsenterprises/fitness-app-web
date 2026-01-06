import { Sidebar } from '@/components/dashboard/sidebar'
import { Footer } from '@/components/footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop only, mobile uses bottom nav */}
      <Sidebar />

      {/* Main content - with padding for mobile bottom nav */}
      <main className="flex min-h-screen flex-col pb-20 transition-all duration-300 lg:pb-0 lg:pl-64">
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    </div>
  )
}
