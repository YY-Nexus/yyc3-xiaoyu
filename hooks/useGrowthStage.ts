"use client"

import { useState, useEffect, useCallback } from "react"
import { getGrowthStageManager, getStageRecommendations, type AgeStageConfig } from "@/lib/growth-stages"

export interface UseGrowthStageResult {
  currentStage: AgeStageConfig | null
  exactAge: { years: number; months: number; days: number } | null
  ageInMonths: number | null
  milestoneProgress: { completed: number; total: number; upcoming: string[] }
  approachingNextStage: { approaching: boolean; daysUntil: number; nextStage: string | null }
  recommendations: {
    activities: string[]
    books: string[]
    skills: string[]
    warnings: string[]
  }
  setChildBirthDate: (date: Date) => void
  formatAge: () => string
}

export function useGrowthStage(initialBirthDate?: Date): UseGrowthStageResult {
  const [currentStage, setCurrentStage] = useState<AgeStageConfig | null>(null)
  const [exactAge, setExactAge] = useState<{ years: number; months: number; days: number } | null>(null)
  const [ageInMonths, setAgeInMonths] = useState<number | null>(null)
  const [milestoneProgress, setMilestoneProgress] = useState({ completed: 0, total: 0, upcoming: [] as string[] })
  const [approachingNextStage, setApproachingNextStage] = useState({
    approaching: false,
    daysUntil: 0,
    nextStage: null as string | null,
  })
  const [recommendations, setRecommendations] = useState({
    activities: [] as string[],
    books: [] as string[],
    skills: [] as string[],
    warnings: [] as string[],
  })

  const manager = getGrowthStageManager()

  const updateStageData = useCallback(() => {
    const stage = manager.getCurrentStageConfig()
    setCurrentStage(stage)

    setExactAge(manager.getExactAge())
    setAgeInMonths(manager.getAgeInMonths())
    setMilestoneProgress(manager.getMilestoneProgress())
    setApproachingNextStage(manager.isApproachingNextStage())

    if (stage) {
      setRecommendations(getStageRecommendations(stage.id))
    }
  }, [manager])

  const setChildBirthDate = useCallback(
    (date: Date) => {
      manager.setChildBirthDate(date)
      updateStageData()
    },
    [manager, updateStageData],
  )

  const formatAge = useCallback((): string => {
    if (!exactAge) return "未设置"

    const parts = []
    if (exactAge.years > 0) parts.push(`${exactAge.years}岁`)
    if (exactAge.months > 0) parts.push(`${exactAge.months}个月`)
    if (exactAge.years === 0 && exactAge.days > 0) parts.push(`${exactAge.days}天`)

    return parts.join("") || "刚出生"
  }, [exactAge])

  // 初始化
  useEffect(() => {
    if (initialBirthDate) {
      setChildBirthDate(initialBirthDate)
    }
  }, [initialBirthDate, setChildBirthDate])

  // 监听阶段变化
  useEffect(() => {
    const unsubscribe = manager.onStageChange((stage) => {
      updateStageData()
    })

    return () => unsubscribe()
  }, [manager, updateStageData])

  return {
    currentStage,
    exactAge,
    ageInMonths,
    milestoneProgress,
    approachingNextStage,
    recommendations,
    setChildBirthDate,
    formatAge,
  }
}
