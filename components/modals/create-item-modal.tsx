"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useFilePreview } from "@/hooks/use-file-preview"
import { createCatalogItem } from "@/lib/catalog-api"
import { isValidPrice } from "@/lib/catalog-utils"
import {
  normalizeOptionalDescription,
  requireCatalogId,
  requireFile,
  requireNonEmpty,
  requireToken,
  requireValidPrice,
} from "@/lib/form-guards"

type CreateItemModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogId: string | null
  onCreated?: () => void | Promise<void>
}

export function CreateItemModal({ open, onOpenChange, catalogId, onCreated }: CreateItemModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const previewUrl = useFilePreview(imageFile)
  const isNameValid = name.trim().length > 0
  const isPriceValid = isValidPrice(price)
  const isCreateDisabled = creating || !isNameValid || !isPriceValid

  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
      setPrice("")
      setImageFile(null)
      setCreating(false)
      setIsDragging(false)
    }
  }, [open])

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      return
    }
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato no válido",
        description: "Sube una imagen en formato JPG, PNG o WebP.",
        variant: "destructive",
      })
      return
    }
    setImageFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCreate = async () => {
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

    const resolvedName = requireNonEmpty(name, toast, {
      title: "Falta el nombre",
      description: "Ingresa un nombre para el item.",
    })
    if (!resolvedName) {
      return
    }

    const resolvedPrice = requireValidPrice(price, toast)
    if (!resolvedPrice) {
      return
    }

    const resolvedImage = requireFile(imageFile, toast, {
      title: "Falta la imagen",
      description: "Sube una imagen para el item.",
    })
    if (!resolvedImage) {
      return
    }

    setCreating(true)

    try {
      await createCatalogItem(token, {
        catalogId: resolvedCatalogId,
        name: resolvedName,
        description: normalizeOptionalDescription(description),
        price: resolvedPrice,
        image: resolvedImage,
      })

      toast({
        title: "Item creado",
        description: "Se agregó el item al catálogo.",
      })

      onOpenChange(false)
      await onCreated?.()
    } catch (err) {
      toast({
        title: "Error al crear item",
        description: err instanceof Error ? err.message : "No se pudo crear el item.",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!creating ? onOpenChange(nextOpen) : null)}>
      <DialogContent className="sm:max-w-3xl border border-border/80 bg-card">
        <DialogHeader className="border-b border-border/80 pb-4">
          <DialogTitle className="text-lg text-foreground">Nuevo item</DialogTitle>
          <DialogDescription className="text-foreground/70">
            Agrega un producto al catálogo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <fieldset className="space-y-5" disabled={creating}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Nombre
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Silla"
                className="h-12 text-lg"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Descripción
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Silla de madera"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Precio
              </label>
              <div className="inline-flex items-center rounded-md border border-input bg-background px-3">
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25.00"
                  inputMode="decimal"
                  className="h-10 w-28 border-0 bg-transparent px-0 pr-2 shadow-none focus-visible:ring-0 focus-visible:border-0"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  ARS
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Imagen
              </label>
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
                  {previewUrl ? "Cambiar imagen" : "Soltá tu imagen acá"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {previewUrl ? "o hacé click para reemplazar" : "o hacé click para subir"}
                </div>
                {previewUrl && (
                  <div className="mt-3 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="h-16 w-16 rounded-lg border border-border/70 object-cover"
                    />
                  </div>
                )}
                {imageFile && (
                  <div className="mt-2 text-xs text-foreground/80">Archivo: {imageFile.name}</div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
            </div>
          </fieldset>
        </div>
        <DialogFooter className="border-t border-border/80 pt-4">
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={isCreateDisabled}
            className="bg-primary hover:bg-primary/90 disabled:bg-primary/40"
          >
            {creating ? "Creando..." : "Crear item"}
          </Button>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
