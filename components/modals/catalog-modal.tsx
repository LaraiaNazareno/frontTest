"use client"

import { useEffect, useRef, useState } from "react"

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
  const [isDragging, setIsDragging] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const previewUrl = useFilePreview(logoFile)
  const isTitleValid = title.trim().length >= 2
  const isSubmitDisabled = saving || !isTitleValid

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
      setIsDragging(false)
      setTitleError(false)
    }
  }, [open])

  useEffect(() => {
    if (titleError && title.trim().length >= 2) {
      setTitleError(false)
    }
  }, [title, titleError])

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
    setLogoFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSave = async () => {
    if (saving) {
      return
    }

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
      setTitleError(true)
      return
    }

    if (resolvedTitle.trim().length < 2) {
      toast({
        title: "Nombre muy corto",
        description: "Usa al menos 2 caracteres.",
        variant: "destructive",
      })
      setTitleError(true)
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
    mode === "create"
      ? "Creá un catálogo para exportar a PDF."
      : "Actualiza la información del catálogo."
  const submitLabel =
    mode === "create" ? (saving ? "Creando..." : "Crear catálogo") : saving ? "Guardando..." : "Guardar cambios"

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!saving ? onOpenChange(nextOpen) : null)}>
      <DialogContent className="sm:max-w-2xl border border-border/80 bg-card">
        <DialogHeader className="border-b border-border/80 pb-4">
          <DialogTitle className="text-lg text-foreground">{modalTitle}</DialogTitle>
          <DialogDescription className="text-foreground/70">{modalDescription}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!isSubmitDisabled) {
              void handleSave()
            }
          }}
        >
          <fieldset className="space-y-5" disabled={saving}>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Nombre
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mi catálogo"
                autoFocus
                className={`h-11 text-base ${titleError ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Descripción
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del catálogo"
              />
            </div>
            <details className="rounded-lg border border-border/70 bg-card/40 px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Personalización (opcional)
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            </details>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Imagen (opcional para portada del PDF)
              </label>
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border border-dashed px-4 py-5 text-center text-sm transition-colors ${
                  isDragging
                    ? "border-primary/60 bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <div className="text-sm font-semibold text-foreground">
                  {previewUrl || logoUrl ? "Cambiar imagen" : "Soltá tu imagen acá"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {previewUrl || logoUrl ? "o hacé click para reemplazar" : "o hacé click para subir"}
                </div>
                {(previewUrl || logoUrl) && (
                  <div className="mt-3 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl ?? logoUrl ?? undefined}
                      alt="Vista previa"
                      className="h-16 w-16 rounded-lg border border-border/70 object-cover"
                    />
                  </div>
                )}
                {logoFile && (
                  <div className="mt-2 text-xs text-foreground/80">Archivo: {logoFile.name}</div>
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
          <DialogFooter className="border-t border-border/80 pt-4">
            <Button
              size="lg"
              type="submit"
              disabled={isSubmitDisabled}
              className="bg-primary hover:bg-primary/90 disabled:bg-primary/40"
            >
              {submitLabel}
            </Button>
            <Button variant="outline" size="lg" type="button" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
