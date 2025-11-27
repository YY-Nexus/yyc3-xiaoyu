"use client"

import { motion } from "framer-motion"
import { useEmotionAnalysis } from "@/hooks/useEmotionAnalysis"
import { useEffect } from "react"

interface EmotionIndicatorProps {
  text: string
  autoAnalyze?: boolean
}

export default function EmotionIndicator({ text, autoAnalyze = true }: EmotionIndicatorProps) {
  const { analyzeEmotion, currentEmotion, getEmotionEmoji, getEmotionColor, isAnalyzing } = useEmotionAnalysis()

  useEffect(() => {
    if (autoAnalyze && text && text.length > 5) {
      analyzeEmotion(text, false)
    }
  }, [text, autoAnalyze, analyzeEmotion])

  if (!currentEmotion || isAnalyzing) {
    return null
  }

  const emoji = getEmotionEmoji(currentEmotion.emotion)
  const color = getEmotionColor(currentEmotion.emotion)

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${color}-50 border border-${color}-200 rounded-full text-sm`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
    >
      <motion.span className="text-lg" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
        {emoji}
      </motion.span>
      <span className={`text-${color}-700 font-medium`}>
        {currentEmotion.emotion === "happy" && "开心"}
        {currentEmotion.emotion === "sad" && "难过"}
        {currentEmotion.emotion === "angry" && "生气"}
        {currentEmotion.emotion === "excited" && "兴奋"}
        {currentEmotion.emotion === "calm" && "平静"}
        {currentEmotion.emotion === "anxious" && "焦虑"}
        {currentEmotion.emotion === "neutral" && "平和"}
      </span>
      <div className={`w-12 h-1.5 bg-${color}-200 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full bg-${color}-500 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${currentEmotion.confidence * 100}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </motion.div>
  )
}
