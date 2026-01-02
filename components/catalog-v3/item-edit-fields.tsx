import { Input } from "@/components/ui/input"

export type EditField = "name" | "description" | "price"
export type EditDraft = { name: string; description: string; price: string }
export type EditChangeHandler = (field: EditField, value: string) => void

type ItemEditFieldProps = {
  field: EditField
  editDraft: EditDraft
  onEditChange: EditChangeHandler
  className?: string
  disabled?: boolean
}

type ItemPriceEditFieldProps = {
  editDraft: EditDraft
  onEditChange: EditChangeHandler
  wrapperClassName?: string
  inputClassName?: string
  currencyLabel?: string
  currencyClassName?: string
  disabled?: boolean
}

export const getItemEditState = (
  itemUuid: string | undefined,
  editingItemUuid: string | null | undefined,
  editDraft: EditDraft | undefined,
  onEditChange: EditChangeHandler | undefined,
) => {
  const isEditing = Boolean(itemUuid && editDraft && onEditChange && editingItemUuid === itemUuid)

  return { isEditing }
}

export function ItemEditField({
  field,
  editDraft,
  onEditChange,
  className,
  disabled,
}: ItemEditFieldProps) {
  return (
    <Input
      value={editDraft[field]}
      onChange={(event) => onEditChange(field, event.target.value)}
      className={className}
      disabled={disabled}
    />
  )
}

export function ItemPriceEditField({
  editDraft,
  onEditChange,
  wrapperClassName,
  inputClassName,
  currencyLabel = "ARS",
  currencyClassName = "text-sm text-muted-foreground",
  disabled,
}: ItemPriceEditFieldProps) {
  return (
    <div className={wrapperClassName}>
      <ItemEditField
        field="price"
        editDraft={editDraft}
        onEditChange={onEditChange}
        className={inputClassName}
        disabled={disabled}
      />
      <span className={currencyClassName}>{currencyLabel}</span>
    </div>
  )
}
