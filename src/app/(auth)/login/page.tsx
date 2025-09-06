"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { useAppStore } from '@/lib/store'
import { isCurrentUserOnboardingCompleted } from '@/lib/profileUtils'
import Link from 'next/link'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>(() => 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const profile = useAppStore((s) => s.profile)

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !loading

  // ログイン後の遷移処理
  const handlePostLogin = async () => {
    try {
      // データベースのonboarding_completed状態をチェック
      const isCompleted = await isCurrentUserOnboardingCompleted()
      
      if (!isCompleted) {
        // オンボーディング未完了の場合はオンボーディングへ
        router.push('/onboarding')
      } else {
        // 既存ユーザーはダッシュボードへ
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
      // エラー時はオンボーディングへ（安全な方向へ）
      router.push('/onboarding')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!canSubmit) return
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
  setMessage('ログインしました。リダイレクトします…')
  await handlePostLogin()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('サインアップが完了しました。メール確認が必要な場合は案内に従ってください。')
        // 新規登録後はオンボーディングへ
        setTimeout(() => {
          router.push('/onboarding')
        }, 2000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">{mode === 'signin' ? 'ログイン' : '新規登録'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">パスワード</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? '送信中…' : mode === 'signin' ? 'ログイン' : '登録する'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-blue-700 underline"
            onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
          >
            {mode === 'signin' ? '新規登録はこちら' : 'ログインはこちら'}
          </button>
          <Link href="/reset-password" className="text-blue-700 underline">
            パスワードをお忘れですか？
          </Link>
        </div>
      </form>
    </main>
  )
}
