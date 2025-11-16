'use client'

import { useEffect } from 'react'
import { ShieldAlert, RefreshCw, LayoutDashboard } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin panel error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-red-200 dark:border-red-900 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Admin Panel Error
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Critical error occurred
            </p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">
            {error.message || 'An unexpected error occurred in the admin panel'}
          </p>
          {error.digest && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stellar-orange text-white rounded-lg hover:bg-orange-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>

          <a
            href="/admin"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Home
          </a>
        </div>
      </div>
    </div>
  )
}
