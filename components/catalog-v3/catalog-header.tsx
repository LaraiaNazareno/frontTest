"use client"

import Link from "next/link"

import type { CatalogItem, ViewMode } from "@/lib/catalog-types"
import { Button } from "@/components/ui/button"
import { ProductImage } from "@/components/catalog-v3/product-image"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, LayoutGrid, List, LogOut, MoreHorizontal, Pencil, Plus, Table, Trash2 } from "lucide-react"

type CatalogHeaderProps = {
  hasToken: boolean | null
  selectedCatalog: CatalogItem | null
  catalogs: CatalogItem[]
  selectedCatalogId: string | null
  hasCatalogs: boolean
  deletingCatalog: boolean
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onOpenCreateCatalog: () => void
  onOpenCreateItem: () => void
  onOpenEditCatalog: () => void
  onLogout: () => void
  onDeleteCatalog: () => void
  onSelectCatalog: (id: string) => void
  onExportPdf: () => void
}

export function CatalogHeader({
  hasToken,
  selectedCatalog,
  catalogs,
  selectedCatalogId,
  hasCatalogs,
  deletingCatalog,
  viewMode,
  onViewModeChange,
  onOpenCreateCatalog,
  onOpenCreateItem,
  onOpenEditCatalog,
  onLogout,
  onDeleteCatalog,
  onSelectCatalog,
  onExportPdf,
}: CatalogHeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-3">
              {hasToken && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="lg"
                      className="gap-2 rounded-full px-6 shadow-md shadow-primary/20"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                      Acciones
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="bg-card text-foreground border-border shadow-lg"
                  >
                    <DropdownMenuItem
                      onSelect={onOpenCreateCatalog}
                      className="focus:bg-primary/10 focus:text-foreground"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo catálogo
                    </DropdownMenuItem>
                    {selectedCatalog && (
                      <DropdownMenuItem
                        onSelect={onOpenCreateItem}
                        className="focus:bg-primary/10 focus:text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        Nuevo item
                      </DropdownMenuItem>
                    )}
                    {selectedCatalog && (
                      <DropdownMenuItem
                        onSelect={onOpenEditCatalog}
                        className="focus:bg-primary/10 focus:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar catálogo
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={onLogout}>
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="min-w-[280px] max-w-3xl lg:flex-1 lg:max-w-xl lg:mx-6">
              <div className="mt-3">
                <ProductImage
                  src={selectedCatalog?.logoUrl}
                  alt={selectedCatalog?.title ?? "Logo del catálogo"}
                  className="h-10 w-10 rounded-full border border-border"
                  imageClassName="rounded-full"
                />
              </div>
            </div>

            <div className="flex gap-3 items-center flex-wrap justify-start lg:justify-end">
              <div className="flex items-center gap-2 flex-row-reverse sm:flex-row">
                <ConfirmDialog
                  title="Eliminar catálogo"
                  description={
                    selectedCatalog
                      ? `¿Seguro que querés eliminar "${selectedCatalog.title}"? Esta acción no se puede deshacer.`
                      : "Seleccioná un catálogo para poder eliminarlo."
                  }
                  confirmLabel={deletingCatalog ? "Eliminando..." : "Eliminar"}
                  confirmDisabled={!selectedCatalog || deletingCatalog}
                  onConfirm={onDeleteCatalog}
                  trigger={
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-destructive/40 bg-transparent text-destructive hover:bg-destructive/10"
                      disabled={!selectedCatalog || deletingCatalog}
                      aria-label="Eliminar catálogo"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  }
                />
                <Select
                  value={selectedCatalogId ?? undefined}
                  disabled={!hasCatalogs}
                  onValueChange={(value: string) => onSelectCatalog(value)}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue
                      placeholder={hasCatalogs ? "Selecciona un catálogo" : "Sin catálogos"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {hasCatalogs ? (
                      catalogs.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-catalogs" disabled>
                        No hay catálogos
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  onClick={() => onViewModeChange("cards")}
                  size="lg"
                  className="gap-2 rounded-full px-5"
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span>Tarjetas</span>
                </Button>
                <Button
                  variant={viewMode === "checklist" ? "default" : "outline"}
                  onClick={() => onViewModeChange("checklist")}
                  size="lg"
                  className="gap-2 rounded-full px-5"
                >
                  <List className="h-5 w-5" />
                  <span>Lista</span>
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  onClick={() => onViewModeChange("table")}
                  size="lg"
                  className="gap-2 rounded-full px-5"
                >
                  <Table className="h-5 w-5" />
                  <span>Tabla</span>
                </Button>
              </div>

              <Button
                onClick={onExportPdf}
                size="lg"
                className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90"
              >
                <Download className="h-5 w-5" />
                <span>Exportar PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
