"use client"

import { useCallback, useEffect, useState } from "react"

import type { CatalogItemDetail } from "@/lib/catalog-types"
import { fetchCatalogItems } from "@/lib/catalog-api"

type UseCatalogItemsResult = {
  items: CatalogItemDetail[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  clear: () => void
  setItems: (items: CatalogItemDetail[]) => void
}

export const useCatalogItems = (selectedCatalogId: string | null): UseCatalogItemsResult => {
  const [items, setItems] = useState<CatalogItemDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!selectedCatalogId) {
      setItems([])
      setError(null)
      setLoading(false)
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setError("Falta el token en localStorage (key: token).")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchCatalogItems(selectedCatalogId, token)
      setItems(data)
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : ""
      const message = rawMessage.includes("<!DOCTYPE") ? "No se pudieron cargar los items." : rawMessage
      setError(message || "Error inesperado al cargar los items.")
    } finally {
      setLoading(false)
    }
  }, [selectedCatalogId])

  const clear = useCallback(() => {
    setItems([])
    setError(null)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    items,
    loading,
    error,
    reload,
    clear,
    setItems,
  }
}
