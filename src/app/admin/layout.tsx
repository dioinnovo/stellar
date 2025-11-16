'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // TODO: Add authentication check here
    // For now, we'll allow access
    // In production, you should verify admin role
    const isAuthenticated = true // Replace with actual auth check
    const isAdmin = true // Replace with actual admin role check

    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isAdmin) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  )
}
