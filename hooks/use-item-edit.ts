"use client"

import { useCallback, useState } from "react"

import type { CatalogItemDetail } from "@/lib/catalog-types"
import { updateCatalogItem } from "@/lib/catalog-api"
import { normalizeOptionalDescription, requireNonEmpty, requireToken, requireValidPrice } from "@/lib/form-guards"
import { toast } from "@/hooks/use-toast"

type EditDraft = { name: string; description: string; price: string }

type UseItemEditProps = {
  selectedCatalogId: string | null
  onSaved?: () => Promise<void> | void
}

export const useItemEdit = ({ selectedCatalogId, onSaved }: UseItemEditProps) => {
  const [editingItemUuid, setEditingItemUuid] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft>({ name: "", description: "", price: "" })

  const startEdit = useCallback((item: { itemUuid?: string; title: string; description: string; price: number }) => {
    if (!item.itemUuid) {
      return
    }
    setEditingItemUuid(item.itemUuid)
    setEditDraft({
      name: item.title,
      description: item.description ?? "",
      price: item.price.toFixed(2),
    })
  }, [])

  const changeEdit = useCallback((field: "name" | "description" | "price", value: string) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingItemUuid(null)
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingItemUuid || !selectedCatalogId) {
      return
    }

    const token = requireToken(toast, {
      title: "No hay sesión",
      description: "Inicia sesión para editar items.",
    })
    if (!token) {
      return
    }

    const name = requireNonEmpty(editDraft.name, toast, {
      title: "Falta el nombre",
      description: "Ingresa un nombre para el item.",
    })
    if (!name) {
      return
    }

    const price = requireValidPrice(editDraft.price, toast)
    if (!price) {
      return
    }

    try {
      await updateCatalogItem(editingItemUuid, token, {
        catalogId: selectedCatalogId,
        name,
        description: normalizeOptionalDescription(editDraft.description),
        price,
      })
      toast({
        title: "Item actualizado",
        description: "Los cambios se guardaron correctamente.",
      })
      setEditingItemUuid(null)
      await onSaved?.()
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: err instanceof Error ? err.message : "No se pudo actualizar el item.",
        variant: "destructive",
      })
    }
  }, [editingItemUuid, selectedCatalogId, editDraft, onSaved])

  return {
    editingItemUuid,
    editDraft,
    startEdit,
    changeEdit,
    cancelEdit,
    saveEdit,
    setEditingItemUuid,
  }
}
