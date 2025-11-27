"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useDraggable } from "@/hooks/useDraggable"
import { useAIXiaoyu } from "@/hooks/useAIXiaoyu"
import { aiCommandParser } from "@/lib/ai-command-parser"
import VoiceInputButton from "./VoiceInputButton"
import AIRoleSwitcher from "./AIRoleSwitcher"
import EmotionIndicator from "./EmotionIndicator"
import { AI_ROLES, selectRoleByContext, type AIRole } from "@/lib/ai-roles"

type Tab = "chat" | "control" | "emotion" | "prediction" | "settings"
type WidgetSize = "mini" | "normal" | "expanded"

export default function DraggableAIWidget() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("chat")
  const [widgetSize, setWidgetSize] = useState<WidgetSize>("normal")
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  const { position, isDragging, dragRef, handleMouseDown, handleTouchStart } = useDraggable({
    magneticEdges: true,
    magneticThreshold: 30,
    persistPosition: true,
    storageKey: "ai-widget-position",
  })

  const {
    messages,
    sendMessage,
    isProcessing,
    isListening,
    isWakeWordActive,
    speakText,
    currentRole,
    setCurrentRole,
    emotion,
  } = useAIXiaoyu()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node) && isOpen && !isDragging) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, isDragging])

  const handleCommand = async (input: string): Promise<string> => {
    const commands = aiCommandParser.parseIntent(input)

    if (commands.length > 0 && commands[0].type !== "chat") {
      const result = await aiCommandParser.executeCommand(commands[0], {
        router,
        openModal: setActiveModal,
        speak: speakText,
        setWidgetSize,
      })

      if (result.success && result.action) {
        result.action()
      }

      if (result.data) {
        return aiCommandParser.formatQueryResult(result)
      }

      return result.message
    }

    return ""
  }

  const toggleWidget = () => {
    if (!isDragging) {
      setIsOpen(!isOpen)
    }
  }

  const sizeConfig = {
    mini: { width: 60, height: 60 },
    normal: { width: 400, height: 550 },
    expanded: { width: 500, height: 700 },
  }

  const currentSize = sizeConfig[widgetSize]

  return (
    <>
      <motion.div
        ref={dragRef}
        className="fixed z-50"
        style={{
          left: position.x,
          top: position.y,
          touchAction: "none",
        }}
        animate={{
          scale: isDragging ? 1.05 : 1,
        }}
      >
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg cursor-pointer flex items-center justify-center select-none rounded-2xl"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={toggleWidget}
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
            boxShadow: isListening
              ? [
                  "0 0 20px rgba(99, 102, 241, 0.5)",
                  "0 0 40px rgba(139, 92, 246, 0.8)",
                  "0 0 20px rgba(99, 102, 241, 0.5)",
                ]
              : isDragging
                ? "0 20px 40px rgba(0, 0, 0, 0.3)"
                : "0 4px 20px rgba(99, 102, 241, 0.4)",
          }}
          transition={{
            scale: { duration: 1.5, repeat: isListening ? Number.POSITIVE_INFINITY : 0 },
            boxShadow: { duration: 1.5, repeat: isListening ? Number.POSITIVE_INFINITY : 0 },
          }}
          whileHover={!isDragging ? { scale: 1.1 } : {}}
          whileTap={!isDragging ? { scale: 0.95 } : {}}
          title="AI小语助手 (Ctrl+K) - 可拖拽"
        >
          <motion.div
            className="text-white text-xl font-bold pointer-events-none"
            animate={{ rotate: isProcessing ? 360 : 0 }}
            transition={{ duration: 2, repeat: isProcessing ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          >
            AI
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30 pointer-events-none"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />

          {isDragging && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-white/50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {isWakeWordActive && (
            <motion.div
              className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 rounded-full pointer-events-none"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
          )}

          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            3
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            className="fixed z-50 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            style={{
              width: currentSize.width,
              height: widgetSize === "mini" ? "auto" : currentSize.height,
              right: 24,
              bottom: 100,
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <span className="text-sm font-bold">AI</span>
                </motion.div>
                <div>
                  <h3 className="font-bold text-base">AI小语助手</h3>
                  <p className="text-xs text-white/80">YYC3 智能伙伴</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-sm"
                  onClick={() => setWidgetSize(widgetSize === "mini" ? "normal" : "mini")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={widgetSize === "mini" ? "展开" : "最小化"}
                >
                  <i className={widgetSize === "mini" ? "ri-expand-up-down-line" : "ri-subtract-line"} />
                </motion.button>
                <motion.button
                  className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-sm"
                  onClick={() => setWidgetSize(widgetSize === "expanded" ? "normal" : "expanded")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={widgetSize === "expanded" ? "缩小" : "放大"}
                >
                  <i
                    className={widgetSize === "expanded" ? "ri-contract-left-right-line" : "ri-expand-left-right-line"}
                  />
                </motion.button>
                <motion.button
                  className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-sm"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="关闭"
                >
                  <i className="ri-close-line" />
                </motion.button>
              </div>
            </div>

            {widgetSize !== "mini" && (
              <>
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
                      className={`flex-1 flex flex-col items-center py-2 text-xs transition-all ${
                        activeTab === tab.id
                          ? "text-blue-500 border-b-2 border-blue-500 bg-white"
                          : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className={`${tab.icon} text-base mb-0.5`} />
                      <span className="text-[10px]">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="flex-1 overflow-hidden" style={{ height: currentSize.height - 120 }}>
                  <AnimatePresence mode="wait">
                    {activeTab === "chat" && (
                      <ChatTabContent
                        key="chat"
                        messages={messages}
                        sendMessage={sendMessage}
                        isProcessing={isProcessing}
                        speakText={speakText}
                        currentRole={currentRole}
                        setCurrentRole={setCurrentRole}
                        onCommand={handleCommand}
                        height={currentSize.height - 120}
                      />
                    )}
                    {activeTab === "control" && <ControlTabContent key="control" router={router} />}
                    {activeTab === "emotion" && <EmotionTabContent key="emotion" emotion={emotion} />}
                    {activeTab === "prediction" && <PredictionTabContent key="prediction" />}
                    {activeTab === "settings" && <SettingsTabContent key="settings" />}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ChatTabContent({
  messages,
  sendMessage,
  isProcessing,
  speakText,
  currentRole,
  setCurrentRole,
  onCommand,
  height,
}: {
  messages: { role: string; content: string; aiRole?: AIRole }[]
  sendMessage: (content: string, role?: AIRole) => Promise<void>
  isProcessing: boolean
  speakText: (text: string) => void
  currentRole: AIRole
  setCurrentRole: (role: AIRole) => void
  onCommand: (input: string) => Promise<string>
  height: number
}) {
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

    const commandResult = await onCommand(input)
    if (commandResult) {
      await sendMessage(input, currentRole)
    } else {
      await sendMessage(input, currentRole)
    }

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

  return (
    <motion.div
      className="flex flex-col"
      style={{ height }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="px-3 py-2 border-b border-slate-200 bg-white">
        <AIRoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} suggestedRole={suggestedRole} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <motion.div className="text-center py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-3xl mb-2">👋</div>
            <h4 className="font-bold text-slate-700 mb-1 text-sm">你好呀！我是AI小语</h4>
            <p className="text-xs text-slate-500 mb-2">你的专属学习伙伴</p>
            <div className="text-xs text-slate-400 space-y-1">
              <p>试试说: "打开日程" "今天有什么作业"</p>
              <p>按 Ctrl+K 快速唤醒</p>
            </div>
          </motion.div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[85%] p-2.5 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" && msg.aiRole && (
                <div className="flex items-center gap-1 mb-1 text-xs text-slate-500">
                  <i className={AI_ROLES[msg.aiRole].icon} />
                  <span>{AI_ROLES[msg.aiRole].name}</span>
                </div>
              )}
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              {msg.role === "assistant" && msg.content && (
                <motion.button
                  className="mt-1.5 text-xs text-slate-500 hover:text-blue-500 transition flex items-center gap-1"
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
            <div className="bg-slate-100 p-2.5 rounded-2xl rounded-bl-sm">
              <motion.div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {suggestedRole && (
        <motion.div
          className="mx-3 mb-2 px-2.5 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>
            <i className="ri-lightbulb-flash-line mr-1" />
            建议: {AI_ROLES[suggestedRole].name}
          </span>
          <button
            className="px-2 py-0.5 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            onClick={() => {
              setCurrentRole(suggestedRole)
              setSuggestedRole(undefined)
            }}
          >
            切换
          </button>
        </motion.div>
      )}

      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <VoiceInputButton onTranscript={handleVoiceTranscript} disabled={isProcessing} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入指令或问题..."
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-full outline-none focus:border-blue-400 transition"
            disabled={isProcessing}
          />
          <motion.button
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              input.trim() && !isProcessing
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            onClick={handleSend}
            whileHover={input.trim() && !isProcessing ? { scale: 1.1 } : {}}
            whileTap={input.trim() && !isProcessing ? { scale: 0.9 } : {}}
            disabled={!input.trim() || isProcessing}
          >
            <i className="ri-send-plane-fill text-sm" />
          </motion.button>
        </div>

        <div className="flex gap-1.5 mt-2 flex-wrap">
          {["打开日程", "今日作业", "学习建议", "成长分析"].map((text, i) => (
            <motion.button
              key={i}
              className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-slate-200 transition"
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

function ControlTabContent({ router }: { router: { push: (path: string) => void } }) {
  const controls = [
    { icon: "ri-home-4-line", label: "首页", path: "/", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    {
      icon: "ri-calendar-schedule-line",
      label: "日程",
      path: "/schedule",
      color: "bg-green-50 text-green-600 hover:bg-green-100",
    },
    {
      icon: "ri-book-open-line",
      label: "作业",
      path: "/homework",
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    },
    {
      icon: "ri-trophy-line",
      label: "成长",
      path: "/growth",
      color: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
    },
    {
      icon: "ri-user-smile-line",
      label: "档案",
      path: "/children",
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      icon: "ri-settings-3-line",
      label: "设置",
      path: "/settings",
      color: "bg-slate-50 text-slate-600 hover:bg-slate-100",
    },
  ]

  return (
    <motion.div
      className="h-full p-4 overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-base font-bold mb-3">快捷控制</h3>
      <div className="grid grid-cols-3 gap-2">
        {controls.map((control, i) => (
          <motion.button
            key={i}
            className={`p-3 rounded-xl transition flex flex-col items-center gap-1.5 ${control.color}`}
            onClick={() => router.push(control.path)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`${control.icon} text-xl`} />
            <span className="text-xs font-medium">{control.label}</span>
          </motion.button>
        ))}
      </div>

      <h3 className="text-base font-bold mt-4 mb-3">语音指令示例</h3>
      <div className="space-y-2 text-xs text-slate-600">
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="text-blue-500 font-medium">"打开日程"</span> - 跳转到日程页面
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="text-blue-500 font-medium">"今天有什么作业"</span> - 查询今日作业
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="text-blue-500 font-medium">"创建日程"</span> - 打开日程创建
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <span className="text-blue-500 font-medium">"播放故事"</span> - 开始语音播放
        </div>
      </div>
    </motion.div>
  )
}

function EmotionTabContent({ emotion }: { emotion: { type: string; confidence: number } | null }) {
  const emotionDisplay: Record<string, { emoji: string; label: string; color: string }> = {
    happy: { emoji: "😊", label: "开心", color: "from-yellow-50 to-orange-50" },
    sad: { emoji: "😢", label: "难过", color: "from-blue-50 to-indigo-50" },
    angry: { emoji: "😠", label: "生气", color: "from-red-50 to-orange-50" },
    excited: { emoji: "🎉", label: "兴奋", color: "from-pink-50 to-purple-50" },
    calm: { emoji: "😌", label: "平静", color: "from-green-50 to-teal-50" },
    neutral: { emoji: "😐", label: "平常", color: "from-slate-50 to-gray-50" },
  }

  const currentEmotion = emotion?.type ? emotionDisplay[emotion.type] || emotionDisplay.neutral : emotionDisplay.neutral
  const score = emotion?.confidence ? Math.round(emotion.confidence * 100) : 50

  return (
    <motion.div
      className="h-full p-4 overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-base font-bold mb-3">情绪守护</h3>

      <div className={`bg-gradient-to-br ${currentEmotion.color} rounded-2xl p-4 mb-4 text-center`}>
        <motion.div
          className="text-4xl mb-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {currentEmotion.emoji}
        </motion.div>
        <h4 className="text-lg font-bold text-slate-800 mb-1">当前心情: {currentEmotion.label}</h4>
        <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-xs text-slate-600 mt-1">情绪指数: {score}/100</p>
      </div>

      <EmotionIndicator compact />

      <div className="bg-blue-50 rounded-xl p-3 mt-3">
        <h5 className="font-bold text-blue-700 mb-1 text-sm">小语的建议</h5>
        <p className="text-xs text-slate-600">
          {emotion?.type === "happy" && "你今天的状态很不错！继续保持积极的学习态度~"}
          {emotion?.type === "sad" && "看起来你有些不开心，要不要和我聊聊？"}
          {emotion?.type === "angry" && "深呼吸，让我们一起冷静下来。"}
          {(!emotion || emotion.type === "neutral") && "继续保持专注，有问题随时问我哦~"}
        </p>
      </div>
    </motion.div>
  )
}

function PredictionTabContent() {
  const predictions = [
    { icon: "ri-book-2-line", title: "学习预测", value: "今日状态良好", trend: "up", color: "text-green-500" },
    { icon: "ri-time-line", title: "最佳时段", value: "上午9-11点", trend: "stable", color: "text-blue-500" },
    { icon: "ri-target-line", title: "目标完成", value: "预计85%", trend: "up", color: "text-purple-500" },
  ]

  return (
    <motion.div
      className="h-full p-4 overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-base font-bold mb-3">智能预测</h3>

      <div className="space-y-2">
        {predictions.map((pred, i) => (
          <motion.div
            key={i}
            className="bg-slate-50 rounded-xl p-3 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${pred.color}`}>
              <i className={`${pred.icon} text-lg`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">{pred.title}</p>
              <p className="font-bold text-slate-800 text-sm">{pred.value}</p>
            </div>
            <i
              className={`${pred.trend === "up" ? "ri-arrow-up-line text-green-500" : "ri-subtract-line text-slate-400"}`}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <h4 className="font-bold text-slate-800 mb-1 text-sm">今日学习建议</h4>
        <p className="text-xs text-slate-600">
          根据你的学习习惯，建议在上午进行数学练习，下午可以安排轻松的阅读时间。记得每45分钟休息一下哦！
        </p>
      </div>
    </motion.div>
  )
}

function SettingsTabContent() {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [autoReply, setAutoReply] = useState(true)
  const [soundEffect, setSoundEffect] = useState(true)

  return (
    <motion.div
      className="h-full p-4 overflow-y-auto"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h3 className="text-base font-bold mb-3">助手设置</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2">
            <i className="ri-volume-up-line text-blue-500" />
            <span className="text-sm">语音播报</span>
          </div>
          <button
            className={`w-10 h-6 rounded-full transition ${voiceEnabled ? "bg-blue-500" : "bg-slate-300"}`}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            <motion.div className="w-5 h-5 bg-white rounded-full shadow" animate={{ x: voiceEnabled ? 18 : 2 }} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2">
            <i className="ri-chat-check-line text-green-500" />
            <span className="text-sm">智能回复</span>
          </div>
          <button
            className={`w-10 h-6 rounded-full transition ${autoReply ? "bg-blue-500" : "bg-slate-300"}`}
            onClick={() => setAutoReply(!autoReply)}
          >
            <motion.div className="w-5 h-5 bg-white rounded-full shadow" animate={{ x: autoReply ? 18 : 2 }} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-2">
            <i className="ri-notification-3-line text-orange-500" />
            <span className="text-sm">音效提示</span>
          </div>
          <button
            className={`w-10 h-6 rounded-full transition ${soundEffect ? "bg-blue-500" : "bg-slate-300"}`}
            onClick={() => setSoundEffect(!soundEffect)}
          >
            <motion.div className="w-5 h-5 bg-white rounded-full shadow" animate={{ x: soundEffect ? 18 : 2 }} />
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-100 rounded-xl">
        <p className="text-xs text-slate-500 text-center">AI小语 v2.0 | YYC3智能成长守护</p>
      </div>
    </motion.div>
  )
}
