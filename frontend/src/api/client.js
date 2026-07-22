const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const { headers: optionHeaders, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(optionHeaders || {}) },
  })

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new Error(`${res.status} ${message}`)
  }

  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json') ? res.json() : res.text()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
