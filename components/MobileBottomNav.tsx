'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  FileSearch, 
  Brain,
  Camera,
  BarChart3
} from 'lucide-react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      title: 'Claims',
      icon: FileSearch,
      href: '/dashboard/claims',
    },
    {
      title: 'Inspect',
      icon: Camera,
      href: '/dashboard/inspection',
    },
    {
      title: 'AI',
      icon: Brain,
      href: '/dashboard/assistant',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
    }
  ]

  const activeIndex = menuItems.findIndex(item => {
    if (item.href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="px-4 pb-4">
        <nav className="
          relative
          bg-white/60 backdrop-blur-2xl backdrop-saturate-200
          border border-white/30 
          rounded-full 
          shadow-[0_-10px_40px_rgba(0,0,0,0.15),0_4px_20px_rgba(0,0,0,0.1)]
          px-1 py-1
        ">
          <ul className="flex items-center justify-around relative">
            {/* Animated background indicator */}
            {activeIndex !== -1 && (
              <motion.div
                className="absolute inset-y-1 bg-[#E74C3C] rounded-full shadow-lg pointer-events-none"
                initial={false}
                animate={{
                  left: `${(activeIndex / menuItems.length) * 100}%`,
                  width: `${100 / menuItems.length}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
            
            {menuItems.map((item, index) => {
              const isActive = index === activeIndex
              const Icon = item.icon
              
              return (
                <li key={item.href} className="flex-1 relative z-10">
                  <Link
                    href={item.href}
                    className={`
                      flex flex-col items-center gap-1 px-2 py-1.5 rounded-full transition-all
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-[#E74C3C] hover:bg-gray-100/50'
                      }
                    `}
                  >
                    <Icon size={20} className="transition-transform" />
                    <span className="text-[10px] font-medium">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>
  )
}