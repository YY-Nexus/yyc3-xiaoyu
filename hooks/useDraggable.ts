"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef, type RefObject } from "react"

interface Position {
  x: number
  y: number
}

interface BoundsConfig {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

interface DraggableConfig {
  initialPosition?: Position
  bounds?: BoundsConfig
  magneticEdges?: boolean
  magneticThreshold?: number
  onDragStart?: () => void
  onDragEnd?: (position: Position) => void
  persistPosition?: boolean
  storageKey?: string
}

interface DraggableReturn {
  position: Position
  isDragging: boolean
  dragRef: RefObject<HTMLDivElement>
  handleMouseDown: (e: React.MouseEvent) => void
  handleTouchStart: (e: React.TouchEvent) => void
  resetPosition: () => void
  setPosition: (pos: Position) => void
}

export function useDraggable(config: DraggableConfig = {}): DraggableReturn {
  const {
    initialPosition = { x: 0, y: 0 },
    bounds,
    magneticEdges = true,
    magneticThreshold = 30,
    onDragStart,
    onDragEnd,
    persistPosition = true,
    storageKey = "draggable-position",
  } = config

  const [position, setPositionState] = useState<Position>(() => {
    if (typeof window === "undefined") return initialPosition

    if (persistPosition) {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return initialPosition
        }
      }
    }

    return {
      x: window.innerWidth - 80,
      y: window.innerHeight - 200,
    }
  })

  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef<Position>({ x: 0, y: 0 })
  const elementStartPos = useRef<Position>({ x: 0, y: 0 })

  const calculateMagneticPosition = useCallback(
    (pos: Position, elementWidth: number, elementHeight: number): Position => {
      if (!magneticEdges || typeof window === "undefined") return pos

      const { innerWidth, innerHeight } = window
      let { x, y } = pos

      const effectiveBounds = {
        top: bounds?.top ?? 0,
        right: bounds?.right ?? innerWidth,
        bottom: bounds?.bottom ?? innerHeight,
        left: bounds?.left ?? 0,
      }

      if (x < effectiveBounds.left + magneticThreshold) {
        x = effectiveBounds.left
      } else if (x > effectiveBounds.right - magneticThreshold - elementWidth) {
        x = effectiveBounds.right - elementWidth
      }

      if (y < effectiveBounds.top + magneticThreshold) {
        y = effectiveBounds.top
      } else if (y > effectiveBounds.bottom - magneticThreshold - elementHeight) {
        y = effectiveBounds.bottom - elementHeight
      }

      return { x, y }
    },
    [magneticEdges, magneticThreshold, bounds],
  )

  const constrainPosition = useCallback(
    (pos: Position, elementWidth: number, elementHeight: number): Position => {
      if (typeof window === "undefined") return pos

      const { innerWidth, innerHeight } = window
      const effectiveBounds = {
        top: bounds?.top ?? 0,
        right: bounds?.right ?? innerWidth,
        bottom: bounds?.bottom ?? innerHeight,
        left: bounds?.left ?? 0,
      }

      return {
        x: Math.max(effectiveBounds.left, Math.min(pos.x, effectiveBounds.right - elementWidth)),
        y: Math.max(effectiveBounds.top, Math.min(pos.y, effectiveBounds.bottom - elementHeight)),
      }
    },
    [bounds],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !dragRef.current) return

      const deltaX = clientX - dragStartPos.current.x
      const deltaY = clientY - dragStartPos.current.y

      const newPos = {
        x: elementStartPos.current.x + deltaX,
        y: elementStartPos.current.y + deltaY,
      }

      const rect = dragRef.current.getBoundingClientRect()
      const constrained = constrainPosition(newPos, rect.width, rect.height)

      setPositionState(constrained)
    },
    [isDragging, constrainPosition],
  )

  const handleEnd = useCallback(() => {
    if (!isDragging || !dragRef.current) return

    setIsDragging(false)

    const rect = dragRef.current.getBoundingClientRect()
    const magneticPos = calculateMagneticPosition(position, rect.width, rect.height)

    setPositionState(magneticPos)

    if (persistPosition) {
      localStorage.setItem(storageKey, JSON.stringify(magneticPos))
    }

    onDragEnd?.(magneticPos)
  }, [isDragging, position, calculateMagneticPosition, persistPosition, storageKey, onDragEnd])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(true)
      dragStartPos.current = { x: e.clientX, y: e.clientY }
      elementStartPos.current = { ...position }

      onDragStart?.()
    },
    [position, onDragStart],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return

      const touch = e.touches[0]
      setIsDragging(true)
      dragStartPos.current = { x: touch.clientX, y: touch.clientY }
      elementStartPos.current = { ...position }

      onDragStart?.()
    },
    [position, onDragStart],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }

    const handleMouseUp = () => handleEnd()
    const handleTouchEnd = () => handleEnd()

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      if (dragRef.current) {
        const rect = dragRef.current.getBoundingClientRect()
        const constrained = constrainPosition(position, rect.width, rect.height)
        setPositionState(constrained)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [position, constrainPosition])

  const resetPosition = useCallback(() => {
    if (typeof window === "undefined") return

    const defaultPos = {
      x: window.innerWidth - 80,
      y: window.innerHeight - 200,
    }
    setPositionState(defaultPos)

    if (persistPosition) {
      localStorage.setItem(storageKey, JSON.stringify(defaultPos))
    }
  }, [persistPosition, storageKey])

  const setPosition = useCallback(
    (pos: Position) => {
      setPositionState(pos)
      if (persistPosition) {
        localStorage.setItem(storageKey, JSON.stringify(pos))
      }
    },
    [persistPosition, storageKey],
  )

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
    setPosition,
  }
}
