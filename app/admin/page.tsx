'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalGroups: 0,
    activeGroups: 0,
    totalPlayers: 0,
  })

  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [customers, groupsData, players] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase
          .from('auction_groups')
          .select('*, tournament_config(name, season_year)')
          .order('created_at', { ascending: false }),
        supabase.from('players').select('id', { count: 'exact' }),
      ])

      setStats({
        totalCustomers: customers.count || 0,
        totalGroups: groupsData.data?.length || 0,
        activeGroups:
          groupsData.data?.filter((g) => g.status === 'active').length || 0,
        totalPlayers: players.count || 0,
      })

      setGroups(groupsData.data || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      setup: 'text-zinc-400 bg-zinc-800',
      voting: 'text-blue-400 bg-blue-400/10',
      frozen: 'text-orange-400 bg-orange-400/10',
      active: 'text-green-400 bg-green-400/10',
      completed: 'text-zinc-600 bg-zinc-800',
    }

    return map[status] || 'text-zinc-400 bg-zinc-800'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Header */}
      <nav className="relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/game-of-gambits-icon.svg"
            alt="Game of Gambits"
            className="h-8 w-8"
          />

          <span className="font-black tracking-wide text-white text-base">
            GAME OF <span className="text-amber-400">GAMBITS</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Manager Dashboard
          </Link>

          <span className="text-xs px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full font-medium">
            Admin
          </span>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-4">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">
              Administration
            </span>
          </div>

          <h1 className="text-white text-3xl md:text-4xl font-black mb-2">
            Admin Overview
          </h1>

          <p className="text-zinc-500 text-sm">
            Manage Game of Gambits sessions, groups, customers and players
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Customers',
              value: stats.totalCustomers,
              color: 'text-amber-400',
            },
            {
              label: 'Total Groups',
              value: stats.totalGroups,
              color: 'text-white',
            },
            {
              label: 'Active Groups',
              value: stats.activeGroups,
              color: 'text-green-400',
            },
            {
              label: 'Players in DB',
              value: stats.totalPlayers,
              color: 'text-white',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">
                {stat.label}
              </p>

              <p className={`text-3xl font-black ${stat.color}`}>
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link
            href="/admin/groups/new"
            className="bg-amber-400 hover:bg-amber-300 text-black rounded-2xl p-5 transition-colors"
          >
            <p className="font-bold text-sm mb-1">
              + New Auction Group
            </p>

            <p className="text-black/60 text-xs">
              Create a new Game of Gambits group
            </p>
          </Link>

          <Link
            href="/admin/customers/new"
            className="bg-zinc-900 hover:border-amber-400/50 border border-zinc-800 text-white rounded-2xl p-5 transition-colors"
          >
            <p className="font-bold text-sm mb-1">
              + Add Customer
            </p>

            <p className="text-zinc-500 text-xs">
              Add a new customer account
            </p>
          </Link>

          <Link
            href="/admin/players"
            className="bg-zinc-900 hover:border-amber-400/50 border border-zinc-800 text-white rounded-2xl p-5 transition-colors"
          >
            <p className="font-bold text-sm mb-1">
              ↑ Upload Players
            </p>

            <p className="text-zinc-500 text-xs">
              Upload player data for a Game of Gambits session
            </p>
          </Link>
        </div>

        {/* Groups List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">
                Sessions
              </p>

              <h2 className="text-white font-bold text-xl">
                Auction Groups
              </h2>
            </div>

            <Link
              href="/admin/groups"
              className="text-amber-400 text-xs hover:text-amber-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="text-zinc-600 text-sm">
              Loading...
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-8 text-center">
              <p className="text-zinc-500 text-sm mb-3">
                No auction groups yet
              </p>

              <Link
                href="/admin/groups/new"
                className="text-amber-400 text-sm hover:text-amber-300"
              >
                Create your first group →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/admin/groups/${group.id}`}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-5 transition-colors"
                >
                  <div>
                    <p className="text-white font-bold">
                      {group.name}
                    </p>

                    <p className="text-zinc-500 text-xs mt-0.5">
                      {group.tournament_config?.name}
                      {group.tournament_config?.season_year
                        ? ` ${group.tournament_config.season_year}`
                        : ''}
                      {' · '}
                      {group.max_managers} managers
                      {' · '}
                      {group.purse_per_manager} pts purse
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {group.auction_date && (
                      <p className="text-zinc-500 text-xs">
                        {new Date(
                          group.auction_date
                        ).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    )}

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(
                        group.status
                      )}`}
                    >
                      {group.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-zinc-800 px-6 py-8 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/game-of-gambits-icon.svg"
              alt=""
              className="h-6 w-6"
            />

            <span className="font-bold tracking-wide text-zinc-300 text-sm">
              GAME OF <span className="text-amber-400">GAMBITS</span>
            </span>
          </div>

          <p className="text-zinc-600 text-sm">
            Developed by{' '}
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
      </footer>
    </div>
  )
}