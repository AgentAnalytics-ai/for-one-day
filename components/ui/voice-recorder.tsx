'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Square, Trash2 } from 'lucide-react'
import { PremiumButton } from '@/components/ui/premium-button'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl: string) => void
  onRemoveRecording: () => void
  initialAudioUrl?: string
  disabled?: boolean
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  onRemoveRecording, 
  initialAudioUrl,
  disabled = false 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check for microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false))

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob, url)
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      setHasPermission(false)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      setRecordingTime(0)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playAudio = () => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const removeRecording = () => {
    setAudioUrl(null)
    setIsPlaying(false)
    onRemoveRecording()
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (hasPermission === false) {
    return (
      <div className="p-6 border-2 border-dashed border-red-200 rounded-xl bg-red-50">
        <div className="text-center">
          <MicOff className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Microphone Access Required</h3>
          <p className="text-red-600 mb-4">
            Please allow microphone access to record voice messages for your legacy notes.
          </p>
          <button
            onClick={() => setHasPermission(null)}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      {!audioUrl && (
        <div className="p-6 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
            
            {!isRecording ? (
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Record Your Voice</h3>
                <p className="text-purple-600 mb-4">
                  Add your voice to make this legacy note even more personal
                </p>
                <PremiumButton
                  onClick={startRecording}
                  disabled={disabled}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </PremiumButton>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-mono text-purple-800">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={pauseRecording}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={stopRecording}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-sm text-purple-600 mt-3">
                  {isPaused ? 'Recording paused' : 'Recording in progress...'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Playback */}
      {audioUrl && (
        <div className="p-4 border border-green-200 rounded-xl bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Voice Recording</h4>
                <p className="text-sm text-green-600">Your personal message</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <button
                onClick={removeRecording}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="w-full mt-3"
            controls
          />
        </div>
      )}

      {/* Premium Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Premium Feature: Voice recordings make your legacy notes even more personal
      </div>
    </div>
  )
}
