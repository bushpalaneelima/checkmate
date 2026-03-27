'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [myGroups, setMyGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Check platform admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      setIsAdmin(!!adminData)

      // Get customer record
      const { data: customer } = await supabase
        .from('customers')
        .select('id, name')
        .eq('auth_user_id', user.id)
        .single()

      if (customer) {
        // Get ALL groups this manager is in
        const { data: managers } = await supabase
          .from('tournament_managers')
          .select('*, auction_groups(*, tournament_config(name, season_year))')
          .eq('customer_id', customer.id)

        setMyGroups(managers || [])
      }

      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'setup':  return 'text-amber-400 bg-amber-400/10'
      case 'completed': return 'text-zinc-500 bg-zinc-800'
      default: return 'text-zinc-500 bg-zinc-800'
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 bg-amber-400 rotate-45 rounded-sm animate-pulse" />
    </div>
  )

  // Use first active group for top stats, or first group
  const primaryGroup = myGroups.find(g => g.auction_groups?.status === 'active') || myGroups[0]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-400 rotate-45 rounded-sm" />
            <span className="font-bold text-xl tracking-widest uppercase">Checkmate</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin"
                className="text-xs px-3 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 rounded-lg transition-colors font-medium">
                ⚙ Admin Panel
              </Link>
            )}
            <button onClick={handleLogout}
              className="text-zinc-500 hover:text-white text-sm transition-colors">
              Sign out →
            </button>
          </div>
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {primaryGroup?.manager_name || user?.email} 👋
          </h1>
          <p className="text-zinc-500">IPL 2026 — Your manager dashboard</p>
        </div>

        {/* No groups assigned */}
        {myGroups.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center mb-8">
            <p className="text-zinc-500 mb-2">You are not assigned to any auction group yet.</p>
            <p className="text-zinc-600 text-sm">Contact the admin to be added to an auction.</p>
          </div>
        )}

        {/* Single group — show stats */}
        {myGroups.length === 1 && primaryGroup && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Purse Remaining</p>
              <p className="text-amber-400 text-3xl font-bold">{primaryGroup.purse_remaining ?? '—'}</p>
              <p className="text-zinc-600 text-xs mt-1">points</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Purse Spent</p>
              <p className="text-white text-3xl font-bold">{primaryGroup.purse_spent ?? 0}</p>
              <p className="text-zinc-600 text-xs mt-1">points</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Total Points</p>
              <p className="text-white text-3xl font-bold">0</p>
              <p className="text-zinc-600 text-xs mt-1">season points</p>
            </div>
          </div>
        )}

        {/* Multiple groups — show auction cards */}
        {myGroups.length > 1 && (
          <div className="mb-8">
            <h2 className="text-white font-semibold mb-4">Your Auctions</h2>
            <div className="grid grid-cols-2 gap-4">
              {myGroups.map((mgr) => (
                <div key={mgr.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-medium">{mgr.auction_groups?.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {mgr.auction_groups?.tournament_config?.name}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(mgr.auction_groups?.status)}`}>
                      {mgr.auction_groups?.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-3">
                    <span className="text-zinc-500">Purse: <span className="text-amber-400 font-bold">{mgr.purse_remaining} pts</span></span>
                    <span className="text-zinc-500">Spent: {mgr.purse_spent || 0}</span>
                  </div>
                  <Link
                    href={`/auction/${mgr.auction_group_id}`}
                    className="block w-full text-center bg-amber-400 hover:bg-amber-300 text-black font-semibold py-2 rounded-lg text-sm transition-colors"
                  >
                    Enter Auction →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 gap-4">

          {/* Auction — single group */}
          {myGroups.length === 1 && (
            <Link
              href={`/auction/${primaryGroup?.auction_group_id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 transition-colors"
            >
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Auction</p>
              <p className="text-white font-semibold text-lg">Live Auction Room</p>
              <p className="text-zinc-500 text-sm mt-1">Bid on players and build your squad</p>
            </Link>
          )}

          {/* Auction — no group */}
          {myGroups.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 opacity-50">
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Auction</p>
              <p className="text-white font-semibold text-lg">Live Auction Room</p>
              <p className="text-zinc-500 text-sm mt-1">Not assigned to any auction</p>
            </div>
          )}

          {/* Squad */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 cursor-pointer transition-colors">
            <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Squad</p>
            <p className="text-white font-semibold text-lg">My Team</p>
            <p className="text-zinc-500 text-sm mt-1">View your purchased players</p>
          </div>

          {/* Leaderboard */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 cursor-pointer transition-colors">
            <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Standings</p>
            <p className="text-white font-semibold text-lg">Leaderboard</p>
            <p className="text-zinc-500 text-sm mt-1">See where you rank among managers</p>
          </div>

          {/* Predictions */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-6 cursor-pointer transition-colors">
            <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Predictions</p>
            <p className="text-white font-semibold text-lg">My Predictions</p>
            <p className="text-zinc-500 text-sm mt-1">Submit and track your predictions</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-8">
          Powered by{' '}
          <a href="https://nbbluestudios.com" target="_blank" className="hover:text-zinc-500 transition-colors">
            NB Blue Studios
          </a>
        </p>
      </div>
    </div>
  )
}
