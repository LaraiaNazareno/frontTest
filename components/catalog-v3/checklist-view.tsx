import { GripVertical, Pencil, Save, Trash2, X } from "lucide-react"

import type { Product } from "@/lib/catalog-types"
import { Input } from "@/components/ui/input"
import { ProductImage } from "@/components/catalog-v3/product-image"

interface ChecklistViewProps {
  products: Product[]
  businessName: string
  containerBackgroundColor?: string
  onDeleteItem?: (itemUuid: string) => void
  onStartEditItem?: (item: Product) => void
  onEditChange?: (field: "name" | "description" | "price", value: string) => void
  onEditSave?: () => void
  onEditCancel?: () => void
  editingItemUuid?: string | null
  editDraft?: { name: string; description: string; price: string }
  onDragStart?: (itemUuid: string) => void
  onDragEnter?: (itemUuid: string) => void
  onDragOver?: (event: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (itemUuid: string) => void
  dragOverItemUuid?: string | null
}

export function ChecklistView({
  products,
  businessName,
  containerBackgroundColor,
  onDeleteItem,
  onStartEditItem,
  onEditChange,
  onEditSave,
  onEditCancel,
  editingItemUuid,
  editDraft,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverItemUuid,
}: ChecklistViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="bg-secondary/30 border-2 border-foreground/20 rounded-3xl p-4 sm:p-8"
        style={containerBackgroundColor ? { backgroundColor: containerBackgroundColor } : undefined}
      >
        <div>
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2 border-dashed border-foreground/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2" style={{ fontFamily: "cursive" }}>
              {businessName}
            </h2>
            <p className="text-muted-foreground">Catálogo completo con precios</p>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                draggable={Boolean(onDragStart)}
                onDragStart={() => onDragStart?.(product.itemUuid || product.id)}
                onDragEnter={() => onDragEnter?.(product.itemUuid || product.id)}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={() => onDrop?.(product.itemUuid || product.id)}
                className={`flex flex-col items-start gap-4 p-4 rounded-2xl hover:bg-card/50 transition-colors border-2 border-transparent hover:border-primary/20 sm:flex-row sm:items-center sm:gap-6 ${
                  dragOverItemUuid === (product.itemUuid || product.id)
                    ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-2 before:h-0.5 before:bg-primary/70"
                    : ""
                }`}
              >
                {/* Small thumbnail */}
                <div className="flex-shrink-0">
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    className="rounded-xl border-2 border-foreground/20 w-20 h-20"
                    imageClassName="rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                    <>
                      <Input
                        value={editDraft.name}
                        onChange={(e) => onEditChange("name", e.target.value)}
                        className="mb-2"
                      />
                      <Input
                        value={editDraft.description}
                        onChange={(e) => onEditChange("description", e.target.value)}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-lg text-foreground mb-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="flex-shrink-0 w-full sm:w-auto">
                  {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editDraft.price}
                        onChange={(e) => onEditChange("price", e.target.value)}
                        className="w-full sm:w-28"
                      />
                      <span className="text-sm text-muted-foreground">ARS</span>
                    </div>
                  ) : (
                    <div className="border-2 border-foreground/30 rounded-xl px-4 py-2 bg-transparent">
                      <p className="font-bold text-foreground whitespace-nowrap">{formatPrice(product.price)}</p>
                    </div>
                  )}
                  {(onDeleteItem || onStartEditItem) && product.itemUuid && (
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {editingItemUuid === product.itemUuid ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEditSave?.()}
                            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/40"
                          >
                            <Save className="h-4 w-4" />
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditCancel?.()}
                            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-muted/40"
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          {onStartEditItem && (
                            <button
                              type="button"
                              onClick={() => onStartEditItem(product)}
                              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/40"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </button>
                          )}
                          {onDragStart && (
                            <span className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/60">
                              <GripVertical className="h-4 w-4" />
                              Mover
                            </span>
                          )}
                          {onDeleteItem && (
                            <button
                              type="button"
                              onClick={() => onDeleteItem(product.itemUuid!)}
                              className="inline-flex items-center justify-center rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                              aria-label="Eliminar item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
