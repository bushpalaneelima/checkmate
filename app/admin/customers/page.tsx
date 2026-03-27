'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCustomers() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // 1. Create auth user in Supabase
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    const { data: authData, error: authError } = await supabase.auth.admin?.createUser({
      email: form.email,
      password: tempPassword,
      email_confirm: true,
    }) as any

    // Note: admin.createUser requires service role key
    // For now we insert customer record — auth user created separately by admin in Supabase dashboard
    const { error: insertError } = await supabase
      .from('customers')
      .insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        notes: form.notes || null,
      })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    setForm({ name: '', email: '', phone: '', notes: '' })
    setShowAdd(false)
    setSaving(false)
    fetchCustomers()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold mb-1">Customers</h1>
          <p className="text-zinc-500 text-sm">All registered Checkmate users</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          + Add Customer
        </button>
      </div>

      {/* Add Customer Form */}
      {showAdd && (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">New Customer</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Rahul Sharma"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="rahul@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Phone (optional)</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes about this customer"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
              <p className="text-amber-400 text-xs">
                ⚠️ After adding the customer here, go to Supabase → Authentication → Users → Add User with the same email to create their login. Then update their auth_user_id in the customers table.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                {saving ? 'Saving...' : 'Add Customer'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      {loading ? (
        <div className="text-zinc-600 text-sm">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-8 text-center">
          <p className="text-zinc-500 text-sm mb-3">No customers yet</p>
          <button onClick={() => setShowAdd(true)} className="text-amber-400 text-sm hover:text-amber-300">
            Add your first customer →
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">Phone</th>
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">Auth</th>
                <th className="text-left text-zinc-500 text-xs uppercase tracking-wider px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${i === customers.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-5 py-4">
                    <p className="text-white text-sm font-medium">{c.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-400 text-sm">{c.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-500 text-sm">{c.phone || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.auth_user_id ? 'text-green-400 bg-green-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                      {c.auth_user_id ? 'Linked' : 'No login'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.is_active ? 'text-green-400 bg-green-400/10' : 'text-zinc-500 bg-zinc-800'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
