'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function GroupDetailPage() {
  const { id } = useParams()
  const [group, setGroup] = useState<any>(null)
  const [managers, setManagers] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const groupId = Array.isArray(id) ? id[0] : id
      const [groupRes, managersRes, playersRes] = await Promise.all([
        supabase.from('auction_groups').select('*').eq('id', groupId).single(),
        supabase.from('tournament_managers').select('*, customers(name, email)').eq('auction_group_id', groupId),
        supabase.from('group_player_pool').select('player_id').eq('auction_group_id', groupId),
      ])
      setGroup(groupRes.data)
      console.log('managers data:', managersRes.data, 'error:', managersRes.error)
setManagers(managersRes.data || [])
      setPlayers(playersRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  
  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'setup': return 'text-amber-400 bg-amber-400/10'
      case 'completed': return 'text-zinc-400 bg-zinc-800'
      case 'frozen': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-zinc-400 bg-zinc-800'
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Assign Managers',
      description: 'Select which customers play in this group',
      href: `/admin/groups/${id}/managers`,
      done: managers.length >= (group?.min_managers || 4),
      detail: `${managers.length}/${group?.max_managers} managers`,
    },
    {
      number: 2,
      title: 'Set Up Player Pool',
      description: 'Assign players from the master list to this group',
      href: `/admin/groups/${id}/players`,
      done: players.length > 0,
      detail: `${players.length} players`,
    },
    {
      number: 3,
      title: 'Configure Rules',
      description: 'Customise scoring rules for this group',
      href: `/admin/groups/${id}/rules`,
      done: false,
      detail: 'Using default IPL 2026 rules',
    },
    {
      number: 4,
      title: 'Start Auction',
      description: 'Freeze rules and launch the live auction room',
      href: `/admin/groups/${id}/auction`,
      done: group?.status === 'active' || group?.status === 'completed',
      detail: group?.auction_date
        ? `Scheduled: ${new Date(group.auction_date).toLocaleString('en-IN')}`
        : 'No date set',
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-zinc-500 animate-pulse">Loading...</p>
    </div>
  )

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/groups" className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Groups
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-white text-sm">{group?.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{group?.name}</h1>
          {group?.description && (
            <p className="text-zinc-500 text-sm mb-3">{group.description}</p>
          )}
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(group?.status)}`}>
            {group?.status}
          </span>
        </div>

        {group?.status === 'setup' && (
          <Link
            href={`/auction/${id}`}
            className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            Launch Auction →
          </Link>
        )}
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Managers', value: managers.length, max: group?.max_managers },
          { label: 'Purse Each', value: `${group?.purse_per_manager} pts`, max: null },
          { label: 'Players', value: players.length, max: group?.player_pool_size },
          { label: 'Buy-in', value: `₹${group?.buyin_amount}`, max: null },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-white font-bold">
              {stat.value}
              {stat.max && <span className="text-zinc-600 font-normal text-xs"> /{stat.max}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Setup Steps */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-white font-semibold">Setup Checklist</h2>
          <p className="text-zinc-500 text-xs mt-1">Complete these steps before launching the auction</p>
        </div>
        <div className="divide-y divide-zinc-800">
          {steps.map((step) => (
            <Link
              key={step.number}
              href={step.href}
              className="flex items-center gap-4 p-5 hover:bg-zinc-800/50 transition-colors group"
            >
              {/* Step indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                step.done
                  ? 'bg-green-400/20 text-green-400'
                  : 'bg-zinc-800 text-zinc-500'
              }`}>
                {step.done ? '✓' : step.number}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`text-sm font-medium ${step.done ? 'text-white' : 'text-zinc-300'}`}>
                  {step.title}
                </p>
                <p className="text-zinc-600 text-xs mt-0.5">{step.description}</p>
              </div>

              {/* Detail + arrow */}
              <div className="text-right">
                <p className="text-zinc-500 text-xs">{step.detail}</p>
                <p className="text-zinc-700 group-hover:text-amber-400 text-xs mt-0.5 transition-colors">→</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Classes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Player Classes</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { class: 'Platinum', count: group?.platinum_count, active: group?.use_platinum, price: 120 },
            { class: 'Gold', count: group?.gold_count, active: group?.use_gold, price: 60 },
            { class: 'Silver', count: group?.silver_count, active: group?.use_silver, price: 30 },
            { class: 'Bronze', count: group?.bronze_count, active: group?.use_bronze, price: 15 },
          ].map((cls) => (
            <div key={cls.class} className={`rounded-lg p-3 border ${
              cls.active
                ? 'border-amber-500/30 bg-amber-400/5'
                : 'border-zinc-800 bg-zinc-800/50 opacity-40'
            }`}>
              <p className="text-white text-sm font-medium">{cls.class}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{cls.count} players</p>
              <p className="text-amber-400 text-xs mt-1">{cls.price} pts base</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
