'use client'

export default function RulesPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Rules Engine</h1>
        <p className="text-zinc-500 text-sm">Configure scoring rules per tournament</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-amber-400 text-4xl mb-4">⚙</p>
        <p className="text-white font-semibold mb-2">Default IPL 2026 Rules Active</p>
        <p className="text-zinc-500 text-sm">
          All scoring rules from the BUPA points document are loaded.
          Full rules editor coming after March 28th.
        </p>
      </div>
    </div>
  )
}