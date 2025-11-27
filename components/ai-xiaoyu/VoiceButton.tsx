"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { getSpeechService } from "@/lib/speech"

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  className?: string
}

export default function VoiceButton({ onTranscript, className = "" }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)

  const handleVoiceInput = async () => {
    const speechService = getSpeechService()

    if (!speechService.isSupported().recognition) {
      alert("您的浏览器不支持语音识别功能")
      return
    }

    if (isListening) {
      speechService.stopListening()
      setIsListening(false)
      return
    }

    setIsListening(true)
    console.log("[v0] 开始语音识别...")

    try {
      await speechService.startListening(
        (transcript) => {
          console.log("[v0] 识别结果:", transcript)
          onTranscript(transcript)
          setIsListening(false)
        },
        (error) => {
          console.error("[v0] 语音识别错误:", error)
          setIsListening(false)
        },
      )
    } catch (error) {
      console.error("[v0] 语音识别失败:", error)
      setIsListening(false)
    }
  }

  return (
    <motion.button
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isListening ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      } ${className}`}
      onClick={handleVoiceInput}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={
        isListening
          ? {
              boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0.7)", "0 0 0 10px rgba(239, 68, 68, 0)"],
            }
          : {}
      }
      transition={
        isListening
          ? {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
            }
          : {}
      }
      title={isListening ? "点击停止" : "点击说话"}
    >
      <i className={isListening ? "ri-stop-circle-line" : "ri-mic-line"} />
    </motion.button>
  )
}
