"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ColorPickerField } from "@/components/catalog-v3/color-picker-field"
import { toast } from "@/hooks/use-toast"
import { useFilePreview } from "@/hooks/use-file-preview"
import { createCatalog, updateCatalog, uploadCatalogImages } from "@/lib/catalog-api"
import { normalizeHexColor } from "@/lib/catalog-utils"
import type { CatalogItem } from "@/lib/catalog-types"
import { normalizeOptionalDescription, requireFile, requireNonEmpty, requireToken } from "@/lib/form-guards"

type CatalogModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  catalog?: CatalogItem | null
  onCreated?: (catalogId: string) => void | Promise<void>
  onUpdated?: () => void | Promise<void>
}

export function CatalogModal({
  open,
  onOpenChange,
  mode,
  catalog = null,
  onCreated,
  onUpdated,
}: CatalogModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [componentColor, setComponentColor] = useState("#F2BADE")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const previewUrl = useFilePreview(logoFile)

  useEffect(() => {
    if (!open) {
      return
    }

    if (mode === "edit" && catalog) {
      setTitle(catalog.title ?? "")
      setDescription(catalog.description ?? "")
      setBackgroundColor(normalizeHexColor(catalog.backgroundColor) ?? "#FFFFFF")
      setComponentColor(normalizeHexColor(catalog.componentColor) ?? "#F2BADE")
      setLogoUrl(catalog.logoUrl ?? null)
      setLogoFile(null)
      return
    }

    setTitle("")
    setDescription("")
    setBackgroundColor("#FFFFFF")
    setComponentColor("#F2BADE")
    setLogoUrl(null)
    setLogoFile(null)
  }, [open, mode, catalog])

  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setBackgroundColor("#FFFFFF")
      setComponentColor("#F2BADE")
      setLogoUrl(null)
      setLogoFile(null)
      setSaving(false)
    }
  }, [open])

  const handleSave = async () => {
    const token = requireToken(toast, {
      title: "No hay sesión",
      description: "Inicia sesión para editar un catálogo.",
    })
    if (!token) {
      return
    }

    if (mode === "edit" && !catalog?.id) {
      toast({
        title: "Catálogo inválido",
        description: "No se encontró el catálogo.",
        variant: "destructive",
      })
      return
    }

    const resolvedTitle = requireNonEmpty(title, toast, {
      title: "Falta el título",
      description: "Ingresa un título para el catálogo.",
    })
    if (!resolvedTitle) {
      return
    }

    const resolvedLogoFile =
      mode === "create"
        ? requireFile(logoFile, toast, {
            title: "Falta la imagen",
            description: "Sube una imagen para el catálogo.",
          })
        : logoFile
    if (mode === "create" && !resolvedLogoFile) {
      return
    }

    setSaving(true)

    try {
      if (mode === "create") {
        const created = await createCatalog(token, {
          title: resolvedTitle,
          description: normalizeOptionalDescription(description) ?? undefined,
          backgroundColor: normalizeHexColor(backgroundColor) ?? undefined,
          componentColor: normalizeHexColor(componentColor) ?? undefined,
        })

        const uploadResponse = await uploadCatalogImages(created.id, token, [resolvedLogoFile!])
        const uploaded = uploadResponse as {
          images?: Array<{ url?: string; imageUrl?: string; path?: string; location?: string }>
        }
        const logo =
          uploaded.images?.[0]?.url ||
          uploaded.images?.[0]?.imageUrl ||
          uploaded.images?.[0]?.path ||
          uploaded.images?.[0]?.location ||
          null

        if (logo) {
          await updateCatalog(created.id, token, { logoUrl: logo })
        }

        toast({
          title: "Catálogo creado",
          description: "Se creó el catálogo correctamente.",
        })

        onOpenChange(false)
        await onCreated?.(created.id)
        return
      }

      let nextLogoUrl = logoUrl

      if (logoFile && catalog?.id) {
        const uploadResponse = await uploadCatalogImages(catalog.id, token, [logoFile])
        const uploaded = uploadResponse as {
          images?: Array<{ url?: string; imageUrl?: string; path?: string; location?: string }>
        }
        nextLogoUrl =
          uploaded.images?.[0]?.url ||
          uploaded.images?.[0]?.imageUrl ||
          uploaded.images?.[0]?.path ||
          uploaded.images?.[0]?.location ||
          nextLogoUrl
      }

      if (catalog?.id) {
        await updateCatalog(catalog.id, token, {
        title: resolvedTitle,
        description: normalizeOptionalDescription(description) ?? undefined,
          backgroundColor: normalizeHexColor(backgroundColor) ?? undefined,
          componentColor: normalizeHexColor(componentColor) ?? undefined,
          logoUrl: nextLogoUrl || undefined,
        })
      }

      toast({
        title: "Catálogo actualizado",
        description: "Los cambios se guardaron correctamente.",
      })

      onOpenChange(false)
      await onUpdated?.()
    } catch (err) {
      toast({
        title: mode === "create" ? "Error al crear catálogo" : "Error al guardar",
        description:
          err instanceof Error
            ? err.message
            : mode === "create"
            ? "No se pudo crear el catálogo."
            : "No se pudo actualizar el catálogo.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const modalTitle = mode === "create" ? "Nuevo catálogo" : "Editar catálogo"
  const modalDescription =
    mode === "create" ? "Crea un catálogo y sube su imagen." : "Actualiza la información del catálogo."
  const submitLabel =
    mode === "create" ? (saving ? "Creando..." : "Crear catálogo") : saving ? "Guardando..." : "Guardar cambios"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 sm:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mi catálogo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del catálogo"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorPickerField
                label="Color de fondo"
                value={backgroundColor}
                placeholder="#FFFFFF"
                onChange={setBackgroundColor}
              />
              <ColorPickerField
                label="Color de componente"
                value={componentColor}
                placeholder="#F2BADE"
                onChange={setComponentColor}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Imagen</label>
              <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Vista previa</p>
            <div className="rounded-2xl border border-border bg-card/70 p-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vista previa" className="h-56 w-full rounded-xl object-cover" />
              ) : logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo actual" className="h-56 w-full rounded-xl object-cover" />
              ) : (
                <div className="flex h-56 w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button size="lg" onClick={handleSave} disabled={saving}>
            {submitLabel}
          </Button>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
