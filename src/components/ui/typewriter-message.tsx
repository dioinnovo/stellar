'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'

interface TypewriterMessageProps {
  content: string
  speed?: number
  onComplete?: () => void
  isPolicy?: boolean
  className?: string
}

export default function TypewriterMessage({
  content,
  speed = 3,
  onComplete,
  isPolicy = false,
  className = ""
}: TypewriterMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const onCompleteRef = useRef(onComplete)
  const hasCompletedRef = useRef(false)

  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Reset state when content changes
  useEffect(() => {
    setDisplayedContent('')
    setCurrentIndex(0)
    setIsTyping(true)
    hasCompletedRef.current = false
  }, [content])

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.substring(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (!hasCompletedRef.current) {
      setIsTyping(false)
      hasCompletedRef.current = true
      onCompleteRef.current?.()
    }
  }, [currentIndex, content.length, speed])

  // Custom markdown components for professional styling
  const markdownComponents = {
    h1: ({ ...props }: any) => (
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2" {...props} />
    ),
    h2: ({ ...props }: any) => (
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6" {...props} />
    ),
    h3: ({ ...props }: any) => (
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4" {...props} />
    ),
    p: ({ ...props }: any) => (
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed" {...props} />
    ),
    ul: ({ ...props }: any) => (
      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1" {...props} />
    ),
    ol: ({ ...props }: any) => (
      <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1" {...props} />
    ),
    li: ({ ...props }: any) => (
      <li className="text-sm text-gray-700 dark:text-gray-300" {...props} />
    ),
    table: ({ ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm" {...props} />
      </div>
    ),
    thead: ({ ...props }: any) => (
      <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
    ),
    th: ({ ...props }: any) => (
      <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props} />
    ),
    td: ({ ...props }: any) => (
      <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" {...props} />
    ),
    strong: ({ ...props }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />
    ),
    em: ({ ...props }: any) => (
      <em className="italic text-gray-800 dark:text-gray-200" {...props} />
    ),
    hr: ({ ...props }: any) => (
      <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
    ),
    blockquote: ({ ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3" {...props} />
    ),
    code: ({ inline, ...props }: any) =>
      inline ? (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200" {...props} />
      ) : (
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto mb-3">
          <code {...props} />
        </pre>
      )
  }

  return (
    <div className={className}>
      {isPolicy ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {displayedContent}
        </ReactMarkdown>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {displayedContent}
        </p>
      )}

      {isTyping && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-gray-900 dark:bg-gray-100 ml-0.5"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
    </div>
  )
}