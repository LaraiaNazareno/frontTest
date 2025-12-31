import type { Product } from "@/lib/catalog-types"
import { ItemActionButtons } from "@/components/catalog-v3/item-action-buttons"
import {
  type EditChangeHandler,
  type EditDraft,
  getItemEditState,
  ItemEditField,
  ItemPriceEditField,
} from "@/components/catalog-v3/item-edit-fields"
import { ProductImage } from "@/components/catalog-v3/product-image"

interface SketchCardsViewProps {
  products: Product[]
  businessName: string
  cardBackgroundColor?: string
  onDeleteItem?: (itemUuid: string) => void
  onStartEditItem?: (item: Product) => void
  onEditChange?: EditChangeHandler
  onEditSave?: () => void
  onEditCancel?: () => void
  editingItemUuid?: string | null
  editDraft?: EditDraft
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
        const { isEditing } = getItemEditState(
          product.itemUuid,
          editingItemUuid,
          editDraft,
          onEditChange,
        )

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
                {isEditing && editDraft && onEditChange ? (
                  <ItemEditField
                    field="name"
                    editDraft={editDraft}
                    onEditChange={onEditChange}
                    className="text-2xl font-bold"
                  />
                ) : (
                  <h3 className="font-bold text-2xl text-foreground leading-tight">{product.title}</h3>
                )}

                {isEditing && editDraft && onEditChange ? (
                  <ItemEditField
                    field="description"
                    editDraft={editDraft}
                    onEditChange={onEditChange}
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                )}

                {/* Price tag */}
                <div className="flex items-center pt-2">
                  {isEditing && editDraft && onEditChange ? (
                    <ItemPriceEditField
                      editDraft={editDraft}
                      onEditChange={onEditChange}
                      wrapperClassName="flex items-center gap-2"
                      inputClassName="w-28"
                    />
                  ) : (
                    <div className="border-2 border-foreground/30 rounded-xl px-4 py-2 bg-transparent">
                      <p className="font-bold text-foreground text-lg">{formatPrice(product.price)}</p>
                    </div>
                  )}
                </div>

                {(onDeleteItem || onStartEditItem) && product.itemUuid && (
                  <ItemActionButtons
                    className="flex items-center gap-3"
                    isEditing={isEditing}
                    onSave={() => onEditSave?.()}
                    onCancel={() => onEditCancel?.()}
                    onEdit={onStartEditItem ? () => onStartEditItem(product) : undefined}
                    onDelete={onDeleteItem ? () => onDeleteItem(product.itemUuid!) : undefined}
                    showDrag={Boolean(onDragStart)}
                    showDelete={Boolean(onDeleteItem)}
                  />
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
