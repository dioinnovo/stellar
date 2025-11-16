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
    <div className="flex h-screen bg-white dark:bg-gray-900 md:bg-slate-100 dark:md:bg-gray-900 md:p-2 sm:gap-2 lg:gap-4">
      {/* Semantic aside for sidebar navigation - Hidden only on phones, visible on tablets and desktop */}
      <aside
        className={`
          hidden sm:block
          ${isCollapsed ? 'w-20' : 'w-64'}
          flex-shrink-0
          transition-all duration-300
        `}
        aria-label="Main navigation"
      >
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      {/* Semantic main for primary content */}
      <main
        className="
          flex-1
          sm:pb-0
          transition-all duration-300
          min-w-0
        "
        id="main-content"
        tabIndex={-1}
      >
        <div className={`
          h-full
          ${pathname === '/dashboard/assistant' ? 'p-0 sm:p-2' : 'p-4 lg:p-6'}
          bg-white dark:bg-gray-900
          md:rounded-2xl md:border md:border-gray-200 md:dark:border-gray-700 md:shadow-sm md:dark:shadow-gray-800/20
          ${pathname === '/dashboard/assistant' ? 'overflow-hidden' : 'overflow-y-auto overlay-scroll'}
        `}>
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