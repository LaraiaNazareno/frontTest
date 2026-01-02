"use client"

import type { CatalogItem, ViewMode } from "@/lib/catalog-types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Download,
  LayoutGrid,
  List,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Table,
  Trash2,
} from "lucide-react"

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
      <div className="container mx-auto px-10 py-5">
        <div className="flex min-h-[60px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {hasToken && (
              <DropdownMenu>
                <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      aria-label="Más acciones"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={6}>
                    Acciones del catálogo
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="end"
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
                      onSelect={onOpenEditCatalog}
                      className="focus:bg-primary/10 focus:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar catálogo
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
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
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={(event) => event.preventDefault()}
                        disabled={!selectedCatalog || deletingCatalog}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar catálogo
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem variant="destructive" onSelect={onLogout}>
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <span className="text-sm text-muted-foreground">Catálogo:</span>
            <Select
              value={selectedCatalogId ?? undefined}
              disabled={!hasCatalogs}
              onValueChange={(value: string) => onSelectCatalog(value)}
            >
              <SelectTrigger className="h-9 w-64 rounded-full bg-background">
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

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="flex items-center gap-1 rounded-full bg-transparent p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("cards")}
                className={cn(
                  "h-8 rounded-full px-3 text-muted-foreground/60 hover:text-foreground",
                  viewMode === "cards"
                    ? "bg-muted/20 text-foreground hover:bg-muted/30"
                    : "hover:bg-muted/10"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Tarjetas</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("checklist")}
                className={cn(
                  "h-8 rounded-full px-3 text-muted-foreground/60 hover:text-foreground",
                  viewMode === "checklist"
                    ? "bg-muted/20 text-foreground hover:bg-muted/30"
                    : "hover:bg-muted/10"
                )}
              >
                <List className="h-4 w-4" />
                <span>Lista</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange("table")}
                className={cn(
                  "h-8 rounded-full px-3 text-muted-foreground/60 hover:text-foreground",
                  viewMode === "table"
                    ? "bg-muted/20 text-foreground hover:bg-muted/30"
                    : "hover:bg-muted/10"
                )}
              >
                <Table className="h-4 w-4" />
                <span>Tabla</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={onExportPdf} size="default" className="gap-2 rounded-full px-5">
                <Download className="h-4 w-4" />
                <span>Exportar PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
