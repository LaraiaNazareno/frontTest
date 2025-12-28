"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ColorPickerField } from "@/components/catalog-v3/color-picker-field"
import { toast } from "@/hooks/use-toast"
import { useFilePreview } from "@/hooks/use-file-preview"
import { fetchCatalogById, updateCatalog, uploadCatalogImages } from "@/lib/catalog-api"
import { normalizeHexColor } from "@/lib/catalog-utils"

export default function EditCatalogPage() {
  const router = useRouter()
  const params = useParams<{ catalogId: string }>()
  const catalogId = params?.catalogId
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [componentColor, setComponentColor] = useState("#FFFFFF")
  const [isPublished, setIsPublished] = useState(true)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const previewUrl = useFilePreview(logoFile)

  useEffect(() => {
    const loadCatalog = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        toast({
          title: "No hay sesión",
          description: "Inicia sesión para editar un catálogo.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (!catalogId) {
        toast({
          title: "Catálogo inválido",
          description: "No se encontró el catálogo.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      try {
        const catalog = await fetchCatalogById(catalogId, token)
        setTitle(catalog.title ?? "")
        setDescription(catalog.description ?? "")
        setBackgroundColor(normalizeHexColor(catalog.backgroundColor) ?? "#FFFFFF")
        setComponentColor(normalizeHexColor(catalog.componentColor) ?? "#FFFFFF")
        setIsPublished(Boolean(catalog.isPublished))
        setLogoUrl(catalog.logoUrl ?? null)
      } catch (err) {
        toast({
          title: "Error al cargar catálogo",
          description: err instanceof Error ? err.message : "No se pudo cargar el catálogo.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [catalogId])

  const handleSubmit = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para editar un catálogo.",
        variant: "destructive",
      })
      return
    }

    if (!catalogId) {
      toast({
        title: "Catálogo inválido",
        description: "No se encontró el catálogo.",
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

    setSaving(true)

    try {
      let nextLogoUrl = logoUrl

      if (logoFile) {
        const uploadResponse = await uploadCatalogImages(catalogId, token, [logoFile])
        const uploaded = uploadResponse as { images?: Array<{ url?: string; imageUrl?: string }> }
        nextLogoUrl = uploaded.images?.[0]?.url || uploaded.images?.[0]?.imageUrl || nextLogoUrl
      }

      await updateCatalog(catalogId, token, {
        title: title.trim(),
        description: description.trim() || undefined,
        backgroundColor: normalizeHexColor(backgroundColor),
        componentColor: normalizeHexColor(componentColor),
        isPublished,
        logoUrl: nextLogoUrl || undefined,
      })

      toast({
        title: "Catálogo actualizado",
        description: "Los cambios se guardaron correctamente.",
      })

      router.push(`/?catalogId=${catalogId}`)
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: err instanceof Error ? err.message : "No se pudo actualizar el catálogo.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-primary">Editar catálogo</h1>
              <p className="text-muted-foreground mt-2">Actualiza la información del catálogo.</p>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Volver</Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 space-y-6 mx-auto">
          {loading ? (
            <p className="text-muted-foreground">Cargando catálogo...</p>
          ) : (
            <>
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
                <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                {previewUrl ? (
                  <div className="mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Vista previa" className="h-40 w-auto rounded-xl border" />
                  </div>
                ) : (
                  logoUrl && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="Logo actual" className="h-40 w-auto rounded-xl border" />
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmit} size="lg" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">Cancelar</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
