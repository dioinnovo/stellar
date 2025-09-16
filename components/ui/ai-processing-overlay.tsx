'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Sparkles, Search, BarChart3, Shield,
  FileText, CheckCircle, Loader2, TrendingUp,
  Eye, Zap, Database, AlertTriangle
} from 'lucide-react'

interface ProcessingStage {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  duration: number
}

const processingStages: ProcessingStage[] = [
  {
    id: 'analyzing',
    title: 'Analyzing Property Damage',
    subtitle: 'Identifying visible and hidden damage patterns',
    icon: Search,
    duration: 3500
  },
  {
    id: 'enhancing',
    title: 'Enhancing Documentation',
    subtitle: 'Processing photos and voice notes with AI',
    icon: Sparkles,
    duration: 3500
  },
  {
    id: 'comparing',
    title: 'Comparing Similar Claims',
    subtitle: 'Analyzing 10,000+ similar cases for insights',
    icon: Database,
    duration: 3500
  },
  {
    id: 'generating',
    title: 'Generating Comprehensive Report',
    subtitle: 'Creating detailed assessment with recommendations',
    icon: FileText,
    duration: 3500
  },
  {
    id: 'optimizing',
    title: 'Optimizing Settlement Strategy',
    subtitle: 'Applying AI insights for maximum recovery',
    icon: TrendingUp,
    duration: 2500
  }
]

const aiFeatures = [
  'Detecting moisture patterns behind walls',
  'Identifying code upgrade opportunities',
  'Calculating hidden damage probability',
  'Analyzing structural integrity risks',
  'Estimating repair timeline accuracy',
  'Comparing regional contractor rates',
  'Evaluating material availability',
  'Predicting claim approval likelihood',
  'Optimizing documentation strategy',
  'Identifying coverage maximization points'
]

interface AIProcessingOverlayProps {
  isVisible: boolean
  onComplete: () => void
}

export function AIProcessingOverlay({ isVisible, onComplete }: AIProcessingOverlayProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0)
      setProgress(0)
      return
    }

    let stageTimeout: NodeJS.Timeout
    let featureInterval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    // Progress animation
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 0.5
      })
    }, 85)

    // Feature rotation
    featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % aiFeatures.length)
    }, 2000)

    // Stage progression
    const progressStages = () => {
      if (currentStage < processingStages.length - 1) {
        stageTimeout = setTimeout(() => {
          setCurrentStage((prev) => prev + 1)
          progressStages()
        }, processingStages[currentStage].duration)
      } else {
        // Complete after last stage
        stageTimeout = setTimeout(() => {
          onComplete()
        }, processingStages[currentStage].duration)
      }
    }

    progressStages()

    return () => {
      clearTimeout(stageTimeout)
      clearInterval(featureInterval)
      clearInterval(progressInterval)
    }
  }, [isVisible, currentStage, onComplete])

  const CurrentIcon = processingStages[currentStage]?.icon || Brain

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          >
            {/* Main Icon Animation */}
            <div className="relative mb-6">
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-stellar-orange/20 to-purple-500/20 flex items-center justify-center">
                    <CurrentIcon className="w-12 h-12 text-stellar-orange" />
                  </div>

                  {/* Orbiting particles */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-stellar-orange rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      animate={{
                        rotate: [0 + i * 120, 360 + i * 120],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.4
                      }}
                    >
                      <div className="w-2 h-2 bg-stellar-orange rounded-full -translate-x-12 -translate-y-1" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Stage Title */}
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {processingStages[currentStage]?.title}
              </h3>
              <p className="text-gray-600">
                {processingStages[currentStage]?.subtitle}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-stellar-orange to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Stage Indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {processingStages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStage
                      ? 'w-8 bg-stellar-orange'
                      : index < currentStage
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* AI Feature Showcase */}
            <motion.div
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-semibold text-purple-600">AI POWERED</span>
              </div>
              <motion.p
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-sm text-gray-700"
              >
                {aiFeatures[currentFeature]}
              </motion.p>
            </motion.div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Stellar Intelligence is processing your inspection data
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}