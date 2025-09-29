'use client'

import React, { useState, useEffect } from 'react'
import { X, FileText, Download, Copy, Check, ChevronLeft, ChevronRight, FileIcon, Link2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Source {
  // Enhanced source structure
  id?: string
  documentTitle?: string
  text?: string
  metadata?: {
    documentId?: string
    documentName?: string
    documentType?: string
    page?: number
    section?: string
    paragraph?: number
    confidence?: number
    matchType?: string
    knowledgebaseId?: string
    datasourceId?: string
    chunkId?: string
    url?: string
    lastModified?: string
  }
  chunks?: {
    chunkId: string
    text: string
  }[]
  // Legacy fields
  name?: string
  snippet?: string
  chunkId?: string
}

interface SourcesModalProps {
  sources: Source[]
  isOpen: boolean
  onClose: () => void
  initialSourceIndex?: number
}

export default function SourcesModal({ sources, isOpen, onClose, initialSourceIndex = 0 }: SourcesModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialSourceIndex)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    setCurrentIndex(initialSourceIndex)
  }, [initialSourceIndex])

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }).catch(err => {
      console.error('Failed to copy text:', err)
    })
  }

  // Helper function to extract all text from a source
  const getFullSourceText = (source: Source): string => {
    // First try to get direct text field
    if (source.text) {
      return source.text
    }

    // Then try snippet
    if (source.snippet) {
      return source.snippet
    }

    // If we have chunks, combine all chunk text
    if (source.chunks && source.chunks.length > 0) {
      return source.chunks
        .map(chunk => chunk.text)
        .filter(Boolean)
        .join('\n\n')
    }

    // Fallback to empty string
    return ''
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sources.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < sources.length - 1 ? prev + 1 : 0))
  }

  const currentSource = sources[currentIndex] || sources[0]

  // Get document icon based on type
  const getDocumentIcon = (type?: string) => {
    if (!type) return FileText
    if (type.includes('PDF')) return FileText
    if (type.includes('Word')) return FileIcon
    return FileText
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Source Details
                </h3>
                {sources.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevious}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Previous source"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {currentIndex + 1} of {sources.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Next source"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-8rem)] p-6">
              {/* Document Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  {/* Document Icon */}
                  <div className="p-3 bg-stellar-orange/10 rounded-xl">
                    {React.createElement(getDocumentIcon(currentSource.metadata?.documentType), {
                      className: "w-8 h-8 text-stellar-orange"
                    })}
                  </div>

                  {/* Document Information */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {currentSource.documentTitle ||
                       currentSource.metadata?.documentName ||
                       currentSource.name ||
                       'Unknown Document'}
                    </h2>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentSource.metadata?.documentType && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {currentSource.metadata.documentType}
                          </span>
                        </div>
                      )}

                      {currentSource.metadata?.page && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Page:</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {currentSource.metadata.page}
                          </span>
                        </div>
                      )}

                      {currentSource.metadata?.section && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Section:</span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {currentSource.metadata.section}
                          </span>
                        </div>
                      )}

                      {currentSource.metadata?.confidence && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Relevance:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-stellar-orange to-orange-400 rounded-full"
                                style={{ width: `${Math.round((currentSource.metadata.confidence || 0) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {Math.round((currentSource.metadata.confidence || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {currentSource.metadata?.url && (
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-gray-400" />
                          <a
                            href={currentSource.metadata.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                          >
                            View Source
                          </a>
                        </div>
                      )}

                      {currentSource.metadata?.lastModified && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(currentSource.metadata.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      const fullText = getFullSourceText(currentSource)
                      handleCopy(fullText, currentIndex)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copy full text"
                  >
                    {copiedIndex === currentIndex ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700 mb-6" />

              {/* Source Text Content */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Extracted Text
                </h3>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  {currentSource.text || currentSource.snippet ? (
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentSource.text || currentSource.snippet}
                      </p>
                    </div>
                  ) : currentSource.chunks && currentSource.chunks.length > 0 ? (
                    <div className="space-y-4">
                      {currentSource.chunks.map((chunk, idx) => (
                        <div key={chunk.chunkId || idx} className="relative">
                          {currentSource.chunks!.length > 1 && (
                            <div className="absolute -left-4 top-0 text-xs text-gray-400 dark:text-gray-500">
                              {idx + 1}
                            </div>
                          )}
                          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed pl-2">
                            {chunk.text}
                          </p>
                          {idx < currentSource.chunks!.length - 1 && (
                            <div className="mt-3 border-b border-gray-200 dark:border-gray-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No text content available for this source.
                    </p>
                  )}
                </div>

                {/* Additional Metadata */}
                {(currentSource.metadata?.documentId || currentSource.metadata?.chunkId) && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Technical Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {currentSource.metadata.documentId && (
                        <div>
                          <span className="text-gray-500">Document ID:</span>
                          <span className="ml-2 font-mono text-gray-700 dark:text-gray-300">
                            {currentSource.metadata.documentId}
                          </span>
                        </div>
                      )}
                      {currentSource.metadata.chunkId && (
                        <div>
                          <span className="text-gray-500">Chunk ID:</span>
                          <span className="ml-2 font-mono text-gray-700 dark:text-gray-300">
                            {currentSource.metadata.chunkId}
                          </span>
                        </div>
                      )}
                      {currentSource.metadata.knowledgebaseId && (
                        <div>
                          <span className="text-gray-500">Knowledge Base:</span>
                          <span className="ml-2 font-mono text-gray-700 dark:text-gray-300">
                            {currentSource.metadata.knowledgebaseId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sources are retrieved from the knowledge base to support the response
                </p>
                <div className="flex items-center gap-2">
                  {currentSource.metadata?.matchType && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                      {currentSource.metadata.matchType === 'semantic' ? 'Semantic Match' : 'Keyword Match'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}