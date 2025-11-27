"use client"

import useSWR from "swr"

interface GrowthRecord {
  id: string
  child_id: string
  type: "milestone" | "observation" | "emotion" | "achievement"
  title: string
  content?: string
  media_urls: string[]
  metadata: Record<string, any>
  recorded_at: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useGrowthRecords(childId?: string, type?: string) {
  const params = new URLSearchParams()
  if (childId) params.append("childId", childId)
  if (type) params.append("type", type)

  const { data, error, mutate } = useSWR(`/api/growth-records?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const createRecord = async (record: Omit<GrowthRecord, "id" | "created_at">) => {
    try {
      const response = await fetch("/api/growth-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })

      if (!response.ok) throw new Error("Failed to create growth record")

      mutate()
      return await response.json()
    } catch (error) {
      console.error("[v0] Error creating growth record:", error)
      throw error
    }
  }

  return {
    records: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    createRecord,
    refresh: mutate,
  }
}
