import { NextRequest, NextResponse } from 'next/server'

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.REMOVE_BG_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'REMOVE_BG_API_KEY not configured' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 10MB.' },
        { status: 400 }
      )
    }

    // Prepare remove.bg request
    const rbFormData = new FormData()
    rbFormData.append('image_file', imageFile)
    rbFormData.append('size', 'auto')
    rbFormData.append('format', 'png')

    // Call remove.bg API
    const response = await fetch(REMOVE_BG_API_URL, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: rbFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('remove.bg error:', response.status, errorText)
      return NextResponse.json(
        { error: `remove.bg API error: ${response.status}` },
        { status: response.status }
      )
    }

    // Return the processed image
    const resultBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'

    return new NextResponse(resultBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
