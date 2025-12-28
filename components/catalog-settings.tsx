"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react"

interface CatalogSettingsProps {
  catalogName: string
  businessName: string
  onCatalogNameChange: (name: string) => void
  onBusinessNameChange: (name: string) => void
}

export function CatalogSettings({
  catalogName,
  businessName,
  onCatalogNameChange,
  onBusinessNameChange,
}: CatalogSettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuración del Catálogo</DialogTitle>
          <DialogDescription>Personaliza la información de tu catálogo</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="catalog-name">Nombre del Catálogo</Label>
            <Input
              id="catalog-name"
              value={catalogName}
              onChange={(e) => onCatalogNameChange(e.target.value)}
              placeholder="Ej: Catálogo Verano 2024"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-name">Nombre del Negocio</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              placeholder="Ej: Mi Tienda"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
