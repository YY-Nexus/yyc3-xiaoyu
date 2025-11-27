"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, type AuthUser, type AuthSession } from "@/lib/db/supabase-client"

interface UseAuthReturn {
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 初始化时获取当前会话
    const initAuth = async () => {
      try {
        const currentSession = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user || null)
      } catch (err) {
        console.error("Failed to get session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // 监听认证状态变化
    const unsubscribe = supabase.auth.onAuthStateChange((newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await supabase.auth.signUp(email, password, { name })
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await supabase.auth.signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await supabase.auth.signOut()
    } catch (err) {
      setError(err instanceof Error ? err.message : "登出失败")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await supabase.auth.resetPassword(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : "密码重置失败")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    error,
  }
}
