export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export function isApiError<T>(
  r: ApiResponse<T>,
): r is { success: false; error: string } {
  return r.success === false
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text()
  try {
    return JSON.parse(text) as ApiResponse<T>
  } catch {
    return { success: false, error: 'invalid_json' }
  }
}

export async function apiGet<T>(path: string) {
  const res = await fetch(path, { method: 'GET' })
  return parseJson<T>(res)
}

export async function apiJson<T>(
  path: string,
  params: { method: 'POST' | 'PATCH' | 'PUT'; body?: unknown },
) {
  const res = await fetch(path, {
    method: params.method,
    headers: { 'Content-Type': 'application/json' },
    body: params.body === undefined ? undefined : JSON.stringify(params.body),
  })
  return parseJson<T>(res)
}

export async function apiForm<T>(
  path: string,
  params: { method: 'POST' | 'PUT'; form: FormData },
) {
  const res = await fetch(path, { method: params.method, body: params.form })
  return parseJson<T>(res)
}
