"use client"

import { GripVertical, Pencil, Save, Trash2, X } from "lucide-react"

type ItemActionButtonsProps = {
  isEditing: boolean
  onSave?: () => void
  onCancel?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showDrag?: boolean
  showDelete?: boolean
  className?: string
}

export function ItemActionButtons({
  isEditing,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  showDrag,
  showDelete,
  className,
}: ItemActionButtonsProps) {
  if (isEditing) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50"
        >
          <Save className="h-4 w-4" />
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/40"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className={className}>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/40"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      )}
      {showDrag && (
        <span className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground/70">
          <GripVertical className="h-4 w-4" />
          Mover
        </span>
      )}
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-full border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          aria-label="Eliminar item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
