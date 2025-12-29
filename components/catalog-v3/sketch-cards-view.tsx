import { GripVertical, Pencil, Save, Trash2, X } from "lucide-react"

import type { Product } from "@/lib/catalog-types"
import { Input } from "@/components/ui/input"
import { ProductImage } from "@/components/catalog-v3/product-image"

interface SketchCardsViewProps {
  products: Product[]
  businessName: string
  cardBackgroundColor?: string
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

export function SketchCardsView({
  products,
  businessName,
  cardBackgroundColor,
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
}: SketchCardsViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {products.map((product, index) => {
        const isEven = index % 2 === 0

        return (
          <div
            key={product.id}
            draggable={Boolean(onDragStart)}
            onDragStart={() => onDragStart?.(product.itemUuid || product.id)}
            onDragEnter={() => onDragEnter?.(product.itemUuid || product.id)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={() => onDrop?.(product.itemUuid || product.id)}
            className={`print-card bg-accent/30 border-2 border-foreground/20 rounded-3xl p-6 hover:shadow-xl transition-shadow ${
              dragOverItemUuid === (product.itemUuid || product.id)
                ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-3 before:h-0.5 before:bg-primary/70"
                : ""
            }`}
            style={cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : undefined}
          >
            <div
              className={`flex flex-col ${isEven ? "md:flex-row print:flex-row" : "md:flex-row-reverse print:flex-row-reverse"} gap-6 items-center`}
            >
              {/* Product Info */}
              <div className="flex-1 space-y-3">
                {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                  <Input
                    value={editDraft.name}
                    onChange={(e) => onEditChange("name", e.target.value)}
                    className="text-2xl font-bold"
                  />
                ) : (
                  <h3 className="font-bold text-2xl text-foreground leading-tight">{product.title}</h3>
                )}

                {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                  <Input
                    value={editDraft.description}
                    onChange={(e) => onEditChange("description", e.target.value)}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                )}

                {/* Price tag */}
                <div className="flex items-center pt-2">
                  {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editDraft.price}
                        onChange={(e) => onEditChange("price", e.target.value)}
                        className="w-28"
                      />
                      <span className="text-sm text-muted-foreground">ARS</span>
                    </div>
                  ) : (
                    <div className="border-2 border-foreground/30 rounded-xl px-4 py-2 bg-transparent">
                      <p className="font-bold text-foreground text-lg">{formatPrice(product.price)}</p>
                    </div>
                  )}
                </div>

                {(onDeleteItem || onStartEditItem) && product.itemUuid && (
                  <div className="flex items-center gap-3">
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

              {/* Product Image */}
              <div className="flex-shrink-0 w-full md:w-64 print-image">
                <ProductImage
                  src={product.image}
                  alt={product.title}
                  className="rounded-2xl border-2 border-foreground/20 aspect-square w-full"
                  imageClassName="rounded-xl"
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
