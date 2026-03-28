# BG Remover 🎬

> AI 智能去除图像背景，一键生成透明 PNG

[remove.bg](https://remove.bg) + Next.js 驱动，快速部署到 Vercel。

## 功能特点

- ✅ 拖拽或上传图片
- ✅ AI 自动去除背景
- ✅ 透明 PNG 输出
- ✅ 移动端适配
- ✅ 无需登录，即用即走
- ✅ 完全免费（remove.bg 免费额度内）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/wantswim/bg-remover.git
cd bg-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 remove.bg API Key：

```
REMOVE_BG_API_KEY=你的APIKey
```

**获取 API Key：** https://remove.bg/api （免费 50 张/月）

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 查看效果。

### 5. 部署到 Vercel

```bash
npm install -g vercel
vercel
```

或在 Vercel Dashboard 导入 GitHub 仓库，配置环境变量后部署。

## 项目结构

```
bg-remover/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── remove-bg/
│   │   │       └── route.ts    # API 路由
│   │   ├── globals.css         # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页面
│   └── components/            # 组件（暂无）
├── public/                    # 静态资源
├── .env.example               # 环境变量示例
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## 技术栈

- **框架:** Next.js 15 (App Router)
- **样式:** Tailwind CSS
- **语言:** TypeScript
- **API:** remove.bg

## 注意事项

- remove.bg 免费额度：**50 张/月**，超出需付费
- 图片限制：**最大 10MB**
- 支持格式：**JPG、PNG、WebP**
- 背景去除需要 **3-5 秒** 请耐心等待

## License

MIT
