import Image from "next/image"

import type { Product } from "@/lib/catalog-types"

interface ChecklistViewProps {
  products: Product[]
  businessName: string
  containerBackgroundColor?: string
}

export function ChecklistView({ products, businessName, containerBackgroundColor }: ChecklistViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="bg-secondary/30 border-2 border-foreground/20 rounded-3xl p-8"
        style={containerBackgroundColor ? { backgroundColor: containerBackgroundColor } : undefined}
      >
        <div>
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2 border-dashed border-foreground/20">
            <h2 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: "cursive" }}>
              Productos {businessName}
            </h2>
            <p className="text-muted-foreground">Catálogo completo con precios</p>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-start gap-6 p-4 rounded-2xl hover:bg-card/50 transition-colors border-2 border-transparent hover:border-primary/20"
              >
                {/* Small thumbnail */}
                <div className="flex-shrink-0">
                  <div className="rounded-xl border-2 border-foreground/20 w-20 h-20 relative overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground mb-1">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>

                {/* Price */}
                <div className="flex-shrink-0">
                <div className="border-2 border-foreground/30 rounded-xl px-4 py-2 bg-transparent">
                  <p className="font-bold text-foreground whitespace-nowrap">{formatPrice(product.price)}</p>
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
