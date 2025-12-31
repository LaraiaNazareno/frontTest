"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export function CatalogLoginEmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground">Inicia sesión</h2>
      <p className="text-muted-foreground mt-2">
        Necesitas iniciar sesión para ver los catálogos y exportar el PDF.
      </p>
      <Button asChild size="lg" className="mt-4">
        <Link href="/login">Ir a login</Link>
      </Button>
    </div>
  )
}

export function CatalogEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-foreground">No hay catálogos</h2>
      <p className="text-muted-foreground mt-2">
        Crea tu primer catálogo para empezar a cargar productos.
      </p>
      <Button size="lg" className="mt-4" onClick={onCreate}>
        Crear catálogo
      </Button>
    </div>
  )
}

export function CatalogItemsEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-foreground">Este catálogo no tiene items</h2>
      <p className="text-muted-foreground mt-2">
        Crea el primer item para que el catálogo tenga contenido.
      </p>
      <Button size="lg" className="mt-4" onClick={onCreate}>
        Crear item
      </Button>
    </div>
  )
}
