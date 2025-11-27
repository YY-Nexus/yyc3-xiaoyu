// Supabase数据库客户端封装
// 为未来集成Supabase做准备，提供统一的数据访问接口

import type { Child, GrowthRecord, Assessment, Milestone } from "./client"

// Supabase配置类型
interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

// 认证用户类型
export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}

// 认证会话类型
export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
  expires_at: number
}

// 实时订阅类型
type RealtimeCallback<T> = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: T | null
  old: T | null
}) => void

// 数据库客户端接口
export interface DatabaseClient {
  // 认证方法
  auth: {
    signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<AuthSession>
    signIn: (email: string, password: string) => Promise<AuthSession>
    signOut: () => Promise<void>
    getUser: () => Promise<AuthUser | null>
    getSession: () => Promise<AuthSession | null>
    onAuthStateChange: (callback: (session: AuthSession | null) => void) => () => void
    resetPassword: (email: string) => Promise<void>
    updatePassword: (newPassword: string) => Promise<void>
  }

  // 数据操作方法
  from: <T>(table: string) => {
    select: (columns?: string) => QueryBuilder<T>
    insert: (data: Partial<T> | Partial<T>[]) => Promise<T | T[]>
    update: (data: Partial<T>) => QueryBuilder<T>
    delete: () => QueryBuilder<T>
    upsert: (data: Partial<T> | Partial<T>[]) => Promise<T | T[]>
  }

  // 实时订阅
  subscribe: <T>(table: string, callback: RealtimeCallback<T>) => () => void

  // 存储方法
  storage: {
    upload: (bucket: string, path: string, file: File) => Promise<string>
    download: (bucket: string, path: string) => Promise<Blob>
    remove: (bucket: string, paths: string[]) => Promise<void>
    getPublicUrl: (bucket: string, path: string) => string
    list: (bucket: string, path?: string) => Promise<{ name: string; size: number }[]>
  }

  // RPC调用
  rpc: <T>(functionName: string, params?: Record<string, unknown>) => Promise<T>
}

// 查询构建器接口
interface QueryBuilder<T> {
  eq: (column: string, value: unknown) => QueryBuilder<T>
  neq: (column: string, value: unknown) => QueryBuilder<T>
  gt: (column: string, value: unknown) => QueryBuilder<T>
  gte: (column: string, value: unknown) => QueryBuilder<T>
  lt: (column: string, value: unknown) => QueryBuilder<T>
  lte: (column: string, value: unknown) => QueryBuilder<T>
  like: (column: string, pattern: string) => QueryBuilder<T>
  ilike: (column: string, pattern: string) => QueryBuilder<T>
  in: (column: string, values: unknown[]) => QueryBuilder<T>
  contains: (column: string, value: unknown) => QueryBuilder<T>
  order: (column: string, options?: { ascending?: boolean }) => QueryBuilder<T>
  limit: (count: number) => QueryBuilder<T>
  offset: (count: number) => QueryBuilder<T>
  range: (from: number, to: number) => QueryBuilder<T>
  single: () => Promise<T | null>
  maybeSingle: () => Promise<T | null>
  execute: () => Promise<T[]>
}

// 模拟Supabase客户端（开发环境）
class MockSupabaseClient implements DatabaseClient {
  private storage: Map<string, unknown[]> = new Map()
  private currentUser: AuthUser | null = null
  private currentSession: AuthSession | null = null
  private authListeners: ((session: AuthSession | null) => void)[] = []
  private realtimeListeners: Map<string, RealtimeCallback<unknown>[]> = new Map()

  constructor() {
    // 从localStorage恢复会话
    if (typeof window !== "undefined") {
      const savedSession = localStorage.getItem("yyc3_auth_session")
      if (savedSession) {
        try {
          this.currentSession = JSON.parse(savedSession)
          this.currentUser = this.currentSession?.user || null
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  auth = {
    signUp: async (email: string, password: string, metadata?: Record<string, unknown>): Promise<AuthSession> => {
      // 模拟注册
      const user: AuthUser = {
        id: crypto.randomUUID(),
        email,
        name: (metadata?.name as string) || email.split("@")[0],
        avatar_url: metadata?.avatar_url as string,
        created_at: new Date().toISOString(),
      }

      const session: AuthSession = {
        user,
        access_token: `mock_token_${Date.now()}`,
        refresh_token: `mock_refresh_${Date.now()}`,
        expires_at: Date.now() + 3600000,
      }

      this.currentUser = user
      this.currentSession = session
      this.persistSession(session)
      this.notifyAuthListeners(session)

      return session
    },

    signIn: async (email: string, _password: string): Promise<AuthSession> => {
      // 模拟登录
      const user: AuthUser = {
        id: "user-001",
        email,
        name: email.split("@")[0],
        created_at: new Date().toISOString(),
      }

      const session: AuthSession = {
        user,
        access_token: `mock_token_${Date.now()}`,
        refresh_token: `mock_refresh_${Date.now()}`,
        expires_at: Date.now() + 3600000,
      }

      this.currentUser = user
      this.currentSession = session
      this.persistSession(session)
      this.notifyAuthListeners(session)

      return session
    },

    signOut: async () => {
      this.currentUser = null
      this.currentSession = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("yyc3_auth_session")
      }
      this.notifyAuthListeners(null)
    },

    getUser: async () => this.currentUser,

    getSession: async () => this.currentSession,

    onAuthStateChange: (callback: (session: AuthSession | null) => void) => {
      this.authListeners.push(callback)
      return () => {
        this.authListeners = this.authListeners.filter((l) => l !== callback)
      }
    },

    resetPassword: async (_email: string) => {
      // 模拟发送重置邮件
      console.log("[Mock] Password reset email sent")
    },

    updatePassword: async (_newPassword: string) => {
      // 模拟更新密码
      console.log("[Mock] Password updated")
    },
  }

  from<T>(table: string) {
    return {
      select: (_columns?: string): QueryBuilder<T> => this.createQueryBuilder<T>(table),
      insert: async (data: Partial<T> | Partial<T>[]): Promise<T | T[]> => {
        const collection = this.getCollection<T>(table)
        const items = Array.isArray(data) ? data : [data]
        const newItems = items.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        })) as T[]
        collection.push(...newItems)
        this.setCollection(table, collection)

        // 触发实时通知
        newItems.forEach((item) => {
          this.notifyRealtimeListeners(table, { eventType: "INSERT", new: item, old: null })
        })

        return Array.isArray(data) ? newItems : newItems[0]
      },
      update: (_data: Partial<T>): QueryBuilder<T> => this.createQueryBuilder<T>(table),
      delete: (): QueryBuilder<T> => this.createQueryBuilder<T>(table),
      upsert: async (data: Partial<T> | Partial<T>[]): Promise<T | T[]> => {
        return this.from<T>(table).insert(data)
      },
    }
  }

  subscribe<T>(table: string, callback: RealtimeCallback<T>): () => void {
    if (!this.realtimeListeners.has(table)) {
      this.realtimeListeners.set(table, [])
    }
    this.realtimeListeners.get(table)!.push(callback as RealtimeCallback<unknown>)

    return () => {
      const listeners = this.realtimeListeners.get(table)
      if (listeners) {
        this.realtimeListeners.set(
          table,
          listeners.filter((l) => l !== callback),
        )
      }
    }
  }

  storage = {
    upload: async (_bucket: string, path: string, _file: File): Promise<string> => {
      return `/storage/${path}`
    },
    download: async (_bucket: string, _path: string): Promise<Blob> => {
      return new Blob()
    },
    remove: async (_bucket: string, _paths: string[]): Promise<void> => {},
    getPublicUrl: (_bucket: string, path: string): string => `/storage/${path}`,
    list: async (_bucket: string, _path?: string): Promise<{ name: string; size: number }[]> => [],
  }

  async rpc<T>(_functionName: string, _params?: Record<string, unknown>): Promise<T> {
    return {} as T
  }

  // 私有方法
  private getCollection<T>(table: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(`yyc3_${table}`)
    return data ? JSON.parse(data) : []
  }

  private setCollection<T>(table: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(`yyc3_${table}`, JSON.stringify(data))
  }

  private persistSession(session: AuthSession): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("yyc3_auth_session", JSON.stringify(session))
    }
  }

  private notifyAuthListeners(session: AuthSession | null): void {
    this.authListeners.forEach((l) => l(session))
  }

  private notifyRealtimeListeners<T>(
    table: string,
    payload: { eventType: "INSERT" | "UPDATE" | "DELETE"; new: T | null; old: T | null },
  ): void {
    const listeners = this.realtimeListeners.get(table)
    if (listeners) {
      listeners.forEach((l) => l(payload as { eventType: "INSERT" | "UPDATE" | "DELETE"; new: unknown; old: unknown }))
    }
  }

  private createQueryBuilder<T>(table: string): QueryBuilder<T> {
    const collection = this.getCollection<T>(table)
    const filters: ((item: T) => boolean)[] = []
    let orderColumn: string | null = null
    let orderAscending = true
    let limitCount: number | null = null
    let offsetCount = 0

    const builder: QueryBuilder<T> = {
      eq: (column, value) => {
        filters.push((item: T) => (item as Record<string, unknown>)[column] === value)
        return builder
      },
      neq: (column, value) => {
        filters.push((item: T) => (item as Record<string, unknown>)[column] !== value)
        return builder
      },
      gt: (column, value) => {
        filters.push((item: T) => ((item as Record<string, unknown>)[column] as number) > (value as number))
        return builder
      },
      gte: (column, value) => {
        filters.push((item: T) => ((item as Record<string, unknown>)[column] as number) >= (value as number))
        return builder
      },
      lt: (column, value) => {
        filters.push((item: T) => ((item as Record<string, unknown>)[column] as number) < (value as number))
        return builder
      },
      lte: (column, value) => {
        filters.push((item: T) => ((item as Record<string, unknown>)[column] as number) <= (value as number))
        return builder
      },
      like: (column, pattern) => {
        const regex = new RegExp(pattern.replace(/%/g, ".*"))
        filters.push((item: T) => regex.test(String((item as Record<string, unknown>)[column])))
        return builder
      },
      ilike: (column, pattern) => {
        const regex = new RegExp(pattern.replace(/%/g, ".*"), "i")
        filters.push((item: T) => regex.test(String((item as Record<string, unknown>)[column])))
        return builder
      },
      in: (column, values) => {
        filters.push((item: T) => values.includes((item as Record<string, unknown>)[column]))
        return builder
      },
      contains: (column, value) => {
        filters.push((item: T) => {
          const col = (item as Record<string, unknown>)[column]
          if (Array.isArray(col)) return col.includes(value)
          return false
        })
        return builder
      },
      order: (column, options) => {
        orderColumn = column
        orderAscending = options?.ascending ?? true
        return builder
      },
      limit: (count) => {
        limitCount = count
        return builder
      },
      offset: (count) => {
        offsetCount = count
        return builder
      },
      range: (from, to) => {
        offsetCount = from
        limitCount = to - from + 1
        return builder
      },
      single: async () => {
        const results = await builder.execute()
        return results[0] || null
      },
      maybeSingle: async () => {
        const results = await builder.execute()
        return results[0] || null
      },
      execute: async () => {
        let result = collection

        // 应用过滤器
        for (const filter of filters) {
          result = result.filter(filter)
        }

        // 应用排序
        if (orderColumn) {
          result = result.sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[orderColumn!]
            const bVal = (b as Record<string, unknown>)[orderColumn!]
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            return orderAscending ? cmp : -cmp
          })
        }

        // 应用分页
        if (offsetCount > 0) {
          result = result.slice(offsetCount)
        }
        if (limitCount !== null) {
          result = result.slice(0, limitCount)
        }

        return result
      },
    }

    return builder
  }
}

// 创建并导出客户端实例
export const supabase = new MockSupabaseClient()

// 类型导出
export type { Child, GrowthRecord, Assessment, Milestone }
