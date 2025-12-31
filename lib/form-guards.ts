"use client"

import { isValidPrice } from "@/lib/catalog-utils"

type ToastArgs = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

type ToastFn = (args: ToastArgs) => void

export const requireToken = (
  toast: ToastFn,
  message = {
    title: "No hay sesión",
    description: "Inicia sesión para continuar.",
  },
) => {
  const token = localStorage.getItem("token")
  if (!token) {
    toast({ ...message, variant: "destructive" })
    return null
  }
  return token
}

export const requireCatalogId = (
  catalogId: string | null,
  toast: ToastFn,
  message = {
    title: "Catálogo inválido",
    description: "No se encontró el catálogo.",
  },
) => {
  if (!catalogId) {
    toast({ ...message, variant: "destructive" })
    return null
  }
  return catalogId
}

export const requireNonEmpty = (
  value: string,
  toast: ToastFn,
  message: { title: string; description: string },
) => {
  const trimmed = value.trim()
  if (!trimmed) {
    toast({ ...message, variant: "destructive" })
    return null
  }
  return trimmed
}

export const requireValidPrice = (
  value: string,
  toast: ToastFn,
  messageEmpty = {
    title: "Falta el precio",
    description: "Ingresa un precio válido.",
  },
  messageInvalid = {
    title: "Precio inválido",
    description: "Usa solo números, por ejemplo 25 o 25.50.",
  },
) => {
  const trimmed = value.trim()
  if (!trimmed) {
    toast({ ...messageEmpty, variant: "destructive" })
    return null
  }
  if (!isValidPrice(trimmed)) {
    toast({ ...messageInvalid, variant: "destructive" })
    return null
  }
  return trimmed
}

export const requireFile = (
  file: File | null,
  toast: ToastFn,
  message: { title: string; description: string },
) => {
  if (!file) {
    toast({ ...message, variant: "destructive" })
    return null
  }
  return file
}

export const normalizeOptionalDescription = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}
