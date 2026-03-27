'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuctionRedirect() {
  const { id } = useParams()
  const router = useRouter()
  useEffect(() => {
    router.replace(`/auction/${Array.isArray(id) ? id[0] : id}`)
  }, [id])
  return null
}
