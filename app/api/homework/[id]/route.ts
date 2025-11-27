import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const updated = await db.update("homework_tasks", params.id, body)

    if (!updated) {
      return NextResponse.json({ error: "Homework not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: updated, success: true })
  } catch (error) {
    console.error("[v0] Error updating homework:", error)
    return NextResponse.json({ error: "Failed to update homework", success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await db.delete("homework_tasks", params.id)

    if (!deleted) {
      return NextResponse.json({ error: "Homework not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting homework:", error)
    return NextResponse.json({ error: "Failed to delete homework", success: false }, { status: 500 })
  }
}
