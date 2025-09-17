'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MobileBottomNav from '@/components/MobileBottomNav'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar - Hidden only on phones, visible on tablets and desktop */}
      <div className="hidden sm:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Main Content with margin for sidebar */}
      <main className={`${isCollapsed ? 'sm:ml-[5.5rem]' : 'sm:ml-[17rem]'} transition-all duration-300 overflow-hidden pb-24 sm:pb-0`}>
        <div className="p-4 sm:p-6 max-w-[100vw] bg-white sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-sm">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}