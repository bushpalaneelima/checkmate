'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await supabase
        .from('auction_groups')
        .select('*, tournament_config(name, season_year)')
        .order('created_at', { ascending: false })
      setGroups(data || [])
      setLoading(false)
    }
    fetchGroups()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Auction Groups</h1>
          <p className="text-zinc-500 text-sm">Manage all fantasy auction groups</p>
        </div>
        <Link
          href="/admin/groups/new"
          className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          + New Group
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-600">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500 mb-3">No auction groups yet</p>
          <Link href="/admin/groups/new" className="text-amber-400 hover:text-amber-300 text-sm">
            Create your first group →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/admin/groups/${group.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-xl p-6 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{group.name}</h3>
                  <p className="text-zinc-500 text-xs mt-1">
                    {group.tournament_config?.name} {group.tournament_config?.season_year}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  group.status === 'active' ? 'text-green-400 bg-green-400/10' :
                  group.status === 'setup' ? 'text-amber-400 bg-amber-400/10' :
                  'text-zinc-400 bg-zinc-800'
                }`}>
                  {group.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-zinc-600 text-xs">Max Managers</p>
                  <p className="text-white text-sm font-medium">{group.max_managers}</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">Purse</p>
                  <p className="text-amber-400 text-sm font-medium">{group.purse_per_manager} pts</p>
                </div>
                <div>
                  <p className="text-zinc-600 text-xs">Auction Date</p>
                  <p className="text-white text-sm font-medium">
                    {group.auction_date
                      ? new Date(group.auction_date).toLocaleDateString('en-IN')
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-zinc-600 group-hover:text-amber-400 text-xs transition-colors">
                  Manage →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}