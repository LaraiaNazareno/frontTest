"use client"

import { useCallback, useRef } from "react"

import type { ViewMode } from "@/lib/catalog-types"
import { exportCatalogPdfHtml } from "@/lib/catalog-api"
import { buildCatalogPdfHtml } from "@/lib/pdf-template"
import { normalizeHexColor } from "@/lib/catalog-utils"
import { requireCatalogId, requireToken } from "@/lib/form-guards"
import { toast } from "@/hooks/use-toast"

type UseExportPdfProps = {
  selectedCatalogId: string | null
  viewMode: ViewMode
  pageBackgroundColor?: string
  componentColor: string
}

export const useExportPdf = ({
  selectedCatalogId,
  viewMode,
  pageBackgroundColor,
  componentColor,
}: UseExportPdfProps) => {
  const pdfContentRef = useRef<HTMLDivElement | null>(null)

  const exportPdf = useCallback(async () => {
    const token = requireToken(toast, {
      title: "No hay sesión",
      description: "Inicia sesión para exportar el PDF.",
    })
    if (!token) {
      return
    }

    const catalogId = requireCatalogId(selectedCatalogId, toast, {
      title: "Catálogo no seleccionado",
      description: "Elegí un catálogo antes de exportar.",
    })
    if (!catalogId) {
      return
    }

    const htmlContent = pdfContentRef.current?.innerHTML?.trim()

    if (!htmlContent) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el HTML del catálogo.",
        variant: "destructive",
      })
      return
    }

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n")
        } catch (err) {
          return ""
        }
      })
      .join("\n")

    const baseHref = window.location.origin
    const fallbackPageBackground = getComputedStyle(document.body).backgroundColor || "#f8fafc"
    const htmlBase = buildCatalogPdfHtml({
      styles,
      htmlContent,
      baseHref,
      pageBackground: pageBackgroundColor ?? fallbackPageBackground,
      componentBackground: componentColor,
    })

    const html = htmlBase
      .replaceAll("../media/", `${baseHref}/media/`)
      .replaceAll("/_nextjs_font/", `${baseHref}/_nextjs_font/`)

    if (!html.includes('id="pdf-root"')) {
      toast({
        title: "Error al exportar",
        description: "No se pudo preparar el HTML del PDF.",
        variant: "destructive",
      })
      return
    }

    const exportToast = toast({
      title: "Exportando PDF...",
      description: "Esto puede tardar unos segundos.",
    })

    try {
      const blob = await exportCatalogPdfHtml(catalogId, token, { html, viewMode })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `catalogo-${catalogId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      exportToast.update({
        id: exportToast.id,
        title: "PDF listo",
        description: "Se descargó el catálogo correctamente.",
      })
    } catch (err) {
      exportToast.update({
        id: exportToast.id,
        title: "Error al exportar",
        description: err instanceof Error ? err.message : "No se pudo exportar el PDF.",
        variant: "destructive",
      })
    }
  }, [selectedCatalogId, viewMode, pageBackgroundColor, componentColor])

  return {
    pdfContentRef,
    exportPdf,
  }
}
