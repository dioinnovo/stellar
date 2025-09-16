import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-stellar-dark">{title}</h1>
        {description && (
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{description}</p>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}