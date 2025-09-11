"use client"
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabaseClient'

function ResetPasswordInner() {
  const params = useSearchParams()
  const access_token = params.get('access_token')
  const code = params.get('code')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'request' | 'update'>(access_token || code ? 'update' : 'request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setMode(access_token || code ? 'update' : 'request')
  }, [access_token, code])

  // If 'code' is present (newer Supabase flow), exchange it for a session
  useEffect(() => {
    const run = async () => {
      if (!code) return
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'エラーが発生しました'
        setError(msg)
      }
    }
    void run()
  }, [code])

  async function requestEmail(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email) return
    setLoading(true)
    try {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
        ...(typeof window !== 'undefined' && { redirectTo: `${window.location.origin}/reset-password` }),
      })
      if (error) throw error
      setMessage('リセット用のメールを送信しました。メールの案内に従ってください。')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!password || password.length < 6) return
    setLoading(true)
    try {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMessage('パスワードを更新しました。ログイン画面に戻ってサインインしてください。')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      {mode === 'request' ? (
        <form onSubmit={requestEmail} className="space-y-4">
          <h1 className="text-xl font-semibold">パスワードをリセット</h1>
          <p className="text-sm text-gray-600">メールアドレスにリセット用リンクを送信します。</p>
          <input
            type="email"
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            {loading ? '送信中…' : 'メールを送る'}
          </button>
        </form>
      ) : (
        <form onSubmit={updatePassword} className="space-y-4">
          <h1 className="text-xl font-semibold">新しいパスワードを設定</h1>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50">
            {loading ? '更新中…' : '更新する'}
          </button>
        </form>
      )}
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-6">読み込み中…</main>}>
      <ResetPasswordInner />
    </Suspense>
  )
}
