'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Step 1 — Create Supabase Auth user via signUp
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name }
        }
      })

      if (signUpError) throw new Error(signUpError.message)

      const authUserId = signUpData.user?.id

      // Step 2 — Create customer record in customers table
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          notes: form.notes || null,
          auth_user_id: authUserId,
          is_active: true,
        })

      if (customerError) throw new Error(customerError.message)

      setSuccess(`✓ Customer ${form.name} created successfully!`)
      setTimeout(() => router.back(), 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/customers" className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Customers
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-2xl font-bold text-white">Add Customer</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">

        {/* Name */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Full Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Customer's full name"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="customer@email.com"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Set login password"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
          <p className="text-zinc-600 text-xs mt-1">
            Share this password with the customer after creation
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Phone
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Admin Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any internal notes about this customer"
            rows={2}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/50 text-black font-semibold rounded-lg py-3 text-sm transition-colors"
          >
            {loading ? 'Creating...' : 'Create Customer →'}
          </button>
          <button
  type="button"
  onClick={() => router.back()}
  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
>
  Cancel
</button>
        </div>
      </form>
    </div>
  )
}
