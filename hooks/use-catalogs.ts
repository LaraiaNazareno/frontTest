"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { CatalogItem } from "@/lib/catalog-types"
import { fetchCatalogs } from "@/lib/catalog-api"

type UseCatalogsResult = {
  catalogs: CatalogItem[]
  selectedCatalogId: string | null
  setSelectedCatalogId: (id: string | null) => void
  selectedCatalog: CatalogItem | null
  hasCatalogs: boolean
  hasToken: boolean | null
  loading: boolean
  error: string | null
  reload: (nextSelectedId?: string | null) => Promise<void>
  logout: () => void
}

export const useCatalogs = (preferredCatalogId: string | null): UseCatalogsResult => {
  const [catalogs, setCatalogs] = useState<CatalogItem[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  const selectedCatalog = useMemo(
    () => catalogs.find((item) => item.id === selectedCatalogId) || null,
    [catalogs, selectedCatalogId],
  )

  const reload = useCallback(
    async (nextSelectedId?: string | null) => {
      const token = localStorage.getItem("token")

      setLoading(true)
      setError(null)

      if (!token) {
        setCatalogs([])
        setSelectedCatalogId(null)
        setHasToken(false)
        setLoading(false)
        return
      }

      setHasToken(true)
      try {
        const items = await fetchCatalogs(token)
        const storedSelectedId = localStorage.getItem("selectedCatalogId")
        const resolvedSelectedId =
          nextSelectedId ??
          selectedCatalogId ??
          (storedSelectedId && items.some((item) => item.id === storedSelectedId)
            ? storedSelectedId
            : null) ??
          (preferredCatalogId && items.some((item) => item.id === preferredCatalogId)
            ? preferredCatalogId
            : items[0]?.id ?? null)
        setCatalogs(items)
        setSelectedCatalogId(resolvedSelectedId)
        if (resolvedSelectedId) {
          localStorage.setItem("selectedCatalogId", resolvedSelectedId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado al cargar el catálogo.")
      } finally {
        setLoading(false)
      }
    },
    [preferredCatalogId, selectedCatalogId],
  )

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (selectedCatalogId) {
      localStorage.setItem("selectedCatalogId", selectedCatalogId)
    }
  }, [selectedCatalogId])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("selectedCatalogId")
    setHasToken(false)
    setCatalogs([])
    setSelectedCatalogId(null)
  }, [])

  return {
    catalogs,
    selectedCatalogId,
    setSelectedCatalogId,
    selectedCatalog,
    hasCatalogs: catalogs.length > 0,
    hasToken,
    loading,
    error,
    reload,
    logout,
  }
}
