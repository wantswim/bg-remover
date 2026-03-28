import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BG Remover - 图像背景去除',
  description: 'AI 智能去除图像背景，一键生成透明 PNG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
