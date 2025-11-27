# YYC³ AI小语智能成长守护系统

> 0-22岁全周期AI智能成长守护平台 | 五大AI角色陪伴 | 公益学习·温暖成长

## 项目简介

YYC³（YanYuCloudCube - 言语云立方）是一个创新的AI驱动成长守护系统，致力于为0-22岁的孩子提供全方位、个性化的成长陪伴和指导。

### 核心特色

- **五大AI角色**：记录者、守护者、聆听者、建议者、国粹导师
- **全周期守护**：覆盖0-22岁七个关键发展阶段
- **五高体系**：高前瞻性、高整合性、高个性化、高情感价值、高实操性
- **多模态交互**：文本、语音、视觉融合的智能对话
- **科学评估**：基于发展心理学的多维度成长评估

## 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **UI库**: React 19.2 + TypeScript
- **样式**: Tailwind CSS v4
- **动画**: Framer Motion
- **组件**: Radix UI
- **图标**: Remix Icon

### AI能力
- **AI SDK**: Vercel AI SDK v5
- **模型支持**: OpenAI GPT-4, xAI Grok, Groq
- **语音**: Azure Speech Service
- **多模态**: 文本 + 语音 + 视觉融合

### 后端
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Vercel Blob
- **缓存**: Redis (Upstash)

### 部署
- **平台**: Vercel
- **分析**: Vercel Analytics + Speed Insights
- **监控**: 内置性能监控

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装步骤

1. 克隆项目
\`\`\`bash
git clone <repository-url>
cd yyc3-ai-growth
\`\`\`

2. 安装依赖
\`\`\`bash
npm install
\`\`\`

3. 配置环境变量
\`\`\`bash
cp .env.example .env.local
# 编辑 .env.local 填入您的API密钥
\`\`\`

4. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

5. 访问应用
打开浏览器访问 `http://localhost:3000`

## 项目结构

\`\`\`
yyc3-ai-growth/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 首页
│   ├── homework/            # 作业页面
│   ├── courses/             # 课程页面
│   ├── activities/          # 公益活动
│   ├── messages/            # 消息中心
│   ├── growth/              # 成长记录
│   ├── settings/            # 设置
│   └── api/                 # API路由
│       ├── ai/              # AI对话接口
│       ├── homework/        # 作业管理
│       └── growth-records/  # 成长记录
├── components/              # React组件
│   ├── ai-xiaoyu/          # AI小语浮窗系统
│   ├── headers/            # 页面头部组件
│   └── Navigation.tsx      # 底部导航
├── hooks/                   # 自定义Hooks
│   ├── useAIXiaoyu.ts      # AI小语状态管理
│   ├── useHomework.ts      # 作业数据管理
│   └── useGrowthRecords.ts # 成长记录管理
├── lib/                     # 工具库
│   ├── ai-roles.ts         # AI角色配置
│   ├── growth-stages.ts    # 成长阶段定义
│   ├── speech.ts           # 语音服务
│   └── db/                 # 数据库客户端
├── types/                   # TypeScript类型定义
├── scripts/                 # 数据库脚本
└── docs/                    # 项目文档
\`\`\`

## 核心功能

### 1. AI小语智能助手

全局悬浮AI助手，提供：
- 智能对话（五大角色切换）
- 语音交互（语音输入/输出）
- 全局控制（页面导航、功能操作）
- 情感分析（情绪识别、智能建议）
- 智能预测（学习预测、目标预估）

快捷键：`Ctrl + K` 唤醒AI小语

### 2. 成长守护体系

七大发展阶段全覆盖：
- 0-3岁：感官启蒙期
- 3-6岁：游戏化学习期
- 6-9岁：学术奠基期
- 9-12岁：思维建构期
- 12-15岁：青春转型期
- 15-18岁：生涯定位期
- 18-22岁：成人成才期

### 3. 成长记录系统

多维度记录孩子成长：
- 里程碑事件
- 日常观察日志
- 情感记录
- 成就徽章

### 4. 智能评估系统

科学多维度评估：
- 认知能力
- 语言能力
- 运动能力
- 社交能力
- AI智能分析与建议

### 5. 作业与课程管理

高效学习管理：
- 作业任务追踪
- 课程进度管理
- 智能提醒
- 优先级管理

## 环境变量配置

详见 `.env.example` 文件，主要配置项：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API密钥 | 是 |
| `AZURE_SPEECH_KEY` | Azure语音服务密钥 | 是 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase项目URL | 推荐 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥 | 推荐 |

## 部署指南

### Vercel部署（推荐）

1. 安装Vercel CLI
\`\`\`bash
npm i -g vercel
\`\`\`

2. 登录Vercel
\`\`\`bash
vercel login
\`\`\`

3. 部署项目
\`\`\`bash
vercel --prod
\`\`\`

4. 在Vercel Dashboard配置环境变量

### Docker部署

\`\`\`bash
docker build -t yyc3-ai-growth .
docker run -p 3000:3000 yyc3-ai-growth
\`\`\`

## 开发指南

### 代码规范

- 使用TypeScript严格模式
- 遵循ESLint配置
- 组件使用函数式组件
- 优先使用Server Components

### 添加新页面

1. 在 `app/` 目录创建新路由文件夹
2. 添加 `page.tsx` 文件
3. 在 `Navigation.tsx` 添加导航项

### 添加新API

1. 在 `app/api/` 创建路由文件
2. 导出 `GET`/`POST`/`PATCH`/`DELETE` 方法
3. 使用 `NextResponse` 返回数据

### 性能优化

- 使用 `loading.tsx` 添加加载状态
- 使用 `error.tsx` 处理错误
- 图片使用 Next.js Image 组件
- 启用代码分割和懒加载

## 数据库Schema

数据库结构详见 `scripts/database-schema.sql`

主要表：
- `users` - 用户信息
- `children` - 儿童档案
- `growth_records` - 成长记录
- `growth_assessments` - 成长评估
- `ai_conversations` - AI对话记录
- `homework_tasks` - 作业任务
- `courses` - 课程信息

## 安全与隐私

- 所有表启用Row Level Security (RLS)
- 用户数据完全隔离
- AI对话数据加密存储
- 符合儿童隐私保护法规
- 家长完全控制数据访问

## 许可证

MIT License

## 联系方式

- 项目主页: [https://yyc3.app](https://yyc3.app)
- 技术支持: support@yyc3.app
- 反馈建议: feedback@yyc3.app

## 致谢

感谢所有为儿童成长守护事业贡献力量的开发者和教育工作者。

---

**YYC³ - 万象归元于云枢 丨 深栈智启新纪元**
