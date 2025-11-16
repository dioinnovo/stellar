"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Volume2, Wifi, WifiOff, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceDebugPanelProps {
  isConnected: boolean
  isCallActive: boolean
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown'
  error: string | null
  audioLevel?: number
  showDebug?: boolean
}

export function VoiceDebugPanel({
  isConnected,
  isCallActive,
  connectionQuality,
  error,
  audioLevel = 0,
  showDebug = false
}: VoiceDebugPanelProps) {
  const [micLevel, setMicLevel] = useState(0)
  const [speakerLevel, setSpeakerLevel] = useState(0)
  const animationFrameRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const micStreamRef = useRef<MediaStream>()

  // Initialize audio level monitoring
  useEffect(() => {
    if (!showDebug || !isCallActive) return

    const initAudioMonitoring = async () => {
      try {
        // Create audio context for monitoring
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256

        // Get microphone stream
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: true
        })

        const source = audioContextRef.current.createMediaStreamSource(micStreamRef.current)
        source.connect(analyserRef.current)

        // Start monitoring loop
        const monitorAudioLevels = () => {
          if (!analyserRef.current) return

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)

          // Calculate average level
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          const normalizedLevel = Math.min(100, (average / 128) * 100)
          
          setMicLevel(normalizedLevel)
          
          animationFrameRef.current = requestAnimationFrame(monitorAudioLevels)
        }

        monitorAudioLevels()
      } catch (error) {
        console.error('Failed to initialize audio monitoring:', error)
      }
    }

    initAudioMonitoring()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [showDebug, isCallActive])

  // Simulate speaker level for now (in production, get from audio processor)
  useEffect(() => {
    if (audioLevel) {
      setSpeakerLevel(audioLevel)
    }
  }, [audioLevel])

  if (!showDebug) return null

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'good':
        return <Wifi className="w-4 h-4 text-yellow-500" />
      case 'poor':
        return <WifiOff className="w-4 h-4 text-red-500" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'bg-green-500'
      case 'good':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="fixed bottom-20 right-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80 z-40">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Voice Debug Panel</h3>
        <div className="flex items-center gap-2">
          {getConnectionIcon()}
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? getConnectionColor() : 'bg-gray-400'
          )} />
        </div>
      </div>

      {/* Connection Status */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Connection:</span>
          <span className={cn(
            "font-medium",
            isConnected ? "text-green-600" : "text-red-600"
          )}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Quality:</span>
          <span className="font-medium capitalize">{connectionQuality}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Call Status:</span>
          <span className="font-medium">{isCallActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {/* Audio Levels */}
      <div className="space-y-3">
        {/* Microphone Level */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span className="text-gray-600 dark:text-gray-400">Microphone</span>
            </div>
            <span className="text-gray-500">{Math.round(micLevel)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-100",
                micLevel > 80 ? "bg-red-500" : micLevel > 50 ? "bg-yellow-500" : "bg-green-500"
              )}
              style={{ width: `${micLevel}%` }}
            />
          </div>
        </div>

        {/* Speaker Level */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span className="text-gray-600 dark:text-gray-400">Speaker</span>
            </div>
            <span className="text-gray-500">{Math.round(speakerLevel)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-100",
                speakerLevel > 80 ? "bg-red-500" : speakerLevel > 50 ? "bg-yellow-500" : "bg-blue-500"
              )}
              style={{ width: `${speakerLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* Activity Indicator */}
      {isCallActive && (
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Activity className="w-3 h-3 animate-pulse text-green-500" />
            <span>Voice activity detected</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}