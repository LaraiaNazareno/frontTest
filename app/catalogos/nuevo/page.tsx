"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { createCatalog, updateCatalog, uploadCatalogImages } from "@/lib/catalog-api"
import { normalizeHexColor } from "@/lib/catalog-utils"

type UploadedImage = {
  url?: string
  imageUrl?: string
  path?: string
  location?: string
}

const getUploadedImageUrl = (data: unknown) => {
  if (!data || typeof data !== "object") {
    return null
  }

  const record = data as { images?: UploadedImage[] }
  const first = record.images?.[0]
  return first?.url || first?.imageUrl || first?.path || first?.location || null
}

export default function NewCatalogPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [componentColor, setComponentColor] = useState("#F2BADE")
  const [isPublished, setIsPublished] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const previewUrl = useMemo(() => {
    if (!logoFile) {
      return null
    }
    return URL.createObjectURL(logoFile)
  }, [logoFile])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleSubmit = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para crear un catálogo.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Falta el título",
        description: "Ingresa un título para el catálogo.",
        variant: "destructive",
      })
      return
    }

    if (!logoFile) {
      toast({
        title: "Falta la imagen",
        description: "Sube una imagen para el catálogo.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const catalog = await createCatalog(token, {
        title: title.trim(),
        description: description.trim() || undefined,
        backgroundColor: normalizeHexColor(backgroundColor),
        componentColor: normalizeHexColor(componentColor),
        isPublished,
      })

      const uploadResponse = await uploadCatalogImages(catalog.id, token, [logoFile])
      const logoUrl = getUploadedImageUrl(uploadResponse)

      if (logoUrl) {
        await updateCatalog(catalog.id, token, { logoUrl })
      }

      toast({
        title: "Catálogo creado",
        description: "Se creó el catálogo correctamente.",
      })

      router.push("/")
    } catch (err) {
      toast({
        title: "Error al crear catálogo",
        description: err instanceof Error ? err.message : "No se pudo crear el catálogo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-primary">Nuevo catálogo</h1>
              <p className="text-muted-foreground mt-2">Crea un catálogo y sube su imagen.</p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Volver</Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 space-y-6 mx-auto">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color de fondo</label>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border shadow-sm">
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: backgroundColor }}
                  />
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </label>
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="font-mono uppercase tracking-wide"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Color de componente</label>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border shadow-sm">
                  <span
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: componentColor }}
                  />
                  <input
                    type="color"
                    value={componentColor}
                    onChange={(e) => setComponentColor(e.target.value)}
                    className="h-full w-full cursor-pointer opacity-0"
                  />
                </label>
                <Input
                  value={componentColor}
                  onChange={(e) => setComponentColor(e.target.value)}
                  placeholder="#F2BADE"
                  className="font-mono uppercase tracking-wide"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <label htmlFor="isPublished" className="text-sm text-foreground">
              Publicar catálogo
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Imagen</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            {previewUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Vista previa" className="h-40 w-auto rounded-xl border" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} size="lg" disabled={loading}>
              {loading ? "Creando..." : "Crear catálogo"}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Cancelar</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
