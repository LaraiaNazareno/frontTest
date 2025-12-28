import type { CatalogItemDetail, Product } from "@/lib/catalog-types"

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price)

export const normalizeHexColor = (value?: string | null) => {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)
    ? trimmed
    : null
}

export const mapItemDetailsToProducts = (items: CatalogItemDetail[]): Product[] =>
  items.map((item) => {
    const price = Number.parseFloat(item.price)

    return {
      id: item.id,
      itemUuid: item.uuid || item.id,
      title: item.name,
      description: item.description,
      price: Number.isNaN(price) ? 0 : price,
      image: item.image || "/placeholder.svg",
    }
  })

export const isValidPrice = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim())
