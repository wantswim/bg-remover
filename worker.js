/**
 * Cloudflare Worker - Image Background Remover
 * Alternative API endpoint (can be used instead of Next.js API route)
 */

const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const apiKey = env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'REMOVE_BG_API_KEY not configured' }, 500);
    }

    try {
      const formData = await request.formData();
      const imageFile = formData.get('image');

      if (!imageFile) {
        return jsonResponse({ error: 'No image file provided' }, 400);
      }

      // Check file size
      if (imageFile.size > MAX_FILE_SIZE) {
        return jsonResponse({ error: 'File too large. Max 10MB.' }, 400);
      }

      // Prepare remove.bg request
      const rbFormData = new FormData();
      rbFormData.append('image_file', imageFile);
      rbFormData.append('size', 'auto');
      rbFormData.append('format', 'png');

      // Call remove.bg
      const response = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: rbFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('remove.bg error:', response.status, errorText);
        return jsonResponse(
          { error: `remove.bg API error: ${response.status}` },
          response.status
        );
      }

      // Return the processed image
      const resultBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/png';

      return new Response(resultBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
