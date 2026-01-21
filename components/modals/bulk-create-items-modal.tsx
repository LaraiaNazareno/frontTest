"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { createCatalogItemsBulk } from "@/lib/catalog-api"
import { isValidPrice } from "@/lib/catalog-utils"
import { normalizeOptionalDescription, requireCatalogId, requireToken } from "@/lib/form-guards"

const MAX_ITEMS = 20

type BulkItemDraft = {
  id: string
  file: File
  name: string
  description: string
  price: string
}

type BulkCreateItemsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogId: string | null
  onCreated?: () => void | Promise<void>
}

export function BulkCreateItemsModal({ open, onOpenChange, catalogId, onCreated }: BulkCreateItemsModalProps) {
  const [items, setItems] = useState<BulkItemDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) {
      setItems([])
      setSaving(false)
      setIsDragging(false)
    }
  }, [open])

  const previewUrls = useMemo(() => {
    const urls = new Map<string, string>()
    items.forEach((item) => {
      urls.set(item.id, URL.createObjectURL(item.file))
    })
    return urls
  }, [items])

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const canSave = useMemo(() => {
    if (saving || items.length === 0) {
      return false
    }
    return items.every((item) => item.name.trim().length > 0 && isValidPrice(item.price))
  }, [items, saving])

  const setItemField = (id: string, field: "name" | "description" | "price", value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const createDrafts = (files: File[]) =>
    files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
      file,
      name: "",
      description: "",
      price: "",
    }))

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList) {
      return
    }

    const files = Array.from(filesList).filter((file) => file.type.startsWith("image/"))
    if (files.length === 0) {
      toast({
        title: "Formato no válido",
        description: "Sube imágenes en formato JPG, PNG o WebP.",
        variant: "destructive",
      })
      return
    }

    const availableSlots = MAX_ITEMS - items.length
    if (availableSlots <= 0) {
      toast({
        title: "Límite alcanzado",
        description: `Máximo ${MAX_ITEMS} imágenes por carga.`,
        variant: "destructive",
      })
      return
    }

    const selected = files.slice(0, availableSlots)
    if (selected.length < files.length) {
      toast({
        title: "Se excedió el límite",
        description: `Solo se tomarán ${selected.length} imágenes para completar el máximo de ${MAX_ITEMS}.`,
        variant: "destructive",
      })
    }

    setItems((prev) => [...prev, ...createDrafts(selected)])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    handleFiles(event.dataTransfer.files)
  }

  const handleSave = async () => {
    if (saving) {
      return
    }

    const token = requireToken(toast, {
      title: "No hay sesión",
      description: "Inicia sesión para crear items.",
    })
    if (!token) {
      return
    }

    const resolvedCatalogId = requireCatalogId(catalogId, toast)
    if (!resolvedCatalogId) {
      return
    }

    if (items.length === 0) {
      toast({
        title: "Sin items",
        description: "Agrega imágenes para continuar.",
        variant: "destructive",
      })
      return
    }

    const invalidItem = items.find((item) => item.name.trim().length === 0 || !isValidPrice(item.price))
    if (invalidItem) {
      toast({
        title: "Datos incompletos",
        description: "Completa nombre y precio válido en todos los items.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      await createCatalogItemsBulk(token, resolvedCatalogId, {
        items: items.map((item) => ({
          name: item.name.trim(),
          description: normalizeOptionalDescription(item.description),
          price: item.price.trim(),
        })),
        images: items.map((item) => item.file),
      })

      toast({
        title: "Items creados",
        description: `Se cargaron ${items.length} items correctamente.`,
      })

      onOpenChange(false)
      await onCreated?.()
    } catch (err) {
      toast({
        title: "Error al crear items",
        description: err instanceof Error ? err.message : "No se pudieron crear los items.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!saving ? onOpenChange(nextOpen) : null)}>
      <DialogContent className="sm:max-w-5xl border border-border/80 bg-card max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-border/80 pb-4">
          <DialogTitle className="text-lg text-foreground">Carga masiva</DialogTitle>
          <DialogDescription className="text-foreground/70">
            Sube hasta {MAX_ITEMS} imágenes y completa los datos de cada item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 overflow-hidden">
          <fieldset className="space-y-4" disabled={saving}>
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border border-dashed px-4 py-6 text-center text-sm transition-colors ${
                isDragging
                  ? "border-primary/60 bg-primary/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <div className="text-sm font-semibold text-foreground">
                {items.length > 0 ? "Agregar más imágenes" : "Soltá tus imágenes acá"}
              </div>
              <div className="text-xs text-muted-foreground">
                {items.length > 0 ? "o hacé click para sumar" : "o hacé click para subir"}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{items.length}/{MAX_ITEMS} imágenes</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />

            {items.length > 0 && (
              <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row">
                      <div className="flex flex-col gap-2 lg:w-1/4">
                        <div className="text-xs font-semibold uppercase text-foreground/70">Imagen</div>
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrls.get(item.id) ?? ""}
                              alt={item.file.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground break-all">{item.file.name}</div>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                            Nombre
                          </label>
                          <Input
                            value={item.name}
                            onChange={(event) => setItemField(item.id, "name", event.target.value)}
                            placeholder="Nombre del item"
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                            Descripción
                          </label>
                          <Textarea
                            value={item.description}
                            onChange={(event) => setItemField(item.id, "description", event.target.value)}
                            placeholder="Descripción"
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 lg:w-1/5">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                            Precio
                          </label>
                          <div className="inline-flex items-center rounded-md border border-input bg-white px-3">
                            <Input
                              value={item.price}
                              onChange={(event) => setItemField(item.id, "price", event.target.value)}
                              placeholder="25.00"
                              inputMode="decimal"
                              className="h-10 w-28 border-0 bg-transparent px-0 pr-2 shadow-none focus-visible:ring-0 focus-visible:border-0"
                            />
                            <span className="text-xs font-medium text-muted-foreground">ARS</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="self-start"
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </fieldset>
        </div>
        <DialogFooter className="border-t border-border/80 pt-4">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={!canSave}
            className="bg-primary hover:bg-primary/90 disabled:bg-primary/40"
          >
            {saving ? "Creando..." : "Crear items"}
          </Button>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
