import type { CatalogItem, CatalogItemDetail, ViewMode } from "@/lib/catalog-types"

const DEFAULT_API_BASE_URL = "http://localhost:3001"

export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL

const readErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const data = (await response.json().catch(() => null)) as
      | { message?: string; error?: string }
      | null
    if (data?.message) {
      return data.message
    }
    if (data?.error) {
      return data.error
    }
  }

  const message = await response.text().catch(() => "")
  if (message.includes("<!DOCTYPE") || message.includes("<html")) {
    return "El servidor devolvió una respuesta inválida."
  }
  return message || "Error inesperado en la respuesta."
}

export const fetchCatalogs = async (token: string) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/catalogos?page=1&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const data = (await response.json()) as { items: CatalogItem[] }
  return data.items
}

export const fetchCatalogItems = async (catalogId: string, token: string) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/items?catalogoId=${catalogId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const data = await response.json()
  if (Array.isArray(data)) {
    return data as CatalogItemDetail[]
  }
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: CatalogItemDetail[] }).items
  }
  if (data && typeof data === "object" && "id" in data) {
    return [data as CatalogItemDetail]
  }
  return []
}

export const updateCatalogItem = async (
  itemUuid: string,
  token: string,
  payload: {
    catalogId: string
    name?: string
    description?: string
    price?: string
  },
) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/items/${encodeURIComponent(itemUuid)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      catalogoId: payload.catalogId,
      name: payload.name,
      description: payload.description,
      price: payload.price,
    }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json()
}

export const deleteCatalogItem = async (
  itemUuid: string,
  token: string,
  catalogId: string,
) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/items/${encodeURIComponent(itemUuid)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ catalogoId: catalogId }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  if (response.status === 204) {
    return { ok: true }
  }
  const text = await response.text().catch(() => "")
  if (!text) {
    return { ok: true }
  }
  try {
    return JSON.parse(text)
  } catch (err) {
    return { ok: true }
  }
}

export const reorderCatalogItemPosition = async (
  itemUuid: string,
  catalogId: string,
  newPosition: number,
  token: string,
) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/items/${encodeURIComponent(itemUuid)}/position`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      catalogoId: catalogId,
      newPosition,
    }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json().catch(() => ({ ok: true }))
}

export const exportCatalogPdfHtml = async (
  catalogId: string,
  token: string,
  payload: { html: string; viewMode: ViewMode },
) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/catalogos/${catalogId}/pdf/html`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.blob()
}

export const createCatalog = async (
  token: string,
  payload: {
    title: string
    description?: string
    logoUrl?: string | null
    backgroundColor?: string | null
    componentColor?: string | null
    isPublished?: boolean
  },
) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/catalogos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as CatalogItem
}

export const updateCatalog = async (
  catalogId: string,
  token: string,
  payload: Partial<CatalogItem>,
) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/catalogos/${catalogId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as CatalogItem
}

export const deleteCatalog = async (catalogId: string, token: string) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/catalogos/${encodeURIComponent(catalogId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  if (response.status === 204) {
    return { ok: true }
  }
  const text = await response.text().catch(() => "")
  if (!text) {
    return { ok: true }
  }
  try {
    return JSON.parse(text)
  } catch (err) {
    return { ok: true }
  }
}

export const fetchCatalogById = async (catalogId: string, token: string) => {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/catalogos/${catalogId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as CatalogItem
}

export const uploadCatalogImages = async (
  catalogId: string,
  token: string,
  files: File[],
) => {
  const baseUrl = getApiBaseUrl()
  const formData = new FormData()
  formData.append("catalogoId", catalogId)
  files.forEach((file) => formData.append("images", file))

  const response = await fetch(`${baseUrl}/api/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json()
}

export const createCatalogItem = async (
  token: string,
  payload: {
    catalogId: string
    name: string
    description?: string
    price: string
    image: File
  },
) => {
  const baseUrl = getApiBaseUrl()
  const formData = new FormData()
  formData.append("catalogoId", payload.catalogId)
  formData.append("name", payload.name)
  formData.append("description", payload.description ?? "")
  formData.append("price", payload.price)
  formData.append("image", payload.image)

  const response = await fetch(`${baseUrl}/api/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json()
}
