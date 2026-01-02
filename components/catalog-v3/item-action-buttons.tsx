"use client"

import { GripVertical, Pencil, Save, Trash2 } from "lucide-react"

type ItemActionButtonsProps = {
  isEditing: boolean
  isSaving?: boolean
  isLocked?: boolean
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
  isSaving,
  isLocked,
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
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/10 disabled:opacity-60"
          disabled={isSaving}
        >
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
          className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/10 disabled:opacity-60"
          disabled={isSaving || isLocked}
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      )}
      {showDrag && (
        <span
          className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground/70 ${
            isLocked ? "opacity-50" : ""
          }`}
        >
          <GripVertical className="h-4 w-4" />
          Mover
        </span>
      )}
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-full px-2.5 py-1.5 text-destructive/80 hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
          disabled={isSaving || isLocked}
          aria-label="Eliminar item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
