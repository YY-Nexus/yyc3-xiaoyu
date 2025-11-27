"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  className = "",
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
      </div>
    </motion.header>
  )
}
