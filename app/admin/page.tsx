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
        supabase.from('auction_groups').select('*, tournament_config(name, season_year)').order('created_at', { ascending: false }),
        supabase.from('players').select('id', { count: 'exact' }),
      ])

      setStats({
        totalCustomers: customers.count || 0,
        totalGroups: groupsData.data?.length || 0,
        activeGroups: groupsData.data?.filter(g => g.status === 'active').length || 0,
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold mb-1">Admin Overview</h1>
        <p className="text-zinc-500 text-sm">Manage tournaments, groups and players</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Customers', value: stats.totalCustomers, color: 'text-amber-400' },
          { label: 'Total Groups', value: stats.totalGroups, color: 'text-white' },
          { label: 'Active Groups', value: stats.activeGroups, color: 'text-green-400' },
          { label: 'Players in DB', value: stats.totalPlayers, color: 'text-white' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Link href="/admin/groups/new" className="bg-amber-400 hover:bg-amber-300 text-black rounded-xl p-5 transition-colors group">
          <p className="font-bold text-sm mb-1">+ New Auction Group</p>
          <p className="text-black/60 text-xs">Create a new fantasy group</p>
        </Link>
        <Link href="/admin/customers/new" className="bg-zinc-900 hover:border-amber-400/50 border border-zinc-800 text-white rounded-xl p-5 transition-colors">
          <p className="font-bold text-sm mb-1">+ Add Customer</p>
          <p className="text-zinc-500 text-xs">Add a new customer account</p>
        </Link>
        <Link href="/admin/players" className="bg-zinc-900 hover:border-amber-400/50 border border-zinc-800 text-white rounded-xl p-5 transition-colors">
          <p className="font-bold text-sm mb-1">↑ Upload Players</p>
          <p className="text-zinc-500 text-xs">Upload player CSV for auction</p>
        </Link>
      </div>

      {/* Groups List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Auction Groups</h2>
          <Link href="/admin/groups" className="text-amber-400 text-xs hover:text-amber-300 transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-zinc-600 text-sm">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center">
            <p className="text-zinc-500 text-sm mb-3">No auction groups yet</p>
            <Link href="/admin/groups/new" className="text-amber-400 text-sm hover:text-amber-300">
              Create your first group →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/admin/groups/${group.id}`}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{group.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {group.tournament_config?.name} · {group.max_managers} managers · {group.purse_per_manager} pts purse
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {group.auction_date && (
                    <p className="text-zinc-500 text-xs">
                      {new Date(group.auction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(group.status)}`}>
                    {group.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
