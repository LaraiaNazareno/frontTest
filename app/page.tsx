"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
  exportCatalogPdfHtml,
  fetchCatalogItems,
  fetchCatalogs,
  reorderCatalogItemPosition,
  updateCatalogItem,
} from "@/lib/catalog-api"
import { buildCatalogPdfHtml } from "@/lib/pdf-template"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LayoutGrid, List, Download, Table } from "lucide-react"

function CatalogPageContent() {
  const searchParams = useSearchParams()
  const preferredCatalogId = searchParams.get("catalogId")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [catalogName, setCatalogName] = useState("Catálogos")
  const [businessName, setBusinessName] = useState("Mi Negocio")
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [catalogItemDetails, setCatalogItemDetails] = useState<CatalogItemDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
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
      setCatalogName((prev) => (prev === "Catálogos" ? nextTitle || prev : prev))
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

    if (!window.confirm("¿Eliminar este item? Esta acción no se puede deshacer.")) {
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
          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Title Section */}
            <div className="flex-1 min-w-[280px]">
              <Input
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
                className="text-4xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-primary"
                placeholder="Catálogos"
              />
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="text-lg text-muted-foreground border-none bg-transparent px-0 h-auto mt-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Tu marca"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-start flex-wrap">
              {hasToken && (
                <>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/catalogos/nuevo">Nuevo catálogo</Link>
                  </Button>
                  {selectedCatalog && (
                    <Button asChild variant="outline" size="lg">
                      <Link href={`/catalogos/${selectedCatalog.id}/items/nuevo`}>Nuevo item</Link>
                    </Button>
                  )}
                  {selectedCatalog && (
                    <Button asChild variant="outline" size="lg">
                      <Link href={`/catalogos/${selectedCatalog.id}/editar`}>Editar catálogo</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={handleLogout}>
                    Cerrar sesión
                  </Button>
                </>
              )}
              <Select
                value={selectedCatalogId ?? undefined}
                onValueChange={(value: string) => {
                  setSelectedCatalogId(value)
                  const nextCatalog = catalogItems.find((item) => item.id === value)
                  if (nextCatalog) {
                    setCatalogName(nextCatalog.title)
                  }
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecciona un catálogo" />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
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
          catalogItems.length === 0 && <p className="text-muted-foreground">No hay catálogos disponibles.</p>
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
            onDeleteItem={handleDeleteItem}
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
            onDeleteItem={handleDeleteItem}
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
              onDeleteItem={handleDeleteItem}
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
