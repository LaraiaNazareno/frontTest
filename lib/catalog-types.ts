export type ViewMode = "cards" | "checklist" | "table"

export type CatalogItem = {
  id: string
  title: string
  description: string
  price: string
  logoUrl: string | null
  backgroundColor: string
  componentColor: string | null
}

export type CatalogItemDetail = {
  id: string
  uuid?: string
  catalogId?: string
  name: string
  description: string
  price: string
  image: string | null
}

export type Product = {
  id: string
  itemUuid?: string
  title: string
  description: string
  price: number
  image: string
}
