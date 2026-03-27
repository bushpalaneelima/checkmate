'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (!adminData) { router.push('/dashboard'); return }
      setAdmin(adminData)
      setLoading(false)
    }
    checkAdmin()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Overview',  href: '/admin',          icon: '◈' },
    { label: 'Groups',    href: '/admin/groups',    icon: '⬡' },
    { label: 'Customers', href: '/admin/customers', icon: '◉' },
    { label: 'Players',   href: '/admin/players',   icon: '◎' },
    { label: 'Rules',     href: '/admin/rules',     icon: '❖' },
    { label: 'Dashboard', href: '/dashboard',       icon: '⌂' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-amber-400 text-sm tracking-widest uppercase animate-pulse">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative w-60 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col fixed left-0 top-0 bottom-0">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-amber-400 rotate-45 rounded-sm" />
            <span className="text-white font-bold tracking-widest uppercase text-sm">Checkmate</span>
          </div>
          <p className="text-zinc-600 text-xs ml-7">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Admin info */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white text-xs font-medium">{admin?.name}</p>
              <p className="text-zinc-600 text-xs">Admin</p>
            </div>
            <button onClick={handleLogout} className="text-zinc-600 hover:text-white text-xs transition-colors">
              Out →
            </button>
          </div>
          <p className="text-zinc-700 text-xs text-center">
            Powered by{' '}
            <a href="https://nbbluestudios.com" target="_blank" className="hover:text-zinc-500 transition-colors">
              NB Blue Studios
            </a>
          </p>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <main className="relative flex-1 ml-60 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
