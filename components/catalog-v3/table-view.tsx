import Image from "next/image"
import { GripVertical, Pencil, Save, Trash2, X } from "lucide-react"

import type { Product } from "@/lib/catalog-types"
import { Input } from "@/components/ui/input"

interface TableViewProps {
  products: Product[]
  businessName: string
  backgroundColor?: string
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
          {products.map((product) => (
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
                <div className="w-16 h-16 relative rounded-lg overflow-hidden border-2 border-border flex-shrink-0">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
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
                      <p className="font-semibold text-foreground">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editDraft.price}
                      onChange={(e) => onEditChange("price", e.target.value)}
                      className="w-28 text-right"
                    />
                    <span className="text-sm text-muted-foreground">ARS</span>
                  </div>
                ) : (
                  <p className="font-bold text-foreground">${product.price.toLocaleString("es-AR")}</p>
                )}

                {(onDeleteItem || onStartEditItem) && (
                  <div className="flex items-center gap-2">
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
                        {onStartEditItem && product.itemUuid && (
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
                        {onDeleteItem && product.itemUuid && (
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

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/30" style={backgroundStyle}>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Imagen</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Producto</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Descripción</th>
                <th className="text-right py-4 px-6 font-semibold text-foreground">Precio</th>
                {(onDeleteItem || onStartEditItem) && (
                  <th className="text-right py-4 px-6 font-semibold text-foreground">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
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
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-border flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                      <Input
                        value={editDraft.name}
                        onChange={(e) => onEditChange("name", e.target.value)}
                      />
                    ) : (
                      <p className="font-semibold text-foreground">{product.title}</p>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                      <Input
                        value={editDraft.description}
                        onChange={(e) => onEditChange("description", e.target.value)}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground max-w-md">{product.description}</p>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {editingItemUuid === product.itemUuid && editDraft && onEditChange ? (
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          value={editDraft.price}
                          onChange={(e) => onEditChange("price", e.target.value)}
                          className="w-28 text-right"
                        />
                        <span className="text-sm text-muted-foreground">ARS</span>
                      </div>
                    ) : (
                      <p className="font-bold text-lg text-foreground">${product.price.toLocaleString("es-AR")}</p>
                    )}
                  </td>
                  {(onDeleteItem || onStartEditItem) && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 mt-2">
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
                            {onStartEditItem && product.itemUuid && (
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
                            {onDeleteItem && product.itemUuid && (
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
