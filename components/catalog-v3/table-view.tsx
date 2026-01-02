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

interface TableViewProps {
  products: Product[]
  businessName: string
  backgroundColor?: string
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

export function TableView({
  products,
  businessName,
  backgroundColor,
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
}: TableViewProps) {
  const backgroundStyle = backgroundColor ? { backgroundColor } : undefined

  return (
    <div className="space-y-8">
      <div className="bg-card border-2 border-border rounded-lg overflow-hidden" style={backgroundStyle}>
        <div className="bg-primary/5 border-b-2 border-border px-6 py-4" style={backgroundStyle}>
          <h2 className="text-2xl font-bold text-primary">{businessName}</h2>
        </div>

        <div className="sm:hidden space-y-4 px-4 py-6">
          {products.map((product) => {
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
              className={`rounded-2xl border border-border p-4 bg-card/70 ${
                dragOverItemUuid === itemUuid
                  ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-1 before:h-0.5 before:bg-primary/70"
                  : ""
              } ${isHighlighted ? "bg-primary/5" : ""} ${
                isEditing ? "bg-muted/20 border-primary/20 border-dashed mb-2" : ""
              }`}
              style={backgroundStyle}
              >
              <div className="flex items-start gap-4">
                <ProductImage
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 rounded-lg border-2 border-border flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {isEditing && editDraft && onEditChange ? (
                    <>
                      <ItemEditField
                        field="name"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                        className="mb-2 h-8 text-sm"
                      />
                      <ItemEditField
                        field="description"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {isEditing && editDraft && onEditChange ? (
                  <ItemPriceEditField
                    editDraft={editDraft}
                    onEditChange={onEditChange}
                    disabled={isSaving}
                    wrapperClassName="flex items-center gap-2"
                    inputClassName="h-8 w-24 text-right text-sm"
                  />
                ) : (
                  <p className="font-bold text-foreground">${product.price.toLocaleString("es-AR")}</p>
                )}

                {(onDeleteItem || onStartEditItem) && (
                  <ItemActionButtons
                    className="flex items-center gap-2"
                    isEditing={isEditing}
                    isSaving={isSaving}
                    isLocked={isLocked}
                    onSave={() => onEditSave?.()}
                    onCancel={() => onEditCancel?.()}
                    onEdit={onStartEditItem && product.itemUuid ? () => onStartEditItem(product) : undefined}
                    onDelete={onDeleteItem && product.itemUuid ? () => onDeleteItem(product.itemUuid!) : undefined}
                    showDrag={Boolean(onDragStart)}
                    showDelete={Boolean(onDeleteItem && product.itemUuid)}
                  />
                )}
              </div>
              </div>
            )
          })}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/30" style={backgroundStyle}>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Imagen</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Nombre</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Descripción</th>
                <th className="text-right py-4 px-6 font-semibold text-foreground">Precio</th>
                {(onDeleteItem || onStartEditItem) && (
                  <th className="text-right py-4 px-6 font-semibold text-foreground">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
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
                  <tr
                  key={product.id}
                  draggable={Boolean(onDragStart)}
                  onDragStart={() => onDragStart?.(itemUuid)}
                  onDragEnter={() => onDragEnter?.(itemUuid)}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={() => onDrop?.(itemUuid)}
                  className={`border-b border-border hover:bg-muted/20 transition-colors ${
                    dragOverItemUuid === itemUuid
                      ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-1 before:h-0.5 before:bg-primary/70"
                      : ""
                  } ${isHighlighted ? "bg-primary/5" : ""} ${
                    isEditing ? "bg-muted/20 border-b-2 border-dashed border-primary/20" : ""
                  }`}
                  >
                  <td className="py-4 px-6">
                    <ProductImage
                      src={product.image}
                      alt={product.title}
                      className="w-20 h-20 rounded-lg border-2 border-border flex-shrink-0"
                    />
                  </td>
                  <td className="py-4 px-6">
                    {isEditing && editDraft && onEditChange ? (
                      <ItemEditField
                        field="name"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="font-semibold text-foreground">{product.title}</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {isEditing && editDraft && onEditChange ? (
                      <ItemEditField
                        field="description"
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground max-w-md">{product.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right align-middle">
                    {isEditing && editDraft && onEditChange ? (
                      <ItemPriceEditField
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        disabled={isSaving}
                        wrapperClassName="flex items-center justify-end gap-2"
                        inputClassName="h-8 w-24 text-right text-sm"
                      />
                    ) : (
                      <p className="font-bold text-lg text-foreground">${product.price.toLocaleString("es-AR")}</p>
                    )}
                  </td>
                  {(onDeleteItem || onStartEditItem) && (
                    <td className="py-4 px-6 text-right align-middle">
                      <ItemActionButtons
                        className="flex items-center justify-end gap-3 mt-2"
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isLocked={isLocked}
                        onSave={() => onEditSave?.()}
                        onCancel={() => onEditCancel?.()}
                        onEdit={onStartEditItem && product.itemUuid ? () => onStartEditItem(product) : undefined}
                        onDelete={onDeleteItem && product.itemUuid ? () => onDeleteItem(product.itemUuid!) : undefined}
                        showDrag={Boolean(onDragStart)}
                        showDelete={Boolean(onDeleteItem && product.itemUuid)}
                      />
                    </td>
                  )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
