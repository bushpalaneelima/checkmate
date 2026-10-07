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
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'setup': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
      default: return 'text-zinc-500 bg-zinc-800 border-zinc-700'
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <img
        src="/game-of-gambits-icon.svg"
        alt="Loading"
        className="h-12 w-12 animate-pulse"
      />
    </div>
  )

  // Use first active group for top stats, or first group
  const primaryGroup = myGroups.find(g => g.auction_groups?.status === 'active') || myGroups[0]
  const tournament = primaryGroup?.auction_groups?.tournament_config
  const subtitle = tournament?.name
    ? `${tournament.name}${tournament.season_year ? ` ${tournament.season_year}` : ''} — Your manager dashboard`
    : 'Your manager dashboard'

  const cardBase = 'bg-zinc-900 border border-zinc-800 rounded-2xl p-6'
  const cardHover = 'hover:border-amber-500/30 transition-colors'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Nav — matches home page */}
      <nav className="relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/game-of-gambits-icon.svg" alt="" className="h-8 w-8" />
          <span className="font-black tracking-wide text-white text-base">
            GAME OF <span className="text-amber-400">GAMBITS</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-xs px-3 py-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 text-amber-400 rounded-lg transition-colors font-medium"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Sign out →
          </button>
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">
              Manager Dashboard
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Welcome, {primaryGroup?.manager_name || user?.email}
          </h1>
          <p className="text-zinc-500">{subtitle}</p>
        </div>

        {/* No groups assigned */}
        {myGroups.length === 0 && (
          <div className={`${cardBase} p-8 text-center mb-8`}>
            <p className="text-zinc-400 mb-2">You are not assigned to any auction group yet.</p>
            <p className="text-zinc-600 text-sm">Contact the admin to be added to an auction.</p>
          </div>
        )}

        {/* Single group — show stats */}
        {myGroups.length === 1 && primaryGroup && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Purse Remaining', value: primaryGroup.purse_remaining ?? '—', unit: 'points', accent: true },
              { label: 'Purse Spent', value: primaryGroup.purse_spent ?? 0, unit: 'points' },
              { label: 'Total Points', value: 0, unit: 'season points' },
            ].map((stat) => (
              <div key={stat.label} className={cardBase}>
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.accent ? 'text-amber-400' : 'text-white'}`}>
                  {stat.value}
                </p>
                <p className="text-zinc-600 text-xs mt-1">{stat.unit}</p>
              </div>
            ))}
          </div>
        )}

        {/* Multiple groups — show auction cards */}
        {myGroups.length > 1 && (
          <div className="mb-10">
            <h2 className="text-xl font-black mb-4">Your Auctions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGroups.map((mgr) => (
                <div key={mgr.id} className={`${cardBase} ${cardHover} p-5`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white font-bold">{mgr.auction_groups?.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {mgr.auction_groups?.tournament_config?.name}
                      </p>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize ${getStatusColor(mgr.auction_groups?.status)}`}>
                      {mgr.auction_groups?.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-zinc-500">
                      Purse: <span className="text-amber-400 font-bold">{mgr.purse_remaining} pts</span>
                    </span>
                    <span className="text-zinc-500">Spent: {mgr.purse_spent || 0}</span>
                  </div>
                  <Link
                    href={`/auction/${mgr.auction_group_id}`}
                    className="block w-full text-center bg-amber-400 hover:bg-amber-300 text-black font-bold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Enter Auction →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Auction — single group */}
          {myGroups.length === 1 && (
            <Link
              href={`/auction/${primaryGroup?.auction_group_id}`}
              className={`${cardBase} ${cardHover} group`}
            >
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Auction</p>
              <p className="text-white font-bold text-lg">Live Auction Room</p>
              <p className="text-zinc-500 text-sm mt-1">Bid on players and build your squad</p>
              <p className="text-amber-400 text-sm font-semibold mt-4 group-hover:translate-x-1 transition-transform">
                Enter →
              </p>
            </Link>
          )}

          {/* Auction — no group */}
          {myGroups.length === 0 && (
            <div className={`${cardBase} opacity-50`}>
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">Auction</p>
              <p className="text-white font-bold text-lg">Live Auction Room</p>
              <p className="text-zinc-500 text-sm mt-1">Not assigned to any auction</p>
            </div>
          )}

          {[
            { tag: 'Squad', title: 'My Team', desc: 'View your purchased players' },
            { tag: 'Standings', title: 'Leaderboard', desc: 'See where you rank among managers' },
            { tag: 'Predictions', title: 'My Predictions', desc: 'Submit and track your predictions' },
          ].map((card) => (
            <div key={card.tag} className={`${cardBase} relative`}>
              <span className="absolute top-5 right-5 text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-700 rounded-full px-2 py-0.5">
                Coming soon
              </span>
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-2">{card.tag}</p>
              <p className="text-white font-bold text-lg">{card.title}</p>
              <p className="text-zinc-500 text-sm mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer — matches home page */}
      <footer className="relative border-t border-zinc-800 px-6 py-8 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/game-of-gambits-icon.svg" alt="" className="h-6 w-6" />
            <span className="font-bold tracking-wide text-zinc-300 text-sm">
              GAME OF <span className="text-amber-400">GAMBITS</span>
            </span>
          </div>
          <p className="text-zinc-600 text-sm">
            Powered by{' '}
            <a
              href="https://nbbluestudios.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              NB Blue Studios
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
