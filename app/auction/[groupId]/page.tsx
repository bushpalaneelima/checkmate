'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Helpers (outside component so no dependency issues) ────
const getMinBid = (currentBid: number, basePrice: number, grp: any) => {
  if (currentBid === 0) return basePrice
  if (currentBid < 20)  return currentBid + 5
  if (currentBid < 150) return currentBid + 10
  if (currentBid < 250) return currentBid + 20
  return currentBid + 30
}

const getAvailablePurse = (manager: any, group: any) => {
  if (!manager || !group) return 0
  const squad = manager.squad || []
  const batters = squad.filter((s: any) => s.players?.category === 'Batter').length
  const bowlers = squad.filter((s: any) => s.players?.category === 'Bowler').length
  const ar      = squad.filter((s: any) => s.players?.category === 'All-rounder').length
  const wk      = squad.filter((s: any) => s.players?.category === 'Wicket-keeper').length
  const needed  = Math.max(0, (group.min_batters||3) - batters)
                + Math.max(0, (group.min_bowlers||3) - bowlers)
                + Math.max(0, (group.min_allrounders||2) - ar)
                + Math.max(0, (group.min_wicketkeepers||1) - wk)
  const cheapest = Math.min(
    group.use_bronze ? (group.bronze_base_price||15) : 9999,
    group.use_silver ? (group.silver_base_price||30) : 9999,
  )
  const reserved = needed > 1 ? (needed - 1) * cheapest : 0
  return Math.max(0, manager.purse_remaining - reserved)
}

const getSquadStats = (manager: any) => {
  const squad = manager?.squad || []
  return {
    batters: squad.filter((s: any) => s.players?.category === 'Batter').length,
    bowlers: squad.filter((s: any) => s.players?.category === 'Bowler').length,
    ar:      squad.filter((s: any) => s.players?.category === 'All-rounder').length,
    wk:      squad.filter((s: any) => s.players?.category === 'Wicket-keeper').length,
  }
}

export default function AuctionRoomPage() {
  const { groupId } = useParams()
  const router = useRouter()
  const gId = Array.isArray(groupId) ? groupId[0] : groupId

  const [group, setGroup] = useState<any>(null)
  const [auctionState, setAuctionState] = useState<any>(null)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [managers, setManagers] = useState<any[]>([])
  const [soldPlayers, setSoldPlayers] = useState<any[]>([])
  const [myManagerId, setMyManagerId] = useState<string | null>(null)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const [isDriverOrAdmin, setIsDriverOrAdmin] = useState(false)
  const [bidAmount, setBidAmount] = useState(0)
  const [timer, setTimer] = useState(30)
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState(false)
  const timerRef = useRef<any>(null)

  // Derive myManager from managers list — always in sync, no separate state
  const myManager = managers.find(m => m.id === myManagerId) ?? null

  // ── Fetch all data ────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const [groupRes, stateRes, managersRes, squadsRes] = await Promise.all([
      supabase.from('auction_groups').select('*').eq('id', gId).single(),
      supabase.from('auction_state').select('*').eq('auction_group_id', gId).single(),
      supabase.from('tournament_managers')
        .select('id, manager_name, role, purse_remaining, purse_spent, customer_id')
        .eq('auction_group_id', gId),
      supabase.from('squads')
      .select('*, players!squads_player_id_fkey(name, category)')
      .eq('auction_group_id', gId),
    ])

    setGroup(groupRes.data)

    if (stateRes.data) {
      setAuctionState(stateRes.data)
      if (stateRes.data.current_player_id) {
        const { data: player } = await supabase
          .from('players').select('*').eq('id', stateRes.data.current_player_id).single()
        setCurrentPlayer(player)
        setBidAmount(getMinBid(stateRes.data.current_bid_amount || 0, player?.base_price || 15, groupRes.data))
      }
    }

    const withSquads = (managersRes.data || []).map(m => ({
      ...m,
      squad: (squadsRes.data || []).filter(s =>
        s.manager_id === m.id || s.tournament_manager_id === m.id
      )
    }))
    setManagers(withSquads)
        
    const sold = (squadsRes.data || []).map(s => ({
      player: s.players,
      manager: managersRes.data?.find(m => m.id === s.manager_id || m.id === s.tournament_manager_id),
      price: s.price_paid,
    }))
    setSoldPlayers(sold)
  }, [gId])

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: adminData } = await supabase
        .from('admins').select('id').eq('auth_user_id', user.id).single()
      setIsPlatformAdmin(!!adminData)

      const { data: customer } = await supabase
        .from('customers').select('id').eq('auth_user_id', user.id).single()

      if (customer) {
        const { data: mgr } = await supabase
          .from('tournament_managers')
          .select('*')
          .eq('auction_group_id', gId)
          .eq('customer_id', customer.id)
          .single()

        if (mgr) {
          setMyManagerId(mgr.id)
          setIsDriverOrAdmin(
            !!adminData ||
            mgr.role === 'auction_driver' ||
            mgr.role === 'admin'
          )
        } else {
          // Platform admin not in this auction as a manager — can still drive
          setIsDriverOrAdmin(!!adminData)
        }
      } else {
        setIsDriverOrAdmin(!!adminData)
      }

      await fetchAll()
      setLoading(false)
    }
    init()
  }, [gId])

  // ── Realtime ──────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`auction_room_${gId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'auction_state',
        filter: `auction_group_id=eq.${gId}`
      }, () => fetchAll())
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tournament_managers',
      }, () => fetchAll())
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'squads',
      }, () => fetchAll())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gId, fetchAll])

  // ── Advance auction (RPC) ─────────────────────────────────
  const handleAdvanceAuction = useCallback(async () => {
    if (!isDriverOrAdmin || !auctionState) return
    if (auctionState.status !== 'active') return

    const { error } = await supabase.rpc('advance_auction', { p_group_id: gId })
    if (error) {
      console.error('advance_auction error:', JSON.stringify(error, null, 2))
    } else {
      await fetchAll()
    }
  }, [isDriverOrAdmin, auctionState, gId, fetchAll])

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!auctionState || auctionState.status !== 'active') return

    const startTime = auctionState.timer_started_at
      ? new Date(auctionState.timer_started_at).getTime()
      : Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = Math.max(0, 30 - elapsed)
      setTimer(remaining)
      if (remaining === 0 && isDriverOrAdmin) {
        clearInterval(timerRef.current)
        handleAdvanceAuction()
      }
    }, 500)

    return () => clearInterval(timerRef.current)
  }, [auctionState?.timer_started_at, auctionState?.status, isDriverOrAdmin, handleAdvanceAuction])

  // ── Auction actions ───────────────────────────────────────
  const handleStartAuction = async () => {
    const { data: poolData } = await supabase
      .from('group_player_pool')
      .select('player_id, players(id, name, class, category)')
      .eq('auction_group_id', gId)

    if (!poolData?.length) { alert('No players in pool!'); return }

    const platinum = poolData.filter((p: any) => p.players?.class === 'Platinum').sort(() => Math.random() - 0.5)
    const gold     = poolData.filter((p: any) => p.players?.class === 'Gold')
    const silver   = poolData.filter((p: any) => p.players?.class === 'Silver')
    const bronze   = poolData.filter((p: any) => p.players?.class === 'Bronze')
    const playerIds = [...platinum, ...gold, ...silver, ...bronze].map((p: any) => p.player_id)

    await supabase.from('auction_groups').update({
      auction_status: 'active', status: 'active', rules_frozen: true
    }).eq('id', gId)

    await supabase.from('auction_state').upsert({
      auction_group_id: gId,
      status: 'active',
      current_player_id: playerIds[0],
      current_bid_amount: 0,
      current_bidder_id: null,
      timer_seconds: 30,
      timer_started_at: new Date().toISOString(),
      auction_round: 1,
      player_order: playerIds,
      sold_count: 0,
      unsold_count: 0,
      is_frozen: false,
    }, { onConflict: 'auction_group_id' })

    fetchAll()
  }

  const handleBid = async () => {
    if (!myManager || !auctionState || bidding) return
    if (auctionState.status !== 'active' || auctionState.is_frozen) return

    const available = getAvailablePurse(myManager, group)
    if (bidAmount > myManager.purse_remaining) { alert('Insufficient purse!'); return }
    if (bidAmount > available) {
      alert(`Max available bid: ${available} pts (reserving pts for mandatory players)`); return
    }

    const minBid = getMinBid(auctionState.current_bid_amount || 0, currentPlayer?.base_price || 15, group)
    if (bidAmount < minBid) { alert(`Minimum bid is ${minBid} pts`); return }

    setBidding(true)
    await supabase.from('auction_state').update({
      current_bid_amount: bidAmount,
      current_bidder_id: myManager.id,
      timer_seconds: 30,
      timer_started_at: new Date().toISOString(),
      is_frozen: true,
      freeze_until: new Date(Date.now() + 2000).toISOString(),
    }).eq('auction_group_id', gId)

    setTimeout(async () => {
      await supabase.from('auction_state').update({ is_frozen: false }).eq('auction_group_id', gId)
      setBidding(false)
    }, 2000)

    setTimer(30)
    fetchAll()
  }

  const handlePause = async () => {
    if (auctionState?.status === 'paused') {
      await supabase.from('auction_state').update({
        status: 'active',
        timer_started_at: new Date().toISOString(),
      }).eq('auction_group_id', gId)
    } else {
      await supabase.from('auction_state').update({
        status: 'paused',
      }).eq('auction_group_id', gId)
    }
    fetchAll()
  }

  const handleUnsold = async () => {
  await supabase.from('auction_state').update({
    current_bidder_id: null,
    current_bid_amount: 0,
  }).eq('auction_group_id', gId)

  const { error } = await supabase.rpc('advance_auction', { p_group_id: gId })
  if (error) console.error('unsold error:', JSON.stringify(error, null, 2))
  else await fetchAll()
}

const handleStartRound2 = async () => {
  // Get all unsold players
  const { data: unsoldPlayers } = await supabase
    .from('players')
    .select('id')
    .eq('tournament_id', group?.tournament_id)
    .eq('is_sold', false)
    .eq('is_available', true)

  if (!unsoldPlayers?.length) {
    alert('No unsold players for Round 2!')
    return
  }

  const playerIds = unsoldPlayers.map(p => p.id)

  await supabase.from('auction_state').update({
    status: 'active',
    auction_round: 2,
    current_player_id: playerIds[0],
    current_bid_amount: 0,
    current_bidder_id: null,
    timer_seconds: 30,
    timer_started_at: new Date().toISOString(),
    player_order: playerIds,
    is_frozen: false,
    last_processed_player: null,
  }).eq('auction_group_id', gId)

  fetchAll()
}

  // ── Loading ───────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 bg-amber-400 rotate-45 rounded-sm mx-auto mb-4 animate-pulse" />
        <p className="text-zinc-500 text-sm">Loading auction room...</p>
      </div>
    </div>
  )

  const stats = getSquadStats(myManager)
  const available = getAvailablePurse(myManager, group)
  const timerColor = timer > 15 ? 'bg-green-400' : timer > 8 ? 'bg-amber-400' : 'bg-red-400'
  const timerTextColor = timer > 15 ? 'text-green-400' : timer > 8 ? 'text-amber-400' : 'text-red-400'
  const leadingManager = managers.find(m => m.id === auctionState?.current_bidder_id)
  const isStarted = auctionState?.status && auctionState.status !== 'waiting'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Top Bar */}
      <div className="relative border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-amber-400 rotate-45 rounded-sm" />
          <span className="font-bold tracking-widest uppercase text-sm">Checkmate</span>
          <span className="text-zinc-600 text-xs">·</span>
          <span className="text-zinc-400 text-sm">{group?.name}</span>
        </div>
        <div className="flex items-center gap-4">
          {isStarted && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                auctionState?.status === 'active' ? 'bg-red-400 animate-pulse' :
                auctionState?.status === 'paused' ? 'bg-amber-400' : 'bg-zinc-600'
              }`} />
              <span className="text-xs text-zinc-400 capitalize">{auctionState?.status}</span>
            </div>
          )}
          {myManager && (
            <span className="text-xs text-zinc-500">
              {myManager.manager_name}
              <span className="ml-2 text-amber-400 font-medium">{myManager.purse_remaining} pts</span>
            </span>
          )}
          {isPlatformAdmin && (
            <Link href={`/admin/groups/${gId}`} className="text-zinc-600 hover:text-white text-xs transition-colors">
              Admin →
            </Link>
          )}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            className="text-zinc-600 hover:text-white text-xs transition-colors"
          >
            Sign out →
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="relative flex h-[calc(100vh-53px)]">

        {/* Left — My Stats */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col p-4 overflow-y-auto">
          {myManager ? (
            <>
              <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">My Purse</p>
                <p className="text-amber-400 text-3xl font-bold mb-1">{myManager.purse_remaining}</p>
                <p className="text-zinc-600 text-xs mb-2">pts remaining</p>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(myManager.purse_remaining / (group?.purse_per_manager || 1000)) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Available: <span className="text-white">{available} pts</span></span>
                  <span>Spent: {myManager.purse_spent || 0}</span>
                </div>
              </div>

              <div className="bg-zinc-900 rounded-xl p-4 mb-4">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Squad Requirements</p>
                <div className="space-y-2">
                  {[
                    { label: 'Batters',        have: stats.batters, need: group?.min_batters||3 },
                    { label: 'Bowlers',        have: stats.bowlers, need: group?.min_bowlers||3 },
                    { label: 'All-rounders',   have: stats.ar,      need: group?.min_allrounders||2 },
                    { label: 'Wicket-keepers', have: stats.wk,      need: group?.min_wicketkeepers||1 },
                  ].map(({ label, have, need }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-zinc-400 text-xs">{label}</span>
                      <span className={`text-xs font-medium ${have >= need ? 'text-green-400' : 'text-amber-400'}`}>
                        {have}/{need} {have >= need ? '✓' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Total squad</span>
                    <span className="text-white">{(myManager.squad||[]).length} players</span>
                  </div>
                </div>
              </div>

              {(myManager.squad||[]).length > 0 && (
                <div className="bg-zinc-900 rounded-xl p-4">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">My Squad</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(myManager.squad||[]).map((s: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-zinc-300 truncate">{s.players?.name}</span>
                        <span className="text-amber-400 ml-2 flex-shrink-0">{s.price_paid}p</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-600 text-sm">You are not a manager in this group</p>
            </div>
          )}
        </div>

        {/* Center — Main Auction */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">

          {/* NOT STARTED */}
          {!isStarted && (
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 bg-amber-400 rotate-45 rounded-sm" />
              </div>
              <h2 className="text-3xl font-bold mb-2">{group?.name}</h2>
              <p className="text-zinc-500 mb-1">{managers.length} managers · {group?.player_pool_size || 249} players</p>
              <p className="text-zinc-600 text-sm mb-8">
                {group?.auction_date
                  ? `Scheduled: ${new Date(group.auction_date).toLocaleString('en-IN')}`
                  : 'Auction date not set'}
              </p>
              {isDriverOrAdmin ? (
                <button onClick={handleStartAuction}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-colors">
                  🚀 Start Auction
                </button>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse mx-auto mb-3" />
                  <p className="text-zinc-400">Waiting for admin to start the auction...</p>
                </div>
              )}
            </div>
          )}

          {/* ROUND 1 COMPLETE */}
{auctionState?.status === 'round1_complete' && (
  <div className="text-center max-w-md">
    <p className="text-5xl mb-4">🏁</p>
    <h2 className="text-3xl font-bold mb-2">Round 1 Complete!</h2>
    <p className="text-zinc-500 mb-2">
      {auctionState.sold_count} sold · {auctionState.unsold_count} unsold
    </p>
    <p className="text-zinc-600 text-sm mb-8">
      Round 2 will auction all unsold players at base price
    </p>
    {isDriverOrAdmin && (
      <button
        onClick={handleStartRound2}
        className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-xl text-lg transition-colors"
      >
        🚀 Start Round 2
      </button>
    )}
    {!isDriverOrAdmin && (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse mx-auto mb-3" />
        <p className="text-zinc-400">Waiting for admin to start Round 2...</p>
      </div>
    )}
  </div>
)}

          {/* COMPLETED */}
          {auctionState?.status === 'completed' && (
            <div className="text-center">
              <p className="text-6xl mb-4">🏆</p>
              <h2 className="text-3xl font-bold mb-2">Auction Complete!</h2>
              <p className="text-zinc-500 mb-6">
                {auctionState.sold_count} sold · {auctionState.unsold_count} unsold
              </p>
              {isPlatformAdmin && (
                <Link href={`/admin/groups/${gId}`}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-8 py-3 rounded-xl transition-colors">
                  View Results →
                </Link>
              )}
            </div>
          )}

          {/* ACTIVE / PAUSED */}
          {(auctionState?.status === 'active' || auctionState?.status === 'paused') && currentPlayer && (
            <div className="w-full max-w-lg">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-4">

                {/* Player Card */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-400/20">
                    <span className="text-amber-400 text-3xl font-bold">{currentPlayer.name?.[0]}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-1">{currentPlayer.name}</h2>
                  <p className="text-zinc-400 text-sm mb-3">
                    {currentPlayer.ipl_team} · {currentPlayer.category} · {currentPlayer.country}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      currentPlayer.class === 'Platinum' ? 'bg-amber-400/20 text-amber-400' :
                      currentPlayer.class === 'Gold'     ? 'bg-yellow-400/20 text-yellow-400' :
                      currentPlayer.class === 'Silver'   ? 'bg-zinc-400/20 text-zinc-300' :
                      'bg-orange-400/20 text-orange-400'
                    }`}>{currentPlayer.class}</span>
                    <span className="text-zinc-600 text-xs">Base: {currentPlayer.base_price} pts</span>
                  </div>
                </div>

                {/* Bid Display */}
                <div className="bg-zinc-800 rounded-xl p-5 mb-5 text-center">
                  <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Current Bid</p>
                  <p className="text-5xl font-bold mb-1">
                    {auctionState.current_bid_amount || currentPlayer.base_price}
                    <span className="text-zinc-500 text-xl font-normal ml-1">pts</span>
                  </p>
                  {leadingManager ? (
                    <p className="text-amber-400 text-sm font-medium">
                      🏆 {leadingManager.manager_name} is leading
                    </p>
                  ) : (
                    <p className="text-zinc-600 text-sm">No bids yet</p>
                  )}
                </div>

                {/* Timer */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-zinc-500 text-xs">Time remaining</span>
                    <span className={`text-2xl font-bold ${timerTextColor}`}>{timer}s</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${timerColor}`}
                      style={{ width: `${(timer / 30) * 100}%` }} />
                  </div>
                  {auctionState.status === 'paused' && (
                    <p className="text-amber-400 text-xs text-center mt-2">⏸ Auction paused by admin</p>
                  )}
                </div>

                {/* Bid Input — managers only */}
                {myManager && auctionState.status === 'active' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBidAmount(prev =>
                          Math.max(getMinBid(auctionState.current_bid_amount||0, currentPlayer.base_price, group), prev - 10)
                        )}
                        className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-xl transition-colors"
                      >−</button>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={e => setBidAmount(parseInt(e.target.value) || 0)}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => setBidAmount(prev => prev + 10)}
                        className="w-12 h-12 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold text-xl transition-colors"
                      >+</button>
                    </div>
                    <p className="text-zinc-600 text-xs text-center">
                      Min: {getMinBid(auctionState.current_bid_amount||0, currentPlayer.base_price, group)} pts ·
                      Available: {available} pts
                    </p>
                    <button
                      onClick={handleBid}
                      disabled={bidding || auctionState.is_frozen || bidAmount > available}
                      className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl text-xl transition-colors"
                    >
                      {bidding ? '⏳ Processing...' :
                       auctionState.is_frozen ? '⏳ Freeze...' :
                       bidAmount > available ? '⛔ Exceeds available purse' :
                       `BID ${bidAmount} pts`}
                    </button>
                  </div>
                )}

                {/* Admin Controls */}
                {isDriverOrAdmin && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={handlePause}
                      className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm rounded-xl transition-colors">
                      {auctionState.status === 'paused' ? '▶ Resume' : '⏸ Pause'}
                    </button>
                    <button
                      onClick={handleAdvanceAuction}
                      disabled={!auctionState.current_bidder_id}
                      className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 disabled:opacity-30 text-sm rounded-xl transition-colors">
                      ✅ Sell
                    </button>
                    <button
                      onClick={handleUnsold}
                      className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm rounded-xl transition-colors">
                      ⏭ Unsold
                    </button>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="flex justify-center gap-6 text-xs text-zinc-500">
                <span>✅ {auctionState.sold_count||0} sold</span>
                <span>❌ {auctionState.unsold_count||0} unsold</span>
                <span>⏳ {(auctionState.player_order?.length||0) - (auctionState.sold_count||0) - (auctionState.unsold_count||0)} remaining</span>
              </div>
            </div>
          )}
        </div>

        {/* Right — Platform Admin: all managers */}
        {isPlatformAdmin && isStarted && (
          <div className="w-72 border-l border-zinc-800 bg-zinc-950 overflow-y-auto p-4">
            <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">All Managers</p>
            <div className="space-y-3">
              {managers.map(mgr => {
                const avail = getAvailablePurse(mgr, group)
                const s = getSquadStats(mgr)
                const leading = mgr.id === auctionState?.current_bidder_id
                return (
                  <div key={mgr.id} className={`bg-zinc-900 border rounded-xl p-3 ${
                    leading ? 'border-amber-500/50' : 'border-zinc-800'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white text-sm font-medium">{mgr.manager_name}</p>
                      {leading && <span className="text-amber-400 text-xs">Leading</span>}
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-amber-400 font-bold">{mgr.purse_remaining} pts</span>
                      <span className="text-zinc-500">Avail: {avail}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${(mgr.purse_remaining/(group?.purse_per_manager||1000))*100}%` }} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {[
                        { l:'B',  h:s.batters, n:group?.min_batters||3 },
                        { l:'BW', h:s.bowlers, n:group?.min_bowlers||3 },
                        { l:'AR', h:s.ar,      n:group?.min_allrounders||2 },
                        { l:'WK', h:s.wk,      n:group?.min_wicketkeepers||1 },
                      ].map(({l,h,n}) => (
                        <span key={l} className={`text-xs px-1.5 py-0.5 rounded ${
                          h>=n ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-800'
                        }`}>{l} {h}/{n}</span>
                      ))}
                    </div>
                    {(mgr.squad||[]).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-zinc-800 space-y-0.5 max-h-20 overflow-y-auto">
                        {(mgr.squad||[]).map((sq: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-zinc-400 truncate">{sq.players?.name}</span>
                            <span className="text-zinc-600">{sq.price_paid}p</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}