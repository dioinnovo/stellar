'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Automatically redirect to the inspection/schedule page
    router.push('/dashboard/inspection')
  }, [router])

  // Show a simple loading message while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stellar-orange mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Schedule...</p>
      </div>
    </div>
  )
}