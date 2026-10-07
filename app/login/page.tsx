'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: manager } = await supabase
        .from('managers')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single()

      if (manager?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-flex flex-col items-center justify-center group"
          >
            <img
              src="/game-of-gambits-icon.svg"
              alt="Game of Gambits"
              className="h-16 w-16 mb-4 transition-transform group-hover:scale-105"
            />

            <div className="font-black tracking-wide text-xl">
              <span className="text-white">GAME OF </span>
              <span className="text-amber-400">GAMBITS</span>
            </div>
          </Link>

          <p className="text-zinc-500 text-xs tracking-[0.22em] uppercase mt-2">
            Strategic Decision Simulation
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-8">
          <h1 className="text-white text-2xl font-bold mb-1">
            Welcome back
          </h1>

          <p className="text-zinc-500 text-sm mb-8">
            Sign in to your manager account
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/50 text-black font-bold rounded-lg py-3 text-sm tracking-wide transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Back to homepage */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
          >
            ← Back to Game of Gambits
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-600 text-xs mt-4">
          Game of Gambits · Developed by{' '}
          <a
            href="https://www.nbbluestudios.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            NB Blue Studios
          </a>
        </p>
      </div>
    </div>
  )
}
