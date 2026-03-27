'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function GroupManagersPage() {
  const { id } = useParams()

  const [group, setGroup] = useState<any>(null)
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [assignedManagers, setAssignedManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    const groupId = Array.isArray(id) ? id[0] : id
    const [groupRes, customersRes, managersRes] = await Promise.all([
      supabase.from('auction_groups').select('*').eq('id', groupId).single(),
      supabase.from('customers').select('*').eq('is_active', true).order('name'),
      supabase.from('tournament_managers')
        .select('id, manager_name, role, purse_remaining, customer_id')
        .eq('auction_group_id', groupId),
    ])

    
    setGroup(groupRes.data)
    setAllCustomers(customersRes.data || [])
    setAssignedManagers(managersRes.data || [])
    setLoading(false)
  }

  const isAssigned = (customerId: string) =>
    assignedManagers.some(m => m.customer_id === customerId)

  const getManager = (customerId: string) =>
    assignedManagers.find(m => m.customer_id === customerId)

  const handleAssign = async (customer: any) => {
    setSaving(customer.id)
    setError('')
    setSuccess('')

    const { data: tournament } = await supabase
      .from('tournament_config')
      .select('id')
      .eq('is_active', true)
      .single()

    const { error } = await supabase
      .from('tournament_managers')
      .insert({
        tournament_id: tournament?.id,
        auction_group_id: id,
        customer_id: customer.id,
        manager_name: customer.name,
        role: 'manager',
        purse_remaining: group?.purse_per_manager || 1000,
        purse_spent: 0,
        is_confirmed: true,
        confirmed_at: new Date().toISOString(),
      })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(`${customer.name} added to group`)
      await fetchData()
      window.location.reload()
    }
    setSaving(null)
  }

  const handleRemove = async (customerId: string, customerName: string) => {
    if (!confirm(`Remove ${customerName} from this group?`)) return
    setSaving(customerId)
    setError('')

    const manager = getManager(customerId)
    const { error } = await supabase
      .from('tournament_managers')
      .delete()
      .eq('id', manager.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(`${customerName} removed`)
      fetchData()
    }
    setSaving(null)
  }

  const handleRoleChange = async (customerId: string, newRole: string) => {
    const manager = getManager(customerId)
    setSaving(customerId)
    await supabase
      .from('tournament_managers')
      .update({ role: newRole })
      .eq('id', manager.id)
    fetchData()
    setSaving(null)
  }

  const handleUpdatePurse = async (customerId: string, purse: number) => {
    const manager = getManager(customerId)
    await supabase
      .from('tournament_managers')
      .update({ purse_remaining: purse })
      .eq('id', manager.id)
    fetchData()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-zinc-500 animate-pulse">Loading...</p>
    </div>
  )

  const unassigned = allCustomers.filter(c => !isAssigned(c.id))
  const maxReached = assignedManagers.length >= (group?.max_managers || 15)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/groups" className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Groups
        </Link>
        <span className="text-zinc-700">/</span>
        <Link href={`/admin/groups/${id}`} className="text-zinc-500 hover:text-white text-sm transition-colors">
          {group?.name}
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-white text-sm">Managers</span>
      </div>

      <div className="flex items-center justify-between mb-8 mt-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{group?.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {assignedManagers.length} / {group?.max_managers} managers assigned
            · {group?.purse_per_manager} pts purse each
          </p>
        </div>
        <div className="text-right">
          <div className="w-40 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${(assignedManagers.length / (group?.max_managers || 1)) * 100}%` }}
            />
          </div>
          <p className="text-zinc-600 text-xs mt-1">
            {group?.max_managers - assignedManagers.length} spots remaining
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-green-400 text-sm">✓ {success}</p>
        </div>
      )}
      {maxReached && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-amber-400 text-sm">
            ⚠ Maximum managers ({group?.max_managers}) reached
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">

        {/* Assigned Managers */}
        <div>
          <h2 className="text-white font-semibold mb-3">
            Assigned Managers
            <span className="ml-2 text-amber-400 text-sm">({assignedManagers.length})</span>
          </h2>

          {assignedManagers.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-600 text-sm">No managers assigned yet</p>
              <p className="text-zinc-700 text-xs mt-1">Add from the list →</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignedManagers.map((manager) => (
                <div key={manager.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
                        <span className="text-amber-400 text-xs font-bold">
                          {manager.manager_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{manager.manager_name}</p>
                        <p className="text-zinc-600 text-xs">{manager.customers?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="mb-3">
                    <label className="text-zinc-500 text-xs mb-1 block">Role</label>
                    <select
                      value={manager.role}
                      onChange={e => handleRoleChange(manager.customer_id, e.target.value)}
                      disabled={saving === manager.customer_id}
                      className="w-full text-xs py-2 px-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-amber-500"
                    >
                      <option value="manager">Manager</option>
                      <option value="auction_driver">Auction Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Purse */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-zinc-500 text-xs">Purse:</span>
                    <input
                      type="number"
                      defaultValue={manager.purse_remaining}
                      onBlur={(e) => handleUpdatePurse(manager.customer_id, parseInt(e.target.value))}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-amber-400 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-zinc-600 text-xs">pts</span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(manager.customer_id, manager.manager_name)}
                    disabled={saving === manager.customer_id}
                    className="w-full text-xs py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    {saving === manager.customer_id ? '...' : 'Remove from group'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Customers */}
        <div>
          <h2 className="text-white font-semibold mb-3">
            Available Customers
            <span className="ml-2 text-zinc-500 text-sm">({unassigned.length})</span>
          </h2>

          {unassigned.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-600 text-sm">All customers assigned</p>
              <Link href="/admin/customers/new" className="text-amber-400 text-xs hover:text-amber-300 mt-1 block">
                + Add new customer →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {unassigned.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                      <span className="text-zinc-400 text-xs font-bold">
                        {customer.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{customer.name}</p>
                      <p className="text-zinc-600 text-xs">{customer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(customer)}
                    disabled={saving === customer.id || maxReached}
                    className="text-xs px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/30 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
                  >
                    {saving === customer.id ? '...' : '+ Add'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/customers/new"
            className="block mt-3 text-center text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
          >
            + Add new customer to platform
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex gap-3">
        <Link
          href={`/admin/groups/${id}`}
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
        >
          ← Back to Group
        </Link>
        {assignedManagers.length >= (group?.min_managers || 4) && (
          <Link
            href={`/admin/groups/${id}/players`}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg transition-colors"
          >
            Next: Set Up Player Pool →
          </Link>
        )}
      </div>
    </div>
  )
}
