"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SketchCardsView } from "@/components/catalog-v3/sketch-cards-view"
import { ChecklistView } from "@/components/catalog-v3/checklist-view"
import { TableView } from "@/components/catalog-v3/table-view"
import { toast } from "@/hooks/use-toast"
import type { CatalogItemDetail, ViewMode } from "@/lib/catalog-types"
import { mapItemDetailsToProducts, normalizeHexColor } from "@/lib/catalog-utils"
import { requireToken } from "@/lib/form-guards"
import { useCatalogItems } from "@/hooks/use-catalog-items"
import { useCatalogs } from "@/hooks/use-catalogs"
import { useItemDrag } from "@/hooks/use-item-drag"
import { deleteCatalogItem, deleteCatalog } from "@/lib/catalog-api"
import { useItemEdit } from "@/hooks/use-item-edit"
import { useExportPdf } from "@/hooks/use-export-pdf"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { CreateItemModal } from "@/components/modals/create-item-modal"
import { CatalogModal } from "@/components/modals/catalog-modal"
import { CatalogHeader } from "@/components/catalog-v3/catalog-header"
import {
  CatalogEmptyState,
  CatalogItemsEmptyState,
  CatalogLoginEmptyState,
} from "@/components/catalog-v3/catalog-empty-states"
import { CatalogPdfPreview } from "@/components/catalog-v3/catalog-pdf-preview"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

function CatalogPageContent() {
  const searchParams = useSearchParams()
  const preferredCatalogId = searchParams.get("catalogId")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const {
    catalogs,
    selectedCatalogId,
    setSelectedCatalogId,
    selectedCatalog,
    hasCatalogs,
    hasToken,
    loading,
    error,
    reload: reloadCatalogs,
    logout,
  } = useCatalogs(preferredCatalogId)
  const {
    items: catalogItemDetails,
    loading: loadingItems,
    error: itemsError,
    reload: reloadCatalogItems,
    clear: clearCatalogItems,
    setItems: setCatalogItems,
  } = useCatalogItems(selectedCatalogId)
  const [deletingCatalog, setDeletingCatalog] = useState(false)
  const [pendingDeleteItemUuid, setPendingDeleteItemUuid] = useState<string | null>(null)
  const [createCatalogOpen, setCreateCatalogOpen] = useState(false)
  const [editCatalogOpen, setEditCatalogOpen] = useState(false)
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const [justUpdatedItemUuid, setJustUpdatedItemUuid] = useState<string | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const getItemUuid = (item: CatalogItemDetail) => item.uuid || item.id
  const {
    editingItemUuid,
    editDraft,
    startEdit,
    changeEdit,
    cancelEdit,
    saveEdit,
    setEditingItemUuid,
    savingItemUuid,
  } = useItemEdit({
    selectedCatalogId,
    onSaved: async (itemUuid, updates) => {
      setCatalogItems((prev: CatalogItemDetail[]) =>
        prev.map((item: CatalogItemDetail) =>
          getItemUuid(item) === itemUuid ? { ...item, ...updates } : item
        )
      )
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      setJustUpdatedItemUuid(itemUuid)
      highlightTimeoutRef.current = setTimeout(() => {
        setJustUpdatedItemUuid(null)
      }, 1200)
    },
  })
  const {
    dragOverItemUuid,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDragStart,
    handleDrop,
  } = useItemDrag({
    items: catalogItemDetails,
    setItems: setCatalogItems,
    selectedCatalogId,
  })
  const businessName = selectedCatalog?.title ?? "Catálogo"

  const products = useMemo(() => mapItemDetailsToProducts(catalogItemDetails), [catalogItemDetails])
  const componentColor = normalizeHexColor(selectedCatalog?.componentColor) ?? "#FFFFFF"
  const pageBackgroundColor = normalizeHexColor(selectedCatalog?.backgroundColor) ?? undefined

  const { pdfContentRef, exportPdf } = useExportPdf({
    selectedCatalogId,
    viewMode,
    pageBackgroundColor,
    componentColor,
  })

  useEffect(() => {
    setEditingItemUuid(null)
  }, [selectedCatalogId, setEditingItemUuid])
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  const handleDeleteItem = async (itemUuid: string) => {
    if (!selectedCatalogId) {
      return
    }
    const token = requireToken(toast, {
      title: "No hay sesión",
      description: "Inicia sesión para eliminar items.",
    })
    if (!token) {
      return
    }

    try {
      await deleteCatalogItem(itemUuid, token, selectedCatalogId)
      toast({
        title: "Item eliminado",
        description: "Se eliminó el item correctamente.",
      })
      await reloadCatalogItems()
    } catch (err) {
      toast({
        title: "Error al eliminar",
        description: err instanceof Error ? err.message : "No se pudo eliminar el item.",
        variant: "destructive",
      })
    }
  }


  const pendingDeleteItem = pendingDeleteItemUuid
    ? catalogItemDetails.find((item) => getItemUuid(item) === pendingDeleteItemUuid)
    : null

  const handleConfirmDeleteItem = async () => {
    if (!pendingDeleteItemUuid) {
      return
    }
    const itemUuid = pendingDeleteItemUuid
    setPendingDeleteItemUuid(null)
    await handleDeleteItem(itemUuid)
  }

  const handleDeleteCatalog = async () => {
    if (!selectedCatalogId) {
      return
    }
    const token = requireToken(toast, {
      title: "No hay sesión",
      description: "Inicia sesión para eliminar catálogos.",
    })
    if (!token) {
      return
    }

    setDeletingCatalog(true)
    try {
      await deleteCatalog(selectedCatalogId, token)
      toast({
        title: "Catálogo eliminado",
        description: "Se eliminó el catálogo correctamente.",
      })
      setSelectedCatalogId(null)
      clearCatalogItems()
      await reloadCatalogs()
    } catch (err) {
      toast({
        title: "Error al eliminar catálogo",
        description: err instanceof Error ? err.message : "No se pudo eliminar el catálogo.",
        variant: "destructive",
      })
    } finally {
      setDeletingCatalog(false)
    }
  }


  return (
    <div
      className="min-h-screen bg-background"
      style={{ backgroundColor: pageBackgroundColor }}
    >
      <CatalogHeader
        hasToken={hasToken}
        selectedCatalog={selectedCatalog}
        catalogs={catalogs}
        selectedCatalogId={selectedCatalogId}
        hasCatalogs={hasCatalogs}
        deletingCatalog={deletingCatalog}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenCreateCatalog={() => setCreateCatalogOpen(true)}
        onOpenCreateItem={() => setCreateItemOpen(true)}
        onOpenEditCatalog={() => setEditCatalogOpen(true)}
        onLogout={logout}
        onDeleteCatalog={handleDeleteCatalog}
        onSelectCatalog={setSelectedCatalogId}
        onExportPdf={exportPdf}
      />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <CatalogModal
          open={editCatalogOpen}
          onOpenChange={setEditCatalogOpen}
          mode="edit"
          catalog={selectedCatalog}
          onUpdated={async () => {
            await reloadCatalogs()
          }}
        />
        <CatalogModal
          open={createCatalogOpen}
          onOpenChange={setCreateCatalogOpen}
          mode="create"
          onCreated={async (catalogId) => {
            await reloadCatalogs()
            setSelectedCatalogId(catalogId)
          }}
        />
        <CreateItemModal
          open={createItemOpen}
          onOpenChange={setCreateItemOpen}
          catalogId={selectedCatalogId}
          onCreated={async () => {
            await reloadCatalogItems()
          }}
        />
        <ConfirmDialog
          open={Boolean(pendingDeleteItemUuid)}
          onOpenChange={(open) => {
            if (!open) {
              setPendingDeleteItemUuid(null)
            }
          }}
          title="Eliminar item"
          description={
            pendingDeleteItem?.name
              ? `¿Seguro que querés eliminar "${pendingDeleteItem.name}"? Esta acción no se puede deshacer.`
              : "¿Seguro que querés eliminar este item? Esta acción no se puede deshacer."
          }
          confirmLabel="Eliminar"
          onConfirm={handleConfirmDeleteItem}
        />
        {hasToken && selectedCatalog && (
          <div
            className={`mb-8 flex ${
              viewMode === "cards"
                ? "max-w-6xl mx-auto"
                : viewMode === "checklist"
                  ? "max-w-4xl mx-auto"
                  : "-mx-6 px-10"
            }`}
          >
            <Button
              onClick={() => setCreateItemOpen(true)}
              size="default"
              className="gap-2 rounded-full px-5"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo item</span>
            </Button>
          </div>
        )}
        {loading && <p className="text-muted-foreground">Cargando catálogos...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {itemsError && !(!loading && !error && !loadingItems && products.length === 0 && selectedCatalog) && (
          <p className="text-destructive">{itemsError}</p>
        )}
        {hasToken === false && !loading ? (
          <CatalogLoginEmptyState />
        ) : (
          !loading &&
          !error &&
          catalogs.length === 0 && <CatalogEmptyState onCreate={() => setCreateCatalogOpen(true)} />
        )}
        {loadingItems && <p className="text-muted-foreground">Cargando items...</p>}
        {!loading && !error && !loadingItems && products.length === 0 && selectedCatalog && (
          <CatalogItemsEmptyState onCreate={() => setCreateItemOpen(true)} />
        )}
        {!loading && !error && !loadingItems && products.length > 0 && viewMode === "cards" && (
            <SketchCardsView
              products={products}
              businessName={businessName}
              cardBackgroundColor={componentColor}
              onDeleteItem={setPendingDeleteItemUuid}
            onStartEditItem={startEdit}
            onEditChange={changeEdit}
            onEditSave={saveEdit}
            onEditCancel={cancelEdit}
            editingItemUuid={editingItemUuid}
            savingItemUuid={savingItemUuid}
            editDraft={editDraft}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            dragOverItemUuid={dragOverItemUuid}
            highlightedItemUuid={justUpdatedItemUuid}
          />
        )}
        {!loading && !error && !loadingItems && products.length > 0 && viewMode === "checklist" && (
            <ChecklistView
              products={products}
              businessName={businessName}
              containerBackgroundColor={componentColor}
              onDeleteItem={setPendingDeleteItemUuid}
            onStartEditItem={startEdit}
            onEditChange={changeEdit}
            onEditSave={saveEdit}
            onEditCancel={cancelEdit}
            editingItemUuid={editingItemUuid}
            savingItemUuid={savingItemUuid}
            editDraft={editDraft}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            dragOverItemUuid={dragOverItemUuid}
            highlightedItemUuid={justUpdatedItemUuid}
          />
        )}
        {!loading && !error && !loadingItems && products.length > 0 && viewMode === "table" && (
          <div
            style={{
              backgroundColor: componentColor,
              borderRadius: "18px",
              padding: "16px",
            }}
          >
            <TableView
              products={products}
              businessName={businessName}
              backgroundColor={componentColor}
              onDeleteItem={setPendingDeleteItemUuid}
            onStartEditItem={startEdit}
            onEditChange={changeEdit}
            onEditSave={saveEdit}
            onEditCancel={cancelEdit}
              editingItemUuid={editingItemUuid}
              savingItemUuid={savingItemUuid}
              editDraft={editDraft}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverItemUuid={dragOverItemUuid}
              highlightedItemUuid={justUpdatedItemUuid}
            />
          </div>
        )}
        <CatalogPdfPreview
          viewMode={viewMode}
          products={products}
          businessName={businessName}
          componentColor={componentColor}
          pdfContentRef={pdfContentRef}
        />
      </main>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CatalogPageContent />
    </Suspense>
  )
}
