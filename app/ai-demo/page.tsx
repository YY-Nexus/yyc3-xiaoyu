// AI功能演示页面

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { getVoiceSystem } from "@/lib/voice/voice-system"
import { useEmotionAnalysis } from "@/hooks/useEmotionAnalysis"
import { AI_ROLES, type AIRole } from "@/lib/ai-roles"

export default function AIDemoPage() {
  const [testText, setTestText] = useState("")
  const [voiceResult, setVoiceResult] = useState("")
  const [selectedRole, setSelectedRole] = useState<AIRole>("advisor")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const { analyzeEmotion, currentEmotion, getEmotionEmoji, getEmotionColor } = useEmotionAnalysis()
  const voiceSystem = getVoiceSystem()

  const handleVoiceTest = () => {
    if (isListening) {
      voiceSystem.stopListening()
      setIsListening(false)
      return
    }

    setIsListening(true)
    voiceSystem.startListening(
      (result) => {
        setVoiceResult(result.transcript)
        if (result.isFinal) {
          setIsListening(false)
        }
      },
      (error) => {
        console.error("语音识别错误:", error)
        setIsListening(false)
      },
    )
  }

  const handleSpeak = async (text: string) => {
    setIsSpeaking(true)
    try {
      await voiceSystem.speak(text)
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleEmotionTest = async () => {
    if (testText) {
      await analyzeEmotion(testText, true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-slate-800 mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI小语功能演示
        </motion.h1>
        <motion.p
          className="text-slate-600 text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          体验语音交互、情感分析和五大AI角色系统
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 语音交互测试 */}
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="ri-mic-line text-blue-500" />
              语音交互系统
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  支持状态: {voiceSystem.isSupported() ? "✅ 已支持" : "❌ 不支持"}
                </p>
                <motion.button
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    isListening ? "bg-red-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  onClick={handleVoiceTest}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isListening ? "停止识别" : "开始语音识别"}
                </motion.button>
              </div>

              {voiceResult && (
                <motion.div
                  className="p-4 bg-blue-50 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-slate-600 mb-1">识别结果:</p>
                  <p className="font-medium text-slate-800">{voiceResult}</p>
                </motion.div>
              )}

              <div>
                <p className="text-sm text-slate-600 mb-2">语音合成测试:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入要朗读的文本"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-400"
                    defaultValue="你好，我是AI小语，很高兴为你服务！"
                    id="speakText"
                  />
                  <motion.button
                    className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50"
                    onClick={() => {
                      const input = document.getElementById("speakText") as HTMLInputElement
                      if (input.value) {
                        handleSpeak(input.value)
                      }
                    }}
                    disabled={isSpeaking}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSpeaking ? "播放中..." : "朗读"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 情感分析测试 */}
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="ri-heart-pulse-line text-pink-500" />
              情感分析系统
            </h2>

            <div className="space-y-4">
              <div>
                <textarea
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-pink-400 resize-none"
                  rows={4}
                  placeholder="输入文本进行情感分析..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                />
              </div>

              <motion.button
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600"
                onClick={handleEmotionTest}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                分析情感
              </motion.button>

              {currentEmotion && (
                <motion.div
                  className={`p-6 bg-gradient-to-br from-${getEmotionColor(currentEmotion.emotion)}-50 to-${getEmotionColor(currentEmotion.emotion)}-100 rounded-2xl`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-6xl">{getEmotionEmoji(currentEmotion.emotion)}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">情绪: {currentEmotion.emotion}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${getEmotionColor(currentEmotion.emotion)}-500`}
                            style={{ width: `${currentEmotion.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round(currentEmotion.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {currentEmotion.keywords.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-slate-600 mb-2">关键词:</p>
                      <div className="flex flex-wrap gap-2">
                        {currentEmotion.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className={`px-3 py-1 bg-white text-${getEmotionColor(currentEmotion.emotion)}-600 text-sm rounded-full`}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentEmotion.advice && (
                    <div className="mt-4 p-4 bg-white/50 rounded-xl">
                      <p className="text-sm text-slate-700">{currentEmotion.advice}</p>
                    </div>
                  )}
                </motion.div>
              )}

              <div>
                <p className="text-sm text-slate-600 mb-2">快速测试:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "今天真开心，考试得了满分！",
                    "我很难过，朋友不理我了...",
                    "太生气了，作业又做错了！",
                    "我好紧张，明天要演讲",
                  ].map((text, i) => (
                    <button
                      key={i}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-slate-200 transition"
                      onClick={() => setTestText(text)}
                    >
                      {text.slice(0, 10)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI角色系统展示 */}
          <motion.div
            className="md:col-span-2 bg-white rounded-3xl p-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="ri-group-line text-green-500" />
              五大AI角色系统
            </h2>

            <div className="grid md:grid-cols-5 gap-4">
              {Object.values(AI_ROLES).map((role) => (
                <motion.button
                  key={role.id}
                  className={`p-4 rounded-2xl text-center transition-all ${
                    selectedRole === role.id
                      ? `bg-${role.color}-100 border-2 border-${role.color}-400`
                      : `bg-${role.color}-50 border-2 border-transparent hover:border-${role.color}-300`
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className={`${role.icon} text-4xl text-${role.color}-500 mb-2 block`} />
                  <h3 className="font-bold text-slate-800 mb-1">{role.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{role.description}</p>
                </motion.button>
              ))}
            </div>

            {selectedRole && (
              <motion.div
                className="mt-6 p-6 bg-slate-50 rounded-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-bold text-slate-800 mb-3">{AI_ROLES[selectedRole].name} - 系统提示词</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{AI_ROLES[selectedRole].systemPrompt}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* 返回按钮 */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition"
          >
            <i className="ri-home-line" />
            返回首页
          </a>
        </motion.div>
      </div>
    </div>
  )
}
