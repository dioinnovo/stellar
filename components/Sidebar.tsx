'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Home,
  FileSearch,
  MessageSquare,
  FileText,
  DollarSign,
  Users,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  Camera,
  History,
  HandshakeIcon,
  FileCheck
} from 'lucide-react'
import Image from 'next/image'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      description: 'Overview & KPIs'
    },
    {
      title: 'Claims',
      icon: FileSearch,
      href: '/dashboard/claims',
      description: 'All claims & details'
    },
    {
      title: 'Property Inspection',
      icon: Camera,
      href: '/dashboard/inspection',
      description: 'AI-powered comprehensive inspection'
    },
    {
      title: 'Reports',
      icon: FileCheck,
      href: '/dashboard/reports',
      description: 'Completed reports'
    }
  ]

  return (
    <aside
      className={`
        bg-slate-50 text-gray-800 h-[calc(100vh-1rem)] fixed top-2 left-2 z-40 transition-all duration-300 flex flex-col rounded-2xl border border-gray-200 shadow-lg shadow-gray-400/30
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            {isCollapsed ? (
              <div className="w-10 h-10 bg-stellar-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
            ) : (
              <Image 
                src="/images/stellar_logo.png" 
                alt="Stellar Adjusting" 
                width={180} 
                height={50}
                className="object-contain"
              />
            )}
          </Link>
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-stellar-orange text-white shadow-lg' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                    }
                  `}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs opacity-75">{item.description}</div>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500">
            <p className="font-semibold mb-1">NO RECOVERY, NO FEE</p>
            <p>Maximizing settlements with AI</p>
            <p className="mt-2">© 2025 Stellar Adjusting</p>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500">
            <p>© '24</p>
          </div>
        )}
      </div>
    </aside>
  )
}