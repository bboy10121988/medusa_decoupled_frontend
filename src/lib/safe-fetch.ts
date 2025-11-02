// safe-fetch.ts
// Lightweight wrapper around global fetch to gracefully handle AbortError and known abort messages.
export async function safeFetchGlobal<T = any>(input: RequestInfo, init?: RequestInit, fallback: T | null = null): Promise<T | null> {
  try {
    const res = await fetch(input, init)
    return (await res.json?.()) ?? (res as unknown as T)
  } catch (error: any) {
    const msg = String(error?.message || error)
    if (error?.name === 'AbortError' || msg.includes('The user aborted a request') || msg.includes('signal is aborted')) {
      // if (process.env.NODE_ENV === 'development') console.warn('Global fetch aborted (handled):', msg)
      return fallback
    }
    throw error
  }
}

export default safeFetchGlobal
