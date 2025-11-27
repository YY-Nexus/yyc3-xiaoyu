import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { content, recordType } = await request.json()

    const prompt = `你是AI小语，专业的儿童成长记录分析助手。

用户正在创建一条${recordType === "milestone" ? "里程碑" : recordType === "observation" ? "观察日志" : recordType === "emotion" ? "情感记录" : "学习记录"}。

记录内容：
${content}

请分析这条记录并提供：
1. suggestedTitle: 一个简短的标题（10字以内）
2. suggestedTags: 3-5个相关标签（数组形式）
3. analysis: 30字以内的简短分析
4. isMilestone: 是否是重要的成长里程碑（布尔值）
5. milestoneType: 如果是里程碑，说明类型（如：first_word, first_step等）

以JSON格式返回。`

    // 实际应调用AI模型，这里使用模拟数据
    const mockResponse = {
      suggestedTitle: content.slice(0, 15) + "...",
      suggestedTags: ["成长", "进步", "值得记录"],
      analysis: "这是一个值得记录的成长瞬间，展现了孩子的进步",
      isMilestone: content.includes("第一次") || content.includes("独立"),
      milestoneType: content.includes("第一次") ? "achievement" : null,
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("[v0] AI分析记录失败:", error)
    return NextResponse.json({ error: "AI分析失败" }, { status: 500 })
  }
}
