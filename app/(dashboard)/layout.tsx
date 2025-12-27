import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main content */}
      <main className="min-h-screen transition-all duration-300 lg:pl-64">
        {children}
      </main>
    </div>
  )
}
