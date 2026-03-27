'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PlayersPage() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [csvData, setCsvData] = useState<any[]>([])

  // ── Helpers ──────────────────────────────────────────────
  const getClass = (basePrice: number) => {
    if (basePrice >= 120) return 'Platinum'
    if (basePrice >= 60)  return 'Gold'
    if (basePrice >= 30)  return 'Silver'
    return 'Bronze'
  }

  const isOverseas = (type: string) =>
    type?.toLowerCase().includes('overseas') || false

  const normalizeRole = (role: string) => {
    const r = role?.trim().toLowerCase() || ''
    if (r.includes('wicket') || r === 'wk') return 'Wicket-keeper'
    if (r.includes('all')    || r === 'ar') return 'All-rounder'
    if (r.includes('bowl'))                 return 'Bowler'
    if (r.includes('bat'))                  return 'Batter'
    return role.trim()
  }

  const getCountryFromName = (playerName: string, type: string) => {
    const codeMap: Record<string, string> = {
      'SA':  'South Africa',
      'AUS': 'Australia',
      'ENG': 'England',
      'NZ':  'New Zealand',
      'WI':  'West Indies',
      'AFG': 'Afghanistan',
      'SL':  'Sri Lanka',
      'PAK': 'Pakistan',
      'BAN': 'Bangladesh',
      'ZIM': 'Zimbabwe',
      'IRE': 'Ireland',
      'SCO': 'Scotland',
    }
    const match = playerName.match(/\(([^)]+)\)/)
    if (type.toLowerCase().includes('overseas') && match) {
      return codeMap[match[1].trim()] || match[1].trim()
    }
    return 'India'
  }

  const cleanName = (name: string) =>
    name.replace(/\*?\s*\([^)]*\)\s*$/g, '').trim()

  // ── CSV Parser ────────────────────────────────────────────
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n').filter(l => l.trim())
    const separator = lines[0].includes('\t') ? '\t' : ','
    const headers = lines[0].split(separator).map(h =>
      h.trim().toLowerCase().replace(/\./g, '').trim()
    )

    const rows = lines.slice(1).map(line => {
      const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''))
      const row: any = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })
      return row
    })

    return rows.map(row => {
      const rawName  = row['player'] || row['name'] || ''
      const type     = row['type']   || ''
      const basePrice = parseInt(row['base price'] || row['base_price'] || '15') || 15

      return {
        name:       cleanName(rawName),
        ipl_team:   row['team'] || '',
        country:    getCountryFromName(rawName, type),
        is_overseas: isOverseas(type),
        category:   normalizeRole(row['role'] || ''),
        base_price: basePrice,
        class:      getClass(basePrice),
      }
    }).filter(p => p.name) // remove blank rows
  }

  // ── File Handler ──────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setSuccess(''); setCsvData([]); setPreview([])

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string)
        setCsvData(parsed)
        setPreview(parsed.slice(0, 5))
      } catch {
        setError('Could not parse file. Please check the format.')
      }
    }
    reader.readAsText(file)
  }

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!csvData.length) return
    setUploading(true); setError('')

    const { data: tournament } = await supabase
      .from('tournament_config')
      .select('id')
      .eq('is_active', true)
      .single()

    if (!tournament) {
      setError('No active tournament found.')
      setUploading(false)
      return
    }

    // Upload in batches of 50
    for (let i = 0; i < csvData.length; i += 50) {
      const batch = csvData.slice(i, i + 50).map(p => ({
        tournament_id: tournament.id,
        name:         p.name,
        ipl_team:     p.ipl_team,
        country:      p.country,
        is_overseas:  p.is_overseas,
        class:        p.class,
        category:     p.category,
        base_price:   p.base_price,
        is_sold:      false,
        is_available: true,
      }))

      const { error: err } = await supabase
        .from('players')
        .upsert(batch, { onConflict: 'name,tournament_id' })

      if (err) {
        setError(`Upload error: ${err.message}`)
        setUploading(false)
        return
      }
    }

    setSuccess(`✓ ${csvData.length} players uploaded to master list successfully!`)
    setUploading(false)
  }

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    total:    csvData.length,
    indian:   csvData.filter(p => !p.is_overseas).length,
    overseas: csvData.filter(p => p.is_overseas).length,
    platinum: csvData.filter(p => p.class === 'Platinum').length,
    gold:     csvData.filter(p => p.class === 'Gold').length,
    silver:   csvData.filter(p => p.class === 'Silver').length,
    bronze:   csvData.filter(p => p.class === 'Bronze').length,
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Player Pool</h1>
        <p className="text-zinc-500 text-sm">
          Upload the master player list for IPL 2026.
          This is a one-time upload per tournament.
          Each auction group will get their own copy to customise.
        </p>
      </div>

      {/* Format Guide */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-3">Expected CSV Format</h2>
        <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs text-amber-400 overflow-x-auto mb-3">
          No.,Team,Player,Type,Role,Base Price,Price
        </div>
        <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-400 overflow-x-auto mb-3">
          1,Chennai Super Kings,Ruturaj Gaikwad,Indian (capped),Batter,120,0{'\n'}
          5,Chennai Super Kings,Dewald Brevis* (SA),Overseas (capped),Batter,60,0
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
          <div>• <strong className="text-zinc-400">Type:</strong> Indian (capped/uncapped) / Overseas (capped/uncapped)</div>
          <div>• <strong className="text-zinc-400">Role:</strong> Batter / Bowler / All-rounder / Wicketkeeper</div>
          <div>• <strong className="text-zinc-400">Base Price:</strong> 120=Platinum · 60=Gold · 30=Silver · 15=Bronze</div>
          <div>• <strong className="text-zinc-400">Country:</strong> Auto-extracted from player name brackets</div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Upload Master Player List</h2>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-amber-500 transition-colors">
          <span className="text-zinc-500 text-sm mb-1">Click to select CSV file</span>
          <span className="text-zinc-600 text-xs">Comma or tab separated</span>
          <input type="file" accept=".csv,.tsv,.txt" onChange={handleFileChange} className="hidden" />
        </label>

        {csvData.length > 0 && (
          <div className="mt-4 bg-zinc-800 rounded-lg p-4">
            <p className="text-green-400 text-sm font-medium mb-3">✓ {stats.total} players loaded</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-zinc-700 rounded-lg p-2 text-center">
                <p className="text-amber-400 font-bold">{stats.platinum}</p>
                <p className="text-zinc-500 text-xs">Platinum</p>
              </div>
              <div className="bg-zinc-700 rounded-lg p-2 text-center">
                <p className="text-yellow-400 font-bold">{stats.gold}</p>
                <p className="text-zinc-500 text-xs">Gold</p>
              </div>
              <div className="bg-zinc-700 rounded-lg p-2 text-center">
                <p className="text-zinc-300 font-bold">{stats.silver}</p>
                <p className="text-zinc-500 text-xs">Silver</p>
              </div>
              <div className="bg-zinc-700 rounded-lg p-2 text-center">
                <p className="text-orange-400 font-bold">{stats.bronze}</p>
                <p className="text-zinc-500 text-xs">Bronze</p>
              </div>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-zinc-500">
              <span>🇮🇳 {stats.indian} Indian</span>
              <span>🌍 {stats.overseas} Overseas</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4">Preview (first 5 rows)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 p-2">Player</th>
                  <th className="text-left text-zinc-500 p-2">Team</th>
                  <th className="text-left text-zinc-500 p-2">Class</th>
                  <th className="text-left text-zinc-500 p-2">Role</th>
                  <th className="text-left text-zinc-500 p-2">Country</th>
                  <th className="text-left text-zinc-500 p-2">Base</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="text-white p-2 font-medium">{row.name}</td>
                    <td className="text-zinc-400 p-2">{row.ipl_team}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.class === 'Platinum' ? 'bg-amber-400/20 text-amber-400' :
                        row.class === 'Gold'     ? 'bg-yellow-400/20 text-yellow-400' :
                        row.class === 'Silver'   ? 'bg-zinc-400/20 text-zinc-300' :
                        'bg-orange-400/20 text-orange-400'
                      }`}>
                        {row.class}
                      </span>
                    </td>
                    <td className="text-zinc-400 p-2">{row.category}</td>
                    <td className="p-2">
                      <span className={row.is_overseas ? 'text-blue-400' : 'text-green-400'}>
                        {row.country}
                      </span>
                    </td>
                    <td className="text-amber-400 p-2">{row.base_price} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Errors / Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-green-400 text-sm">{success}</p>
          <p className="text-zinc-500 text-xs mt-1">
            Next: Go to your auction group and assign this player pool to the group.
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!csvData.length || uploading}
        className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-400/30 disabled:cursor-not-allowed text-black font-semibold rounded-lg py-3 text-sm transition-colors"
      >
        {uploading
          ? 'Uploading...'
          : csvData.length
            ? `Upload ${csvData.length} Players to Master List →`
            : 'Select a CSV file first'}
      </button>

      {csvData.length > 0 && !success && (
        <p className="text-zinc-600 text-xs text-center mt-3">
          This will upload to the master player list for IPL 2026.
          After uploading, assign players to your auction group.
        </p>
      )}
    </div>
  )
}
