"use client"

import { useCallback, useState } from "react"

import type { CatalogItemDetail } from "@/lib/catalog-types"
import { updateCatalogItem } from "@/lib/catalog-api"
import { normalizeOptionalDescription, requireNonEmpty, requireToken, requireValidPrice } from "@/lib/form-guards"
import { toast } from "@/hooks/use-toast"

type EditDraft = { name: string; description: string; price: string }

type UseItemEditProps = {
  selectedCatalogId: string | null
  onSaved?: (itemUuid: string, updates: Partial<CatalogItemDetail>) => Promise<void> | void
}

export const useItemEdit = ({ selectedCatalogId, onSaved }: UseItemEditProps) => {
  const [editingItemUuid, setEditingItemUuid] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<EditDraft>({ name: "", description: "", price: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [savingItemUuid, setSavingItemUuid] = useState<string | null>(null)

  const startEdit = useCallback(
    (item: { itemUuid?: string; title: string; description: string; price: number }) => {
      if (isSaving) {
        return
      }
      if (!item.itemUuid) {
        return
      }
      setEditingItemUuid(item.itemUuid)
      setEditDraft({
        name: item.title,
        description: item.description ?? "",
        price: item.price.toFixed(2),
      })
    },
    [isSaving],
  )

  const changeEdit = useCallback((field: "name" | "description" | "price", value: string) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingItemUuid(null)
    setEditDraft({ name: "", description: "", price: "" })
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingItemUuid || !selectedCatalogId || isSaving) {
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
      setIsSaving(true)
      setSavingItemUuid(editingItemUuid)
      const response = (await updateCatalogItem(editingItemUuid, token, {
        catalogId: selectedCatalogId,
        name,
        description: normalizeOptionalDescription(editDraft.description),
        price,
      })) as Partial<CatalogItemDetail>
      const normalizedDescription = normalizeOptionalDescription(editDraft.description) ?? ""
      const updates: Partial<CatalogItemDetail> = {
        name: response?.name ?? name,
        description: response?.description ?? normalizedDescription,
        price: response?.price ?? price,
      }
      if (response?.image !== undefined) {
        updates.image = response.image
      }
      if (response?.id) {
        updates.id = response.id
      }
      if (response?.uuid) {
        updates.uuid = response.uuid
      }
      if (response?.catalogId) {
        updates.catalogId = response.catalogId
      }
      toast({
        title: "Item actualizado",
      })
      setEditingItemUuid(null)
      setEditDraft({ name: "", description: "", price: "" })
      await onSaved?.(editingItemUuid, updates)
    } catch (err) {
      toast({
        title: "No se pudo guardar",
        description: err instanceof Error ? err.message : "Intentá nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setSavingItemUuid(null)
    }
  }, [editingItemUuid, selectedCatalogId, editDraft, onSaved, isSaving])

  return {
    editingItemUuid,
    editDraft,
    startEdit,
    changeEdit,
    cancelEdit,
    saveEdit,
    setEditingItemUuid,
    isSaving,
    savingItemUuid,
  }
}
