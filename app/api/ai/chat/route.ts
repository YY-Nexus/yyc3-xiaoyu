import { streamText } from "ai"
import { selectRoleByContext, getRoleSystemPrompt, getCoordinatedPrompt, type AIRole } from "@/lib/ai-roles"

export async function POST(request: Request) {
  try {
    const { message, history, role, complexity, involvedRoles } = await request.json()

    const selectedRole: AIRole = role || selectRoleByContext(message)

    let systemPrompt: string
    if (complexity === "complex" && involvedRoles?.length > 1) {
      // 复杂问题使用协同提示词
      systemPrompt = getCoordinatedPrompt(message, involvedRoles)
    } else {
      systemPrompt = getRoleSystemPrompt(selectedRole)
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(history || []).map((msg: any) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ]

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            const data = JSON.stringify({
              content: chunk,
              role: selectedRole,
              complexity,
            })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (error) {
          console.error("[v0] 流式响应错误:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] AI API错误:", error)
    return new Response(JSON.stringify({ error: "处理失败，请稍后重试" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
