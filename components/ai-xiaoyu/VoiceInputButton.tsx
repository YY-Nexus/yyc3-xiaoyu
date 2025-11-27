"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getVoiceSystem } from "@/lib/voice/voice-system"

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcript, setTranscript] = useState("")
  const voiceSystem = useRef(getVoiceSystem())
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const startRecording = () => {
    if (disabled || !voiceSystem.current.isSupported()) return

    setIsRecording(true)
    setTranscript("")

    // 模拟音量检测动画
    const animateLevel = () => {
      setAudioLevel(Math.random() * 100)
      animationFrameRef.current = requestAnimationFrame(animateLevel)
    }
    animateLevel()

    voiceSystem.current.startListening(
      (result) => {
        setTranscript(result.transcript)

        if (result.isFinal) {
          stopRecording()
          onTranscript(result.transcript)
        }
      },
      (error) => {
        console.error("[v0] 录音错误:", error)
        stopRecording()
      },
    )
  }

  const stopRecording = () => {
    setIsRecording(false)
    setAudioLevel(0)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    voiceSystem.current.stopListening()
  }

  return (
    <div className="relative">
      <motion.button
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? "bg-red-500 text-white"
            : disabled
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        disabled={disabled}
        title={isRecording ? "松开发送" : "按住说话"}
      >
        <i className={isRecording ? "ri-mic-fill" : "ri-mic-line"} />

        {/* 录音动画 */}
        <AnimatePresence>
          {isRecording && (
            <>
              {/* 声波圆环 */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-red-400"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{
                    scale: [1, 1.5, 2],
                    opacity: [0.8, 0.4, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 实时识别文本提示 */}
      <AnimatePresence>
        {isRecording && transcript && (
          <motion.div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {transcript}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 音量指示器 */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute -bottom-1 left-0 right-0 h-1 bg-red-400 rounded-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: audioLevel / 100 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
