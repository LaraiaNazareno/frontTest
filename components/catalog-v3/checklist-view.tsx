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
  editDraft?: EditDraft
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
            {products.map((product, index) => {
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
                  {isEditing && editDraft && onEditChange ? (
                    <>
                      <ItemEditField
                        field="name"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        className="mb-2"
                      />
                      <ItemEditField
                        field="description"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
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
                  {isEditing && editDraft && onEditChange ? (
                    <ItemPriceEditField
                      editDraft={editDraft}
                      onEditChange={onEditChange}
                      wrapperClassName="flex items-center gap-2"
                      inputClassName="w-full sm:w-28"
                    />
                  ) : (
                    <div className="border-2 border-foreground/30 rounded-xl px-4 py-2 bg-transparent">
                      <p className="font-bold text-foreground whitespace-nowrap">{formatPrice(product.price)}</p>
                    </div>
                  )}
                  {(onDeleteItem || onStartEditItem) && product.itemUuid && (
                    <ItemActionButtons
                      className="flex flex-wrap items-center gap-3 mt-3"
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
              </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
