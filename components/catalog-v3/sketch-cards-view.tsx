import Image from "next/image"

import type { Product } from "@/lib/catalog-types"

interface SketchCardsViewProps {
  products: Product[]
  businessName: string
  cardBackgroundColor?: string
}

export function SketchCardsView({ products, businessName, cardBackgroundColor }: SketchCardsViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {products.map((product, index) => {
        const isEven = index % 2 === 0

        return (
          <div
            key={product.id}
            className={`print-card bg-accent/30 border-2 border-foreground/20 rounded-3xl p-6 hover:shadow-xl transition-shadow`}
            style={cardBackgroundColor ? { backgroundColor: cardBackgroundColor } : undefined}
          >
            <div
              className={`flex flex-col ${isEven ? "md:flex-row print:flex-row" : "md:flex-row-reverse print:flex-row-reverse"} gap-6 items-center`}
            >
              {/* Product Info */}
              <div className="flex-1 space-y-3">
                <h3 className="font-bold text-2xl text-foreground leading-tight">{product.title}</h3>

                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

                {/* Price tag */}
                <div className="flex items-center pt-2">
                  <div className="border-2 border-foreground/30 rounded-xl px-4 py-2 bg-transparent">
                    <p className="font-bold text-foreground text-lg">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div className="flex-shrink-0 w-full md:w-64 print-image">
                <div className="rounded-2xl border-2 border-foreground/20 overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
