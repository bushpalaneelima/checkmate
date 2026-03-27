'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function GroupRulesPage() {
  const { id } = useParams()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/admin/groups/${id}`} className="text-zinc-500 hover:text-white text-sm transition-colors">
          ← Back to Group
        </Link>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-amber-400 text-4xl mb-4">⚙</p>
        <h1 className="text-white text-xl font-bold mb-2">Rules Configuration</h1>
        <p className="text-zinc-500 text-sm mb-6">
          Default IPL 2026 scoring rules are already applied to this group.
          Custom rules configuration will be available after March 28th.
        </p>
        <Link
          href={`/admin/groups/${id}`}
          className="bg-amber-400 hover:bg-amber-300 text-black font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          ← Back to Group
        </Link>
      </div>
    </div>
  )
}