import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path

  if (!pathParam || typeof pathParam !== 'string') {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  // Build query string — remove the ?path=... part, keep the rest
  const fullUrl = req.url ?? ''
  const queryStart = fullUrl.indexOf('?')
  const queryString = queryStart !== -1 ? fullUrl.slice(queryStart) : ''
  const params = new URLSearchParams(queryString)
  params.delete('path')
  const remainingQuery = params.toString()

  const targetUrl = `https://fortnite-api.com/${pathParam}${remainingQuery ? `?${remainingQuery}` : ''}`

  const response = await fetch(targetUrl, {
    headers: {
      'Authorization': process.env.FORTNITE_API_KEY ?? '',
    }
  })

  const data = await response.json()
  return res.status(200).json(data)
}