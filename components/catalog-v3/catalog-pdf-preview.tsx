"use client"

import type { Product, ViewMode } from "@/lib/catalog-types"
import { formatPrice } from "@/lib/catalog-utils"
import { TableView } from "@/components/catalog-v3/table-view"

type CatalogPdfPreviewProps = {
  viewMode: ViewMode
  products: Product[]
  businessName: string
  componentColor: string
  pdfContentRef: React.RefObject<HTMLDivElement | null>
}

export function CatalogPdfPreview({
  viewMode,
  products,
  businessName,
  componentColor,
  pdfContentRef,
}: CatalogPdfPreviewProps) {
  return (
    <div className="absolute left-[-10000px] top-0 w-[1024px]" aria-hidden="true">
      <div ref={pdfContentRef} className="container mx-auto px-6 py-12">
        {viewMode === "cards" && (
          <div className="pdf-card-list">
            {products.map((product) => (
              <div key={product.id} className="pdf-card">
                <div className="pdf-card-body">
                  <div>
                    <h3 className="pdf-card-title">{product.title}</h3>
                    <p className="pdf-card-desc">{product.description}</p>
                    <span className="pdf-card-price">{formatPrice(product.price)}</span>
                  </div>
                  <div className="pdf-card-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === "checklist" && (
          <div className="pdf-checklist">
            <div className="pdf-checklist-header">
              <div className="pdf-checklist-title">Productos {businessName}</div>
              <div className="pdf-checklist-subtitle">Catálogo completo con precios</div>
            </div>
            {products.map((product) => (
              <div key={product.id} className="pdf-checklist-item">
                <div className="pdf-checklist-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.title} />
                </div>
                <div>
                  <div className="pdf-checklist-name">{product.title}</div>
                  <div className="pdf-checklist-desc">{product.description}</div>
                </div>
                <div className="pdf-checklist-price">{formatPrice(product.price)}</div>
              </div>
            ))}
          </div>
        )}
        {viewMode === "table" && (
          <div style={{ background: "var(--pdf-card-bg)", padding: "16px", borderRadius: "18px" }}>
            <TableView products={products} businessName={businessName} backgroundColor={componentColor} />
          </div>
        )}
      </div>
    </div>
  )
}
