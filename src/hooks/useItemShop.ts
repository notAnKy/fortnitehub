import { useEffect, useState } from 'react'
import { getItemShop } from '../api/fortniteApi'
import type { ShopEntry } from '../types/fortnite'

export const useItemShop = () => {
  const [entries, setEntries] = useState<ShopEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getItemShop()
      .then((data) => {
        setEntries(data.entries ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load item shop')
        setLoading(false)
      })
  }, [])

  return { entries, loading, error }
}