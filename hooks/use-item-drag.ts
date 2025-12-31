"use client"

import { useState } from "react"

import type { CatalogItemDetail } from "@/lib/catalog-types"
import { reorderCatalogItemPosition } from "@/lib/catalog-api"
import { toast } from "@/hooks/use-toast"

type UseItemDragProps = {
  items: CatalogItemDetail[]
  setItems: (items: CatalogItemDetail[]) => void
  selectedCatalogId: string | null
}

export const useItemDrag = ({ items, setItems, selectedCatalogId }: UseItemDragProps) => {
  const [draggingItemUuid, setDraggingItemUuid] = useState<string | null>(null)
  const [dragOverItemUuid, setDragOverItemUuid] = useState<string | null>(null)

  const getItemUuid = (item: CatalogItemDetail) => item.uuid || item.id

  const handleDragStart = (itemUuid: string) => {
    setDraggingItemUuid(itemUuid)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDragEnter = (itemUuid: string) => {
    if (draggingItemUuid && draggingItemUuid !== itemUuid) {
      setDragOverItemUuid(itemUuid)
    }
  }

  const handleDragLeave = () => {
    setDragOverItemUuid(null)
  }

  const handleDrop = async (targetUuid: string) => {
    if (!draggingItemUuid || draggingItemUuid === targetUuid) {
      setDraggingItemUuid(null)
      setDragOverItemUuid(null)
      return
    }

    const fromIndex = items.findIndex((item) => getItemUuid(item) === draggingItemUuid)
    const toIndex = items.findIndex((item) => getItemUuid(item) === targetUuid)

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingItemUuid(null)
      return
    }

    const nextItems = [...items]
    const [moved] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, moved)
    setItems(nextItems)
    setDraggingItemUuid(null)
    setDragOverItemUuid(null)

    const token = localStorage.getItem("token")
    if (!token || !selectedCatalogId) {
      return
    }

    try {
      const targetIndex = toIndex + 1
      await reorderCatalogItemPosition(draggingItemUuid, selectedCatalogId, targetIndex, token)
      toast({
        title: "Orden actualizado",
        description: "Se guardó el nuevo orden.",
      })
    } catch (err) {
      toast({
        title: "No se pudo ordenar",
        description: err instanceof Error ? err.message : "No se pudo guardar el orden.",
        variant: "destructive",
      })
    }
  }

  return {
    dragOverItemUuid,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
