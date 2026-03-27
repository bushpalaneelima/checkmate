'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupPlayersPage() {
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    router.push(`/admin/players?group=${Array.isArray(id) ? id[0] : id}`)
  }, [id])

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-zinc-500 animate-pulse">Loading player pool...</p>
    </div>
  )
}