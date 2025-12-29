"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { SketchCardsView } from "@/components/catalog-v3/sketch-cards-view"
import { ChecklistView } from "@/components/catalog-v3/checklist-view"
import { TableView } from "@/components/catalog-v3/table-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import type { CatalogItem, CatalogItemDetail, ViewMode } from "@/lib/catalog-types"
import { formatPrice, isValidPrice, mapItemDetailsToProducts, normalizeHexColor } from "@/lib/catalog-utils"
import {
  deleteCatalogItem,
  deleteCatalog,
  exportCatalogPdfHtml,
  fetchCatalogItems,
  fetchCatalogs,
  reorderCatalogItemPosition,
  updateCatalogItem,
} from "@/lib/catalog-api"
import { buildCatalogPdfHtml } from "@/lib/pdf-template"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { ProductImage } from "@/components/catalog-v3/product-image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LayoutGrid, List, Download, Table, MoreHorizontal, Plus, Pencil, LogOut, Trash2 } from "lucide-react"

function CatalogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preferredCatalogId = searchParams.get("catalogId")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [catalogItemDetails, setCatalogItemDetails] = useState<CatalogItemDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [deletingCatalog, setDeletingCatalog] = useState(false)
  const [pendingDeleteItemUuid, setPendingDeleteItemUuid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [editingItemUuid, setEditingItemUuid] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({ name: "", description: "", price: "" })
  const [draggingItemUuid, setDraggingItemUuid] = useState<string | null>(null)
  const [dragOverItemUuid, setDragOverItemUuid] = useState<string | null>(null)
  const pdfContentRef = useRef<HTMLDivElement | null>(null)

  const selectedCatalog = useMemo(
    () => catalogItems.find((item) => item.id === selectedCatalogId) || null,
    [catalogItems, selectedCatalogId],
  )
  const businessName = selectedCatalog?.title ?? "Catálogo"
  const hasCatalogs = catalogItems.length > 0

  const products = useMemo(() => mapItemDetailsToProducts(catalogItemDetails), [catalogItemDetails])
  const componentColor = normalizeHexColor(selectedCatalog?.componentColor) ?? "#FFFFFF"
  const pageBackgroundColor = normalizeHexColor(selectedCatalog?.backgroundColor) ?? undefined

  const loadCatalogs = useCallback(async () => {
    const token = localStorage.getItem("token")

    setLoading(true)
    setError(null)

    if (!token) {
      setCatalogItems([])
      setSelectedCatalogId(null)
      setHasToken(false)
      setLoading(false)
      return
    }

    setHasToken(true)
    try {
      const items = await fetchCatalogs(token)
      const nextSelectedId =
        preferredCatalogId && items.some((item) => item.id === preferredCatalogId)
          ? preferredCatalogId
          : items[0]?.id ?? null
      setCatalogItems(items)
      setSelectedCatalogId(nextSelectedId)
      const nextTitle = items.find((item) => item.id === nextSelectedId)?.title
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al cargar el catálogo.")
    } finally {
      setLoading(false)
    }
  }, [preferredCatalogId])

  useEffect(() => {
    loadCatalogs()
  }, [loadCatalogs])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setHasToken(false)
    setCatalogItems([])
    setSelectedCatalogId(null)
    setCatalogItemDetails([])
  }

  const loadCatalogItems = useCallback(async () => {
      if (!selectedCatalogId) {
        setCatalogItemDetails([])
        setItemsError(null)
        setLoadingItems(false)
        return
      }

      const token = localStorage.getItem("token")

      if (!token) {
        setItemsError("Falta el token en localStorage (key: token).")
        return
      }

      setLoadingItems(true)
      setItemsError(null)

      try {
        const items = await fetchCatalogItems(selectedCatalogId, token)
        setCatalogItemDetails(items)
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : ""
        const message = rawMessage.includes("<!DOCTYPE") ? "No se pudieron cargar los items." : rawMessage
        setItemsError(message || "Error inesperado al cargar los items.")
      } finally {
        setLoadingItems(false)
      }
    }, [selectedCatalogId])

  useEffect(() => {
    loadCatalogItems()
  }, [loadCatalogItems])

  useEffect(() => {
    setEditingItemUuid(null)
  }, [selectedCatalogId])

  const handleStartEditItem = (item: { itemUuid?: string; title: string; description: string; price: number }) => {
    if (!item.itemUuid) {
      return
    }
    setEditingItemUuid(item.itemUuid)
    setEditDraft({
      name: item.title,
      description: item.description,
      price: item.price.toFixed(2),
    })
  }

  const handleEditChange = (field: "name" | "description" | "price", value: string) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancelEdit = () => {
    setEditingItemUuid(null)
  }

  const handleSaveEdit = async () => {
    if (!editingItemUuid || !selectedCatalogId) {
      return
    }
    const token = localStorage.getItem("token")

    if (!token) {
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para editar items.",
        variant: "destructive",
      })
      return
    }

    if (!editDraft.name.trim()) {
      toast({
        title: "Falta el nombre",
        description: "Ingresa un nombre para el item.",
        variant: "destructive",
      })
      return
    }

    if (!editDraft.price.trim()) {
      toast({
        title: "Falta el precio",
        description: "Ingresa un precio válido.",
        variant: "destructive",
      })
      return
    }

    if (!isValidPrice(editDraft.price)) {
      toast({
        title: "Precio inválido",
        description: "Usa solo números, por ejemplo 25 o 25.50.",
        variant: "destructive",
      })
      return
    }

    try {
      await updateCatalogItem(editingItemUuid, token, {
        catalogId: selectedCatalogId,
        name: editDraft.name.trim(),
        description: editDraft.description.trim() || undefined,
        price: editDraft.price.trim(),
      })
      toast({
        title: "Item actualizado",
        description: "Los cambios se guardaron correctamente.",
      })
      setEditingItemUuid(null)
      await loadCatalogItems()
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: err instanceof Error ? err.message : "No se pudo actualizar el item.",
        variant: "destructive",
      })
    }
  }

  const getItemUuid = (item: CatalogItemDetail) => item.uuid || item.id

  const handleDeleteItem = async (itemUuid: string) => {
    if (!selectedCatalogId) {
      return
    }
    const token = localStorage.getItem("token")

    if (!token) {
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para eliminar items.",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteCatalogItem(itemUuid, token, selectedCatalogId)
      toast({
        title: "Item eliminado",
        description: "Se eliminó el item correctamente.",
      })
      await loadCatalogItems()
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
    const token = localStorage.getItem("token")

    if (!token) {
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para eliminar catálogos.",
        variant: "destructive",
      })
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
      setCatalogItemDetails([])
      await loadCatalogs()
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

    const fromIndex = catalogItemDetails.findIndex((item) => getItemUuid(item) === draggingItemUuid)
    const toIndex = catalogItemDetails.findIndex((item) => getItemUuid(item) === targetUuid)

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingItemUuid(null)
      return
    }

    const nextItems = [...catalogItemDetails]
    const [moved] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, moved)
    setCatalogItemDetails(nextItems)
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

  const handleExportPDF = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      setError("Falta el token en localStorage (key: token).")
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para exportar el PDF.",
        variant: "destructive",
      })
      return
    }

    if (!selectedCatalogId) {
      setError("No hay catálogo seleccionado para exportar.")
      toast({
        title: "Catálogo no seleccionado",
        description: "Elegí un catálogo antes de exportar.",
        variant: "destructive",
      })
      return
    }

    const htmlContent = pdfContentRef.current?.innerHTML?.trim()

    if (!htmlContent) {
      setError("No se pudo generar el HTML para exportar.")
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el HTML del catálogo.",
        variant: "destructive",
      })
      return
    }

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n")
        } catch (err) {
          return ""
        }
      })
      .join("\n")

    const baseHref = window.location.origin
    const pdfPageBackground = normalizeHexColor(selectedCatalog?.backgroundColor)
    const fallbackPageBackground = getComputedStyle(document.body).backgroundColor || "#f8fafc"
    const htmlBase = buildCatalogPdfHtml({
      styles,
      htmlContent,
      baseHref,
      pageBackground: pdfPageBackground ?? fallbackPageBackground,
      componentBackground: componentColor,
    })

    const html = htmlBase
      .replaceAll("../media/", `${baseHref}/media/`)
      .replaceAll("/_nextjs_font/", `${baseHref}/_nextjs_font/`)

    if (!html.includes('id="pdf-root"')) {
      setError("No se pudo preparar el HTML con el contenedor del PDF.")
      toast({
        title: "Error al exportar",
        description: "No se pudo preparar el HTML del PDF.",
        variant: "destructive",
      })
      return
    }

    const exportToast = toast({
      title: "Exportando PDF...",
      description: "Esto puede tardar unos segundos.",
    })

    try {
      const blob = await exportCatalogPdfHtml(selectedCatalogId, token, { html, viewMode })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `catalogo-${selectedCatalogId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      exportToast.update({
        id: exportToast.id,
        title: "PDF listo",
        description: "Se descargó el catálogo correctamente.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado al exportar el PDF.")
      exportToast.update({
        id: exportToast.id,
        title: "Error al exportar",
        description: err instanceof Error ? err.message : "No se pudo exportar el PDF.",
        variant: "destructive",
      })
    }
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ backgroundColor: pageBackgroundColor }}
    >
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-3">
                {hasToken && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg" className="gap-2">
                        <MoreHorizontal className="h-5 w-5" />
                        Acciones
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onSelect={() => router.push("/catalogos/nuevo")}>
                        <Plus className="h-4 w-4" />
                        Nuevo catálogo
                      </DropdownMenuItem>
                      {selectedCatalog && (
                        <DropdownMenuItem
                          onSelect={() => router.push(`/catalogos/${selectedCatalog.id}/items/nuevo`)}
                        >
                          <Plus className="h-4 w-4" />
                          Nuevo item
                        </DropdownMenuItem>
                      )}
                      {selectedCatalog && (
                        <DropdownMenuItem
                          onSelect={() => router.push(`/catalogos/${selectedCatalog.id}/editar`)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar catálogo
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Title Section */}
              <div className="min-w-[280px] max-w-3xl lg:flex-1 lg:max-w-xl lg:mx-6">
                <div className="mt-3">
                  <ProductImage
                    src={selectedCatalog?.logoUrl}
                    alt={selectedCatalog?.title ?? "Logo del catálogo"}
                    className="h-10 w-10 rounded-full border border-border"
                    imageClassName="rounded-full"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 items-center flex-wrap justify-start lg:justify-end">
                <div className="flex items-center gap-2 flex-row-reverse sm:flex-row">
                  <ConfirmDialog
                    title="Eliminar catálogo"
                    description={
                      selectedCatalog
                        ? `¿Seguro que querés eliminar "${selectedCatalog.title}"? Esta acción no se puede deshacer.`
                        : "Seleccioná un catálogo para poder eliminarlo."
                    }
                    confirmLabel={deletingCatalog ? "Eliminando..." : "Eliminar"}
                    confirmDisabled={!selectedCatalog || deletingCatalog}
                    onConfirm={handleDeleteCatalog}
                    trigger={
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={!selectedCatalog || deletingCatalog}
                        aria-label="Eliminar catálogo"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    }
                  />
                <Select
                  value={selectedCatalogId ?? undefined}
                  disabled={!hasCatalogs}
                  onValueChange={(value: string) => {
                    setSelectedCatalogId(value)
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue
                      placeholder={hasCatalogs ? "Selecciona un catálogo" : "Sin catálogos"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {hasCatalogs ? (
                      catalogItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-catalogs" disabled>
                        No hay catálogos
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "cards" ? "default" : "outline"}
                    onClick={() => setViewMode("cards")}
                    size="lg"
                    className="gap-2"
                  >
                    <LayoutGrid className="h-5 w-5" />
                    <span>Tarjetas</span>
                  </Button>
                  <Button
                    variant={viewMode === "checklist" ? "default" : "outline"}
                    onClick={() => setViewMode("checklist")}
                    size="lg"
                    className="gap-2"
                  >
                    <List className="h-5 w-5" />
                    <span>Lista</span>
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    onClick={() => setViewMode("table")}
                    size="lg"
                    className="gap-2"
                  >
                    <Table className="h-5 w-5" />
                    <span>Tabla</span>
                  </Button>
                </div>

                <Button onClick={handleExportPDF} size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                  <Download className="h-5 w-5" />
                  <span>Exportar PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
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
        {loading && <p className="text-muted-foreground">Cargando catálogos...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {itemsError && !(!loading && !error && !loadingItems && products.length === 0 && selectedCatalog) && (
          <p className="text-destructive">{itemsError}</p>
        )}
        {hasToken === false && !loading ? (
          <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground">Inicia sesión</h2>
            <p className="text-muted-foreground mt-2">
              Necesitas iniciar sesión para ver los catálogos y exportar el PDF.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/login">Ir a login</Link>
            </Button>
          </div>
        ) : (
          !loading &&
          !error &&
          catalogItems.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground">No hay catálogos</h2>
              <p className="text-muted-foreground mt-2">
                Crea tu primer catálogo para empezar a cargar productos.
              </p>
              <Button asChild size="lg" className="mt-4">
                <Link href="/catalogos/nuevo">Crear catálogo</Link>
              </Button>
            </div>
          )
        )}
        {loadingItems && <p className="text-muted-foreground">Cargando items...</p>}
        {!loading && !error && !loadingItems && products.length === 0 && selectedCatalog && (
          <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-foreground">Este catálogo no tiene items</h2>
            <p className="text-muted-foreground mt-2">
              Crea el primer item para que el catálogo tenga contenido.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href={`/catalogos/${selectedCatalog.id}/items/nuevo`}>Crear item</Link>
            </Button>
          </div>
        )}
        {!loading && !error && !loadingItems && products.length > 0 && viewMode === "cards" && (
            <SketchCardsView
              products={products}
              businessName={businessName}
              cardBackgroundColor={componentColor}
              onDeleteItem={setPendingDeleteItemUuid}
            onStartEditItem={handleStartEditItem}
            onEditChange={handleEditChange}
            onEditSave={handleSaveEdit}
            onEditCancel={handleCancelEdit}
            editingItemUuid={editingItemUuid}
            editDraft={editDraft}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            dragOverItemUuid={dragOverItemUuid}
          />
        )}
        {!loading && !error && !loadingItems && products.length > 0 && viewMode === "checklist" && (
            <ChecklistView
              products={products}
              businessName={businessName}
              containerBackgroundColor={componentColor}
              onDeleteItem={setPendingDeleteItemUuid}
            onStartEditItem={handleStartEditItem}
            onEditChange={handleEditChange}
            onEditSave={handleSaveEdit}
            onEditCancel={handleCancelEdit}
            editingItemUuid={editingItemUuid}
            editDraft={editDraft}
            onDragStart={handleDragStart}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            dragOverItemUuid={dragOverItemUuid}
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
              onStartEditItem={handleStartEditItem}
              onEditChange={handleEditChange}
              onEditSave={handleSaveEdit}
              onEditCancel={handleCancelEdit}
              editingItemUuid={editingItemUuid}
              editDraft={editDraft}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverItemUuid={dragOverItemUuid}
            />
          </div>
        )}
        <div className="absolute left-[-10000px] top-0 w-[1024px]" aria-hidden="true">
          <div ref={pdfContentRef} className="container mx-auto px-6 py-12">
            {viewMode === "cards" && (
              <div className="pdf-card-list">
                {products.map((product) => (
                  <div key={product.id} className="pdf-card">
                    <div className="pdf-card-body">
                      <div>
                        <h3 className="pdf-card-title">{product.title}</h3>
                        <p className="pdf-card-desc">{product.description}</p>
                        <span className="pdf-card-price">{formatPrice(product.price)}</span>
                      </div>
                      <div className="pdf-card-image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.title} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {viewMode === "checklist" && (
              <div className="pdf-checklist">
                <div className="pdf-checklist-header">
                  <div className="pdf-checklist-title">Productos {businessName}</div>
                  <div className="pdf-checklist-subtitle">Catálogo completo con precios</div>
                </div>
                {products.map((product) => (
                  <div key={product.id} className="pdf-checklist-item">
                    <div className="pdf-checklist-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image} alt={product.title} />
                    </div>
                    <div>
                      <div className="pdf-checklist-name">{product.title}</div>
                      <div className="pdf-checklist-desc">{product.description}</div>
                    </div>
                    <div className="pdf-checklist-price">{formatPrice(product.price)}</div>
                  </div>
                ))}
              </div>
            )}
            {viewMode === "table" && (
              <div style={{ background: "var(--pdf-card-bg)", padding: "16px", borderRadius: "18px" }}>
                <TableView products={products} businessName={businessName} backgroundColor={componentColor} />
              </div>
            )}
          </div>
        </div>
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
