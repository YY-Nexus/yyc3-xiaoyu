"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAIXiaoyu } from "@/hooks/useAIXiaoyu"
import VoiceInputButton from "./VoiceInputButton"
import AIRoleSwitcher from "./AIRoleSwitcher"
import EmotionIndicator from "./EmotionIndicator"
import { selectRoleByContext, type AIRole, AI_ROLES } from "@/lib/ai-roles"
import MilestoneCelebration from "@/components/growth/MilestoneCelebration"

type Tab = "chat" | "control" | "emotion" | "prediction" | "settings"

export default function FloatingAIWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("chat")
  const [celebrationData, setCelebrationData] = useState<{
    show: boolean
    title: string
    description: string
  }>({ show: false, title: "", description: "" })
  const widgetRef = useRef<HTMLDivElement>(null)

  const { isListening, isProcessing, isWakeWordActive, startWakeWordListening, stopWakeWordListening } = useAIXiaoyu()

  // 键盘快捷键 Ctrl+K
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // 用户可通过快捷键 Ctrl+K 唤起AI助手
  // useEffect(() => {
  //   startWakeWordListening(() => {
  //     setIsOpen(true)
  //     setActiveTab("chat")
  //   })
  //   return () => {
  //     stopWakeWordListening()
  //   }
  // }, [startWakeWordListening, stopWakeWordListening])

  const toggleWidget = () => setIsOpen(!isOpen)

  const triggerCelebration = (title: string, description: string) => {
    setCelebrationData({ show: true, title, description })
  }

  const closeCelebration = () => {
    setCelebrationData({ show: false, title: "", description: "" })
  }

  return (
    <>
      <MilestoneCelebration
        isVisible={celebrationData.show}
        milestoneTitle={celebrationData.title}
        milestoneDescription={celebrationData.description}
        onClose={closeCelebration}
      />

      {/* 悬浮球触发按钮 */}
      <motion.div
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg cursor-pointer z-50 flex items-center justify-center"
        onClick={toggleWidget}
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
          boxShadow: isListening
            ? [
                "0 0 20px rgba(99, 102, 241, 0.5)",
                "0 0 40px rgba(139, 92, 246, 0.8)",
                "0 0 20px rgba(99, 102, 241, 0.5)",
              ]
            : "0 4px 20px rgba(99, 102, 241, 0.4)",
        }}
        transition={{
          scale: { duration: 1.5, repeat: isListening ? Number.POSITIVE_INFINITY : 0 },
          boxShadow: { duration: 1.5, repeat: isListening ? Number.POSITIVE_INFINITY : 0 },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="AI小语助手 (Ctrl+K)"
      >
        <motion.div
          className="text-white text-2xl font-bold"
          animate={{ rotate: isListening ? 360 : 0 }}
          transition={{ duration: 2, repeat: isListening ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
        >
          AI
        </motion.div>

        {/* 呼吸光环 */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* 唤醒词监听指示器 */}
        {isWakeWordActive && (
          <motion.div
            className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            title="语音唤醒已开启"
          />
        )}

        {/* 未读消息徽章 */}
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          3
        </motion.div>
      </motion.div>

      {/* AI浮窗面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            className="fixed bottom-24 right-24 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* 标题栏 */}
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <span className="text-sm font-bold">AI</span>
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">AI小语助手</h3>
                  <p className="text-xs text-white/80">YYC³ 智能伙伴</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="ri-subtract-line" />
                </motion.button>
                <motion.button
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  onClick={toggleWidget}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <i className="ri-close-line" />
                </motion.button>
              </div>
            </div>

            {/* Tab导航 */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              {[
                { id: "chat" as Tab, icon: "ri-chat-3-fill", label: "对话" },
                { id: "control" as Tab, icon: "ri-remote-control-fill", label: "控制" },
                { id: "emotion" as Tab, icon: "ri-heart-pulse-fill", label: "情感" },
                { id: "prediction" as Tab, icon: "ri-lightbulb-flash-fill", label: "预测" },
                { id: "settings" as Tab, icon: "ri-settings-3-fill", label: "设置" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`flex-1 flex flex-col items-center py-3 text-xs transition-all ${
                    activeTab === tab.id
                      ? "text-blue-500 border-b-2 border-blue-500 bg-white"
                      : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className={`${tab.icon} text-lg mb-1`} />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "chat" && <ChatTab key="chat" />}
                {activeTab === "control" && <ControlTab key="control" />}
                {activeTab === "emotion" && <EmotionTab key="emotion" />}
                {activeTab === "prediction" && <PredictionTab key="prediction" />}
                {activeTab === "settings" && <SettingsTab key="settings" />}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ChatTab() {
  const { messages, sendMessage, isProcessing, speakText, currentRole, setCurrentRole } = useAIXiaoyu()
  const [input, setInput] = useState("")
  const [suggestedRole, setSuggestedRole] = useState<AIRole | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (input.length > 5) {
      const suggested = selectRoleByContext(input)
      if (suggested !== currentRole) {
        setSuggestedRole(suggested)
      } else {
        setSuggestedRole(undefined)
      }
    } else {
      setSuggestedRole(undefined)
    }
  }, [input, currentRole])

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return
    await sendMessage(input, currentRole)
    setInput("")
    setSuggestedRole(undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => prev + text)
  }

  const acceptSuggestedRole = () => {
    if (suggestedRole) {
      setCurrentRole(suggestedRole)
      setSuggestedRole(undefined)
    }
  }

  return (
    <motion.div
      className="h-[440px] flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* 角色切换器 */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <AIRoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} suggestedRole={suggestedRole} />
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div className="text-center py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-4xl mb-3">👋</div>
            <h4 className="font-bold text-slate-700 mb-2">你好呀！我是AI小语</h4>
            <p className="text-sm text-slate-500 mb-4">你的专属学习伙伴，有什么我可以帮助你的吗？</p>
            <p className="text-xs text-slate-400">说"小语"可以唤醒我哦~</p>
          </motion.div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {/* 显示AI角色标识 */}
              {msg.role === "assistant" && msg.aiRole && (
                <div className="flex items-center gap-1 mb-1 text-xs text-slate-500">
                  <i className={AI_ROLES[msg.aiRole].icon} />
                  <span>{AI_ROLES[msg.aiRole].name}</span>
                </div>
              )}

              <div className="whitespace-pre-wrap break-words">{msg.content}</div>

              {msg.role === "assistant" && msg.content && (
                <motion.button
                  className="mt-2 text-xs text-slate-500 hover:text-blue-500 transition flex items-center gap-1"
                  onClick={() => speakText(msg.content)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="ri-volume-up-line" />
                  <span>朗读</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}

        {isProcessing && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-sm">
              <motion.div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-slate-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 角色建议提示 */}
      {suggestedRole && (
        <motion.div
          className="mx-4 mb-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>
            <i className="ri-lightbulb-flash-line mr-1" />
            建议切换到"{AI_ROLES[suggestedRole].name}"角色
          </span>
          <button
            className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            onClick={acceptSuggestedRole}
          >
            切换
          </button>
        </motion.div>
      )}

      {/* 输入区 */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isProcessing} />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题... (Enter发送)"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-full outline-none focus:border-blue-400 transition"
            disabled={isProcessing}
          />

          <motion.button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              input.trim() && !isProcessing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            onClick={handleSend}
            whileHover={input.trim() && !isProcessing ? { scale: 1.1 } : {}}
            whileTap={input.trim() && !isProcessing ? { scale: 0.9 } : {}}
            disabled={!input.trim() || isProcessing}
          >
            <i className="ri-send-plane-fill" />
          </motion.button>
        </div>

        {/* 快捷操作 */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {["帮我复习", "今日作业", "学习建议", "成长分析"].map((text, i) => (
            <motion.button
              key={i}
              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-slate-200 transition disabled:opacity-50"
              onClick={() => setInput(text)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isProcessing}
            >
              {text}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function ControlTab() {
  const controls = [
    { icon: "ri-home-4-line", label: "回到首页", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    { icon: "ri-book-open-line", label: "打开作业", color: "bg-orange-50 text-orange-600 hover:bg-orange-100" },
    { icon: "ri-play-circle-line", label: "继续课程", color: "bg-green-50 text-green-600 hover:bg-green-100" },
    { icon: "ri-trophy-line", label: "查看成长", color: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" },
    { icon: "ri-volume-up-line", label: "朗读内容", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
    { icon: "ri-lightbulb-line", label: "智能建议", color: "bg-pink-50 text-pink-600 hover:bg-pink-100" },
  ]

  return (
    <motion.div
      className="h-[440px] p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-lg font-bold mb-4">智能控制中心</h3>
      <div className="grid grid-cols-2 gap-4">
        {controls.map((control, i) => (
          <motion.button
            key={i}
            className={`p-4 rounded-2xl transition flex flex-col items-center gap-2 ${control.color}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`${control.icon} text-3xl`} />
            <span className="text-sm font-medium">{control.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function EmotionTab() {
  const { emotion } = useAIXiaoyu()

  const emotionDisplay = {
    happy: { emoji: "😊", label: "开心", color: "from-yellow-50 to-orange-50" },
    sad: { emoji: "😢", label: "难过", color: "from-blue-50 to-indigo-50" },
    angry: { emoji: "😠", label: "生气", color: "from-red-50 to-orange-50" },
    excited: { emoji: "🎉", label: "兴奋", color: "from-pink-50 to-purple-50" },
    calm: { emoji: "😌", label: "平静", color: "from-green-50 to-teal-50" },
    neutral: { emoji: "😐", label: "平常", color: "from-slate-50 to-gray-50" },
  }

  const currentEmotion = emotion?.type
    ? emotionDisplay[emotion.type as keyof typeof emotionDisplay]
    : emotionDisplay.neutral
  const score = emotion?.confidence ? Math.round(emotion.confidence * 100) : 50

  return (
    <motion.div
      className="h-[440px] p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-lg font-bold mb-6">情绪守护</h3>

      {/* 当前情绪 */}
      <div className={`bg-gradient-to-br ${currentEmotion.color} rounded-3xl p-6 mb-6 text-center`}>
        <motion.div
          className="text-6xl mb-3"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {currentEmotion.emoji}
        </motion.div>
        <h4 className="text-2xl font-bold text-slate-800 mb-2">当前心情: {currentEmotion.label}</h4>
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-sm text-slate-600 mt-2">情绪指数: {score}/100</p>
      </div>

      {/* 情感指示器组件 */}
      <EmotionIndicator compact />

      {/* 情绪建议 */}
      <div className="bg-blue-50 rounded-2xl p-4 mt-4">
        <h5 className="font-bold text-blue-700 mb-2">小语的建议</h5>
        <p className="text-sm text-slate-600">
          {emotion?.type === "happy" && "你今天的状态很不错！建议继续保持积极的学习态度，可以尝试挑战一些稍难的题目哦~"}
          {emotion?.type === "sad" && "看起来你有些不开心，要不要和我聊聊？我可以陪你说说话，或者听一首轻松的音乐？"}
          {emotion?.type === "angry" && "深呼吸，让我们一起冷静下来。有什么让你不高兴的事情吗？说出来会好受一些。"}
          {(!emotion || emotion.type === "neutral") && "继续保持专注，有任何问题随时可以问我哦~"}
        </p>
      </div>
    </motion.div>
  )
}

function PredictionTab() {
  const predictions = [
    { icon: "ri-book-line", title: "语文作业", prediction: "今天18:00前完成", confidence: 90 },
    { icon: "ri-time-line", title: "最佳学习时段", prediction: "下午15:00-17:00", confidence: 85 },
    { icon: "ri-trophy-line", title: "本周目标", prediction: "可完成8项任务", confidence: 88 },
  ]

  return (
    <motion.div
      className="h-[440px] p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-lg font-bold mb-6">智能预测</h3>
      <div className="space-y-4">
        {predictions.map((pred, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500">
                <i className={`${pred.icon} text-xl`} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 mb-1">{pred.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{pred.prediction}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${pred.confidence}%` }}
                      transition={{ duration: 1, delay: i * 0.2 + 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-purple-600 font-medium">{pred.confidence}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function SettingsTab() {
  const { isWakeWordActive, startWakeWordListening, stopWakeWordListening } = useAIXiaoyu()
  const [wakeWordEnabled, setWakeWordEnabled] = useState(isWakeWordActive)

  const toggleWakeWord = () => {
    if (wakeWordEnabled) {
      stopWakeWordListening()
    } else {
      startWakeWordListening(() => {})
    }
    setWakeWordEnabled(!wakeWordEnabled)
  }

  return (
    <motion.div
      className="h-[440px] p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-lg font-bold mb-6">AI小语设置</h3>
      <div className="space-y-4">
        {/* 语音唤醒设置 */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-700">语音唤醒</h4>
            <button
              className={`w-12 h-6 rounded-full transition ${wakeWordEnabled ? "bg-blue-500" : "bg-slate-300"}`}
              onClick={toggleWakeWord}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow"
                animate={{ x: wakeWordEnabled ? 26 : 2 }}
                transition={{ type: "spring", stiffness: 500 }}
              />
            </button>
          </div>
          <p className="text-sm text-slate-500">说"小语"或"Hey小语"可以唤醒我</p>
        </div>

        {/* 对话风格设置 */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <h4 className="font-bold text-slate-700 mb-2">对话风格</h4>
          <p className="text-sm text-slate-500 mb-3">选择AI小语的交流风格</p>
          <div className="flex gap-2">
            {["友善", "专业", "活泼"].map((style) => (
              <button
                key={style}
                className="flex-1 py-2 bg-white rounded-full hover:bg-blue-50 transition text-sm border border-slate-200"
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* 朗读速度设置 */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <h4 className="font-bold text-slate-700 mb-2">朗读速度</h4>
          <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>慢</span>
            <span>正常</span>
            <span>快</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
