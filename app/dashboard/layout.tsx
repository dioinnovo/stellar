'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileBottomNav from '@/components/MobileBottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 md:gap-6">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-0">
        <div className="p-4 sm:p-6 max-w-[100vw] bg-white md:rounded-2xl md:border md:border-gray-200 md:shadow-sm">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav />
    </div>
  )
}