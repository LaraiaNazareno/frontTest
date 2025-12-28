"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useFilePreview } from "@/hooks/use-file-preview"
import { createCatalogItem } from "@/lib/catalog-api"
import { isValidPrice } from "@/lib/catalog-utils"

export default function NewCatalogItemPage() {
  const router = useRouter()
  const params = useParams<{ catalogId: string }>()
  const catalogId = params?.catalogId
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const previewUrl = useFilePreview(imageFile)

  const handleSubmit = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast({
        title: "No hay sesión",
        description: "Inicia sesión para crear items.",
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

    if (!name.trim()) {
      toast({
        title: "Falta el nombre",
        description: "Ingresa un nombre para el item.",
        variant: "destructive",
      })
      return
    }

    if (!price.trim()) {
      toast({
        title: "Falta el precio",
        description: "Ingresa un precio válido.",
        variant: "destructive",
      })
      return
    }
    if (!isValidPrice(price)) {
      toast({
        title: "Precio inválido",
        description: "Usa solo números, por ejemplo 25 o 25.50.",
        variant: "destructive",
      })
      return
    }

    if (!imageFile) {
      toast({
        title: "Falta la imagen",
        description: "Sube una imagen para el item.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await createCatalogItem(token, {
        catalogId,
        name: name.trim(),
        description: description.trim() || undefined,
        price: price.trim(),
        image: imageFile,
      })

      toast({
        title: "Item creado",
        description: "Se agregó el item al catálogo.",
      })

      router.push(`/?catalogId=${catalogId}`)
    } catch (err) {
      toast({
        title: "Error al crear item",
        description: err instanceof Error ? err.message : "No se pudo crear el item.",
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
              <h1 className="text-3xl font-bold text-primary">Nuevo item</h1>
              <p className="text-muted-foreground mt-2">Agrega un producto al catálogo.</p>
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
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            {previewUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Vista previa" className="h-40 w-auto rounded-xl border" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/">Cancelar</Link>
            </Button>
            <Button onClick={handleSubmit} size="lg" disabled={loading}>
              {loading ? "Creando..." : "Crear item"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
