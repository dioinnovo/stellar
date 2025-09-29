'use client'

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Copy, Check, ThumbsUp, ThumbsDown, ExternalLink, FileIcon, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SourcesModal from './sources-modal'

interface Source {
  // Enhanced source structure to handle all fields
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
  // Legacy fields for backward compatibility
  knowledgebaseId?: string
  datasourceId?: string
  documentId?: string
  source?: string
  name?: string
  snippet?: string
  chunkId?: string
}

interface SourcesSectionProps {
  sources: Source[]
}

export default function SourcesSection({ sources }: SourcesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0)

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

    // Legacy format handling
    if (source.source && source.chunks) {
      return source.chunks
        .map(chunk => chunk.text)
        .filter(Boolean)
        .join('\n\n')
    }

    // Fallback to empty string
    return ''
  }

  const handleSourceClick = (index: number) => {
    setSelectedSourceIndex(index)
    setShowModal(true)
  }

  // Get document icon based on type
  const getDocumentIcon = (type?: string) => {
    if (!type) return FileText
    if (type.includes('PDF')) return FileText
    if (type.includes('Word')) return FileIcon
    return FileText
  }

  // Format confidence score
  const formatConfidence = (confidence?: number) => {
    if (!confidence) return null
    const percentage = Math.round(confidence * 100)
    const color = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-gray-600'
    return <span className={color}>{percentage}%</span>
  }

  return (
    <div className="mt-3">
      {/* Action buttons row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ThumbsUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ThumbsDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Sources toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-stellar-orange hover:text-stellar-orange transition flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          <span>View {sources.length} source{sources.length > 1 ? 's' : ''}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 ml-1" />
          ) : (
            <ChevronDown className="w-3 h-3 ml-1" />
          )}
        </button>
      </div>

      {/* Expandable sources content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {sources.map((source, index) => {
                // Extract display information from enhanced source structure
                const documentTitle = source.documentTitle ||
                                    source.metadata?.documentName ||
                                    source.name ||
                                    source.source ||
                                    'Unknown Document'

                const documentType = source.metadata?.documentType || 'Document'
                const sourceText = source.text || source.snippet || ''
                const DocumentIcon = getDocumentIcon(documentType)

                return (
                  <motion.div
                    key={source.id || index}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50 rounded-xl p-4 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-stellar-orange/50 transition-all"
                    onClick={() => handleSourceClick(index)}
                  >
                    {/* Source Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Document Icon */}
                        <div className="p-2 bg-stellar-orange/10 rounded-lg">
                          <DocumentIcon className="w-5 h-5 text-stellar-orange" />
                        </div>

                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                            {documentTitle}
                          </h5>

                          {/* Metadata badges */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {documentType}
                            </span>

                            {source.metadata?.page && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                Page {source.metadata.page}
                              </span>
                            )}

                            {source.metadata?.section && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                {source.metadata.section}
                              </span>
                            )}

                            {source.metadata?.confidence && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30">
                                {formatConfidence(source.metadata.confidence)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const fullText = getFullSourceText(source)
                            handleCopy(fullText, index)
                          }}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy text"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSourceClick(index)
                          }}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Expand view"
                        >
                          <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Source Text Preview */}
                    {sourceText && (
                      <div className="mt-3 relative">
                        <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <p className="whitespace-pre-wrap line-clamp-3">
                            {sourceText}
                          </p>
                          {sourceText.length > 200 && (
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-800 to-transparent rounded-b-lg flex items-end justify-center pb-1">
                              <span className="text-xs text-stellar-orange font-medium">Click to view full text</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Sources Modal */}
      {showModal && (
        <SourcesModal
          sources={sources}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialSourceIndex={selectedSourceIndex}
        />
      )}
    </div>
  )
}