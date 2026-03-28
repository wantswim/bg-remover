'use client'

import { useState, useRef, useCallback } from 'react'

type AppState = 'idle' | 'loading' | 'success' | 'error'

const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || '/api/remove-bg'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function Home() {
  const [state, setState] = useState<AppState>('idle')
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return '请上传 JPG、PNG 或 WebP 格式的图片'
    }
    if (file.size > MAX_FILE_SIZE) {
      return '图片太大，最大支持 10MB'
    }
    return null
  }

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file)
    if (error) {
      setErrorMessage(error)
      setState('error')
      return
    }

    // Show original preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setState('loading')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let msg = '处理失败，请重试'
        try {
          const data = await response.json()
          msg = data.error || msg
        } catch {}
        throw new Error(msg)
      }

      const blob = await response.blob()
      const resultUrl = URL.createObjectURL(blob)
      setResultImage(resultUrl)
      setState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : '处理失败，请重试')
      setState('error')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setState('idle')
    setOriginalImage(null)
    setResultImage(null)
    setErrorMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const downloadResult = () => {
    if (!resultImage) return
    const a = document.createElement('a')
    a.href = resultImage
    a.download = 'bg-removed.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎬 BG Remover
        </h1>
        <p className="text-gray-500">AI 智能去除图像背景</p>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-xl">

          {/* Upload Area - Idle State */}
          {state === 'idle' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                transition-all duration-200 bg-white
                ${isDragOver
                  ? 'border-primary bg-blue-50 scale-105'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="text-lg text-gray-700">
                    拖拽图片到这里，或<span className="text-primary underline">点击上传</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    支持 JPG、PNG、WebP，最大 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {state === 'loading' && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="spinner mx-auto mb-6" />
              <p className="text-lg text-gray-700 mb-2">AI 正在去除背景...</p>
              <p className="text-sm text-gray-400">通常需要 3-5 秒</p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Preview Header */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={reset}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← 重新上传
                </button>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <span className="text-sm text-gray-500 block mb-2">原图</span>
                  <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                    {originalImage && (
                      <img
                        src={originalImage}
                        alt="原图"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500 block mb-2">去背景</span>
                  <div className="checkerboard rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                    {resultImage && (
                      <img
                        src={resultImage}
                        alt="结果图"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center">
                <button
                  onClick={downloadResult}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
                >
                  下载 PNG
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                {errorMessage}
              </div>
              <button
                onClick={reset}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>
          Powered by{' '}
          <a
            href="https://remove.bg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            remove.bg
          </a>{' '}
          +{' '}
          <a
            href="https://workers.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Cloudflare Workers
          </a>
        </p>
      </footer>
    </main>
  )
}
