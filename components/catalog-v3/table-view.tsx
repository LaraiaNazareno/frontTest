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
  editDraft?: EditDraft
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
  editDraft,
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
              className={`rounded-2xl border border-border p-4 bg-card/70 ${
                dragOverItemUuid === (product.itemUuid || product.id)
                  ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-1 before:h-0.5 before:bg-primary/70"
                  : ""
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
                    wrapperClassName="flex items-center gap-2"
                    inputClassName="w-28 text-right"
                  />
                ) : (
                  <p className="font-bold text-foreground">${product.price.toLocaleString("es-AR")}</p>
                )}

                {(onDeleteItem || onStartEditItem) && (
                  <ItemActionButtons
                    className="flex items-center gap-2"
                    isEditing={isEditing}
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
                const { isEditing } = getItemEditState(
                  product.itemUuid,
                  editingItemUuid,
                  editDraft,
                  onEditChange,
                )

                return (
                  <tr
                  key={product.id}
                  draggable={Boolean(onDragStart)}
                  onDragStart={() => onDragStart?.(product.itemUuid || product.id)}
                  onDragEnter={() => onDragEnter?.(product.itemUuid || product.id)}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={() => onDrop?.(product.itemUuid || product.id)}
                  className={`border-b border-border hover:bg-muted/20 transition-colors ${
                    dragOverItemUuid === (product.itemUuid || product.id)
                      ? "relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-1 before:h-0.5 before:bg-primary/70"
                      : ""
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
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground max-w-md">{product.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {isEditing && editDraft && onEditChange ? (
                      <ItemPriceEditField
                        editDraft={editDraft}
                        onEditChange={onEditChange}
                        wrapperClassName="flex items-center justify-end gap-2"
                        inputClassName="w-28 text-right"
                      />
                    ) : (
                      <p className="font-bold text-lg text-foreground">${product.price.toLocaleString("es-AR")}</p>
                    )}
                  </td>
                  {(onDeleteItem || onStartEditItem) && (
                    <td className="py-4 px-6 text-right">
                      <ItemActionButtons
                        className="flex items-center justify-end gap-3 mt-2"
                        isEditing={isEditing}
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
