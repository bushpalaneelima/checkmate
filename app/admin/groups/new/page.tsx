'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Basic Info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [auctionDate, setAuctionDate] = useState('')

  // Manager Settings
  const [maxManagers, setMaxManagers] = useState(11)
  const [minManagers, setMinManagers] = useState(4)
  const [purse, setPurse] = useState(1000)
  const [adminCanPlay, setAdminCanPlay] = useState(true)

  // Player Classes
  const [usePlatinum, setUsePlatinum] = useState(true)
  const [platinumCount, setPlatinumCount] = useState(30)
  const [platinumPrice, setPlatinumPrice] = useState(120)

  const [useGold, setUseGold] = useState(true)
  const [goldCount, setGoldCount] = useState(60)
  const [goldPrice, setGoldPrice] = useState(60)

  const [useSilver, setUseSilver] = useState(true)
  const [silverCount, setSilverCount] = useState(80)
  const [silverPrice, setSilverPrice] = useState(30)

  const [useBronze, setUseBronze] = useState(true)
  const [bronzeCount, setBronzeCount] = useState(80)
  const [bronzePrice, setBronzePrice] = useState(15)

  // Squad Composition
  const [minSquad, setMinSquad] = useState(11)
  const [maxSquad, setMaxSquad] = useState(25)
  const [minIndian, setMinIndian] = useState(7)
  const [maxForeign, setMaxForeign] = useState(8)
  const [minBatters, setMinBatters] = useState(3)
  const [minBowlers, setMinBowlers] = useState(3)
  const [minAllrounders, setMinAllrounders] = useState(2)
  const [minWicketkeepers, setMinWicketkeepers] = useState(1)

  // Power Player Settings
  const [ppMultiplier, setPpMultiplier] = useState(2.0)
  const [maxPP, setMaxPP] = useState(4)
  const [ppCategories, setPpCategories] = useState({
    batter: true,
    bowler: true,
    allrounder: true,
    wicketkeeper: true,
  })

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: tournament } = await supabase
      .from('tournament_config')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!tournament) {
      setError('No active tournament found.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('auth_user_id', user?.id)
      .single()

    const selectedCategories = Object.entries(ppCategories)
      .filter(([, v]) => v)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(',')

    const { data, error } = await supabase
      .from('auction_groups')
      .insert({
        tournament_id: tournament.id,
        created_by: admin?.id,
        name,
        description,
        auction_date: auctionDate ? new Date(auctionDate).toISOString() : null,
        // Manager settings
        max_managers: maxManagers,
        min_managers: minManagers,
        purse_per_manager: purse,
        admin_can_play: adminCanPlay,
        // Player classes
        use_platinum: usePlatinum,
        platinum_count: usePlatinum ? platinumCount : 0,
        platinum_base_price: platinumPrice,
        use_gold: useGold,
        gold_count: useGold ? goldCount : 0,
        gold_base_price: goldPrice,
        use_silver: useSilver,
        silver_count: useSilver ? silverCount : 0,
        silver_base_price: silverPrice,
        use_bronze: useBronze,
        bronze_count: useBronze ? bronzeCount : 0,
        bronze_base_price: bronzePrice,
        player_pool_size:
          (usePlatinum ? platinumCount : 0) +
          (useGold ? goldCount : 0) +
          (useSilver ? silverCount : 0) +
          (useBronze ? bronzeCount : 0),
        // Squad composition
        min_squad_size: minSquad,
        max_squad_size: maxSquad,
        min_indian_players: minIndian,
        max_foreign_players: maxForeign,
        min_batters: minBatters,
        min_bowlers: minBowlers,
        min_allrounders: minAllrounders,
        min_wicketkeepers: minWicketkeepers,
        // Power player
        pp_multiplier: ppMultiplier,
        max_pp_per_manager: maxPP,
        pp_categories: selectedCategories,
        pp_multiplier_options: '1.5,2,2.5,3',
        status: 'setup',
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/admin/groups/${data.id}/managers`)
  }

  return (
    <div className="max-w-2xl pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/groups" className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Groups
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-2xl font-bold text-white">New Auction Group</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Basic Information</h2>
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Group Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. BUPA Group IPL 2026" className={inputClass} />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Auction Date & Time</label>
            <input type="datetime-local" value={auctionDate} onChange={e => setAuctionDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* Manager Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Manager Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Max Managers</label>
              <input type="number" value={maxManagers} onChange={e => setMaxManagers(parseInt(e.target.value) || 0)} className={inputClass} min={1} />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Min Managers to Start</label>
              <input type="number" value={minManagers} onChange={e => setMinManagers(parseInt(e.target.value) || 0)} className={inputClass} min={1} />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Purse Per Manager (pts)</label>
              <input type="number" value={purse} onChange={e => setPurse(parseInt(e.target.value) || 0)} className={inputClass} min={1} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={adminCanPlay} onChange={e => setAdminCanPlay(e.target.checked)} className="w-4 h-4 accent-amber-400" />
            <label className="text-zinc-400 text-sm">Admins can participate as managers in this group</label>
          </div>
        </div>

        {/* Player Classes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Player Classes</h2>
          <p className="text-zinc-500 text-xs">Enable classes, set player count and base price for each</p>
          <div className="space-y-3">
            {[
              { label: 'Platinum', use: usePlatinum, setUse: setUsePlatinum, count: platinumCount, setCount: setPlatinumCount, price: platinumPrice, setPrice: setPlatinumPrice, defaultPrice: 120 },
              { label: 'Gold',     use: useGold,     setUse: setUseGold,     count: goldCount,     setCount: setGoldCount,     price: goldPrice,     setPrice: setGoldPrice,     defaultPrice: 60  },
              { label: 'Silver',   use: useSilver,   setUse: setUseSilver,   count: silverCount,   setCount: setSilverCount,   price: silverPrice,   setPrice: setSilverPrice,   defaultPrice: 30  },
              { label: 'Bronze',   use: useBronze,   setUse: setUseBronze,   count: bronzeCount,   setCount: setBronzeCount,   price: bronzePrice,   setPrice: setBronzePrice,   defaultPrice: 15  },
            ].map(({ label, use, setUse, count, setCount, price, setPrice, defaultPrice }) => (
              <div key={label} className={`rounded-xl border p-4 transition-colors ${use ? 'border-amber-500/30 bg-amber-400/5' : 'border-zinc-700 opacity-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <input type="checkbox" checked={use} onChange={e => setUse(e.target.checked)} className="w-4 h-4 accent-amber-400" />
                  <span className="text-white font-medium text-sm">{label}</span>
                  <span className="text-zinc-600 text-xs ml-auto">Default: {defaultPrice} pts</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">Number of players</label>
                    <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value) || 0)} disabled={!use} min={0} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 disabled:opacity-30" />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">Base price (pts)</label>
                    <input type="number" value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} disabled={!use} min={1} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-amber-400 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-30" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pool summary */}
          <div className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
            <span className="text-zinc-500 text-xs">Total player pool</span>
            <span className="text-white font-bold text-sm">
              {(usePlatinum ? platinumCount : 0) + (useGold ? goldCount : 0) + (useSilver ? silverCount : 0) + (useBronze ? bronzeCount : 0)} players
            </span>
          </div>
        </div>

        {/* Squad Composition */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Squad Rules</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Min Squad Size</label>
              <input type="number" value={minSquad} onChange={e => setMinSquad(parseInt(e.target.value) || 0)} className={inputClass} min={1} />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Max Squad Size</label>
              <input type="number" value={maxSquad} onChange={e => setMaxSquad(parseInt(e.target.value) || 0)} className={inputClass} min={1} />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Min Indian Players</label>
              <input type="number" value={minIndian} onChange={e => setMinIndian(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Max Foreign Players</label>
              <input type="number" value={maxForeign} onChange={e => setMaxForeign(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Minimum by Role</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-500 text-xs mb-2">Min Batters</label>
                <input type="number" value={minBatters} onChange={e => setMinBatters(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs mb-2">Min Bowlers</label>
                <input type="number" value={minBowlers} onChange={e => setMinBowlers(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs mb-2">Min All-rounders</label>
                <input type="number" value={minAllrounders} onChange={e => setMinAllrounders(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs mb-2">Min Wicket-keepers</label>
                <input type="number" value={minWicketkeepers} onChange={e => setMinWicketkeepers(parseInt(e.target.value) || 0)} className={inputClass} min={0} />
              </div>
            </div>
          </div>
        </div>

        {/* Power Player Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Power Player Settings</h2>
          <p className="text-zinc-500 text-xs">Nominated players receive a points multiplier for the season</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Multiplier</label>
              <select
                value={ppMultiplier}
                onChange={e => setPpMultiplier(parseFloat(e.target.value))}
                className={inputClass}
              >
                <option value={1.5}>1.5×</option>
                <option value={2}>2×</option>
                <option value={2.5}>2.5×</option>
                <option value={3}>3×</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Max PP Per Manager</label>
              <input type="number" value={maxPP} onChange={e => setMaxPP(parseInt(e.target.value) || 0)} className={inputClass} min={1} max={4} />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-3">PP Applies To</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'batter',       label: 'Batter' },
                { key: 'bowler',       label: 'Bowler' },
                { key: 'allrounder',   label: 'All-rounder' },
                { key: 'wicketkeeper', label: 'Wicket-keeper' },
              ].map(({ key, label }) => (
                <label key={key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  ppCategories[key as keyof typeof ppCategories]
                    ? 'border-amber-500/40 bg-amber-400/5'
                    : 'border-zinc-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={ppCategories[key as keyof typeof ppCategories]}
                    onChange={e => setPpCategories(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span className="text-white text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/50 text-black font-semibold rounded-lg py-3 text-sm transition-colors"
          >
            {loading ? 'Creating...' : 'Create Auction Group →'}
          </button>
          <Link href="/admin/groups" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
