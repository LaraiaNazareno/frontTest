"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useFilePreview } from "@/hooks/use-file-preview"
import { createCatalogItem } from "@/lib/catalog-api"
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

  const previewUrl = useFilePreview(imageFile)

  useEffect(() => {
    if (!open) {
      setName("")
      setDescription("")
      setPrice("")
      setImageFile(null)
      setCreating(false)
    }
  }, [open])

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo item</DialogTitle>
          <DialogDescription>Agrega un producto al catálogo.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Silla" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Silla de madera"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Precio</label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25.00"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagen</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Vista previa</p>
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vista previa" className="h-52 w-full rounded-xl object-cover" />
              ) : (
                <div className="flex h-52 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button size="lg" onClick={handleCreate} disabled={creating}>
            {creating ? "Creando..." : "Crear item"}
          </Button>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
