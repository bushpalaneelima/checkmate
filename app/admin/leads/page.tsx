'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-400 bg-blue-400/10'
      case 'contacted': return 'text-amber-400 bg-amber-400/10'
      case 'interested': return 'text-green-400 bg-green-400/10'
      case 'converted': return 'text-purple-400 bg-purple-400/10'
      case 'not_interested': return 'text-zinc-500 bg-zinc-800'
      default: return 'text-zinc-400 bg-zinc-800'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leads</h1>
          <p className="text-zinc-500 text-sm">{leads.length} people registered interest</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider p-4">Name</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider p-4">Email</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider p-4">Phone</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider p-4">Status</th>
              <th className="text-left text-zinc-500 text-xs uppercase tracking-wider p-4">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-600">Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-600">No leads yet</td></tr>
            ) : leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="p-4 text-white font-medium text-sm">{lead.name}</td>
                <td className="p-4 text-zinc-400 text-sm">{lead.email}</td>
                <td className="p-4 text-zinc-400 text-sm">{lead.phone || '—'}</td>
                <td className="p-4">
                  <select
                    value={lead.status}
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusColor(lead.status)}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="converted">Converted</option>
                    <option value="not_interested">Not Interested</option>
                  </select>
                </td>
                <td className="p-4 text-zinc-500 text-xs">
                  {new Date(lead.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}