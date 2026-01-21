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

interface ChecklistViewProps {
  products: Product[]
  businessName: string
  containerBackgroundColor?: string
  onDeleteItem?: (itemUuid: string) => void
  onStartEditItem?: (item: Product) => void
  onEditChange?: EditChangeHandler
  onEditSave?: () => void
  onEditCancel?: () => void
  editingItemUuid?: string | null
  savingItemUuid?: string | null
  editDraft?: EditDraft
  highlightedItemUuid?: string | null
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
  savingItemUuid,
  editDraft,
  highlightedItemUuid,
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
        className="bg-card/90 border border-border/60 rounded-3xl p-5 sm:p-8 shadow-sm"
        style={containerBackgroundColor ? { backgroundColor: containerBackgroundColor } : undefined}
      >
          <div>
            {/* Header */}
            <div className="mb-8 pb-6 border-b border-border/60">
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
                {businessName}
              </h2>
              <p className="text-sm text-muted-foreground">Catálogo completo con precios</p>
            </div>

          {/* Product List */}
          <div className="space-y-3">
            {products.map((product, index) => {
              const itemUuid = product.itemUuid || product.id
              const { isEditing } = getItemEditState(
                product.itemUuid,
                editingItemUuid,
                editDraft,
                onEditChange,
              )
              const isSaving = savingItemUuid === itemUuid
              const isHighlighted = highlightedItemUuid === itemUuid
              const isLocked = Boolean(editingItemUuid && editingItemUuid !== itemUuid)

              return (
                <div
                key={product.id}
                draggable={Boolean(onDragStart)}
                onDragStart={() => onDragStart?.(itemUuid)}
                onDragEnter={() => onDragEnter?.(itemUuid)}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={() => onDrop?.(itemUuid)}
                className={`flex flex-col items-start gap-4 p-4 rounded-2xl border border-transparent bg-background/60 transition-colors hover:border-border/60 hover:bg-background sm:flex-row sm:items-center sm:gap-6 ${
                  dragOverItemUuid === itemUuid
                    ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-2 before:h-0.5 before:bg-primary/70"
                    : ""
                } ${isHighlighted ? "bg-primary/5" : ""} ${
                  isEditing ? "bg-muted/30 border-border" : ""
                } ${isEditing ? "mb-2 sm:mb-3" : ""}`}
                >
                {/* Small thumbnail */}
                <div className="flex-shrink-0">
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    className="rounded-xl border border-border/60 bg-background w-20 h-20 shadow-sm"
                    imageClassName="rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  {isEditing && editDraft && onEditChange ? (
                    <>
                      <ItemEditField
                        field="name"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                        className="mb-2"
                      />
                      <ItemEditField
                        field="description"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="flex w-full flex-col gap-2 flex-shrink-0 sm:w-auto sm:self-center sm:items-end">
                  {isEditing && editDraft && onEditChange ? (
                    <ItemPriceEditField
                      editDraft={editDraft}
                      onEditChange={onEditChange}
                      disabled={isSaving}
                      wrapperClassName="flex items-center gap-2"
                      inputClassName="w-full sm:w-28"
                    />
                  ) : (
                    <div className="text-lg font-semibold text-foreground whitespace-nowrap">
                      {formatPrice(product.price)}
                    </div>
                  )}
                  {(onDeleteItem || onStartEditItem) && product.itemUuid && (
                      <ItemActionButtons
                        className="flex flex-wrap items-center gap-2"
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isLocked={isLocked}
                        onSave={() => onEditSave?.()}
                        onCancel={() => onEditCancel?.()}
                      onEdit={onStartEditItem ? () => onStartEditItem(product) : undefined}
                      onDelete={onDeleteItem ? () => onDeleteItem(product.itemUuid!) : undefined}
                      showDrag={Boolean(onDragStart)}
                      showDelete={Boolean(onDeleteItem)}
                    />
                  )}
                </div>
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
