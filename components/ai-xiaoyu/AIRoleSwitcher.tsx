"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AI_ROLES, type AIRole } from "@/lib/ai-roles"

interface AIRoleSwitcherProps {
  currentRole: AIRole
  onRoleChange: (role: AIRole) => void
  suggestedRole?: AIRole
}

export default function AIRoleSwitcher({ currentRole, onRoleChange, suggestedRole }: AIRoleSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const roles = Object.values(AI_ROLES)

  return (
    <div className="relative">
      {/* 当前角色显示 */}
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full hover:shadow-md transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <i className={`${AI_ROLES[currentRole].icon} text-lg text-${AI_ROLES[currentRole].color}-500`} />
        <span className="font-medium text-sm">{AI_ROLES[currentRole].name}</span>
        <i className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line text-sm text-slate-400`} />

        {/* 建议徽章 */}
        {suggestedRole && suggestedRole !== currentRole && (
          <motion.span
            className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            推荐
          </motion.span>
        )}
      </motion.button>

      {/* 角色选择面板 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-3 space-y-2">
              {roles.map((role, index) => {
                const isActive = role.id === currentRole
                const isSuggested = role.id === suggestedRole
                const colorClass = `text-${role.color}-500`
                const bgClass = `bg-${role.color}-50`
                const hoverClass = `hover:bg-${role.color}-100`

                return (
                  <motion.button
                    key={role.id}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      isActive
                        ? `${bgClass} border-2 border-${role.color}-300`
                        : `bg-slate-50 border border-transparent ${hoverClass}`
                    }`}
                    onClick={() => {
                      onRoleChange(role.id)
                      setIsExpanded(false)
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 ${bgClass} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <i className={`${role.icon} text-xl ${colorClass}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800">{role.name}</h4>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">当前</span>
                          )}
                          {isSuggested && !isActive && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">推荐</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{role.description}</p>
                      </div>

                      {isActive && <i className="ri-check-line text-xl text-blue-500 flex-shrink-0" />}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* 角色说明 */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
              <p className="text-xs text-slate-500">小语会根据你的问题智能推荐合适的角色</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
