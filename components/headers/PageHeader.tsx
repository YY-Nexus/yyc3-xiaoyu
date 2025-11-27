"use client"

import type React from "react"

import { motion } from "framer-motion"

interface PageHeaderProps {
  icon: string
  title: string
  actions?: Array<{ icon: string; label: string; onClick?: () => void }>
  children?: React.ReactNode
}

export default function PageHeader({ icon, title, actions, children }: PageHeaderProps) {
  return (
    <motion.header
      className="w-full px-8 py-4 flex items-center justify-between z-20"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
        <i className={`${icon} text-blue-500`} />
        {title}
      </h1>

      {actions && (
        <div className="flex gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={index}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-blue-50 transition text-slate-600"
              onClick={action.onClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={`${action.icon} text-lg`} />
              <span className="text-sm font-bold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {children}
    </motion.header>
  )
}
