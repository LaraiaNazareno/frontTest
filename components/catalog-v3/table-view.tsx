import Image from "next/image"

import type { Product } from "@/lib/catalog-types"

interface TableViewProps {
  products: Product[]
  businessName: string
  backgroundColor?: string
}

export function TableView({ products, businessName, backgroundColor }: TableViewProps) {
  const backgroundStyle = backgroundColor ? { backgroundColor } : undefined

  return (
    <div className="space-y-8">
      <div className="bg-card border-2 border-border rounded-lg overflow-hidden" style={backgroundStyle}>
        <div className="bg-primary/5 border-b-2 border-border px-6 py-4" style={backgroundStyle}>
          <h2 className="text-2xl font-bold text-primary">{businessName}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/30" style={backgroundStyle}>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Imagen</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Producto</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Descripción</th>
                <th className="text-right py-4 px-6 font-semibold text-foreground">Precio</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-border flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-foreground">{product.title}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-muted-foreground max-w-md">{product.description}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-bold text-lg text-foreground">${product.price.toLocaleString("es-AR")}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
