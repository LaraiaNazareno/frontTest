"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { Home } from "lucide-react"
import { requireNonEmpty } from "@/lib/form-guards"

export default function RegistroPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const handleRegister = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

    setAuthLoading(true)
    setAuthError(null)

    try {
      const resolvedEmail = requireNonEmpty(email, (args) => setAuthError(args.description || args.title), {
        title: "Falta el email",
        description: "Ingresa un email válido.",
      })
      if (!resolvedEmail) {
        return
      }

      const resolvedPassword = requireNonEmpty(password, (args) => setAuthError(args.description || args.title), {
        title: "Falta la contraseña",
        description: "Ingresa tu contraseña.",
      })
      if (!resolvedPassword) {
        return
      }

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resolvedEmail, password: resolvedPassword }),
      })

      if (!response.ok) {
        const message = await response.json().catch(() => null)
        const errorText =
          message && typeof message === "object" && "message" in message
            ? String(message.message)
            : await response.text().catch(() => "")
        throw new Error(errorText || "No se pudo crear la cuenta.")
      }

      router.push("/login")
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error inesperado al crear la cuenta.")
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%),radial-gradient(circle_at_right,_rgba(147,197,253,0.2),_transparent_45%)]" />
      <div className="relative border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-end">
          <Button asChild variant="outline" size="icon" aria-label="Volver al menú principal">
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <main className="relative container mx-auto px-6 py-16">
        <div className="max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 mx-auto shadow-xl backdrop-blur">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Crear cuenta</h1>
            <p className="text-muted-foreground mt-2">Crea tu cuenta para administrar catálogos.</p>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresá tu email"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contraseña</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresá tu contraseña"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/login">Ir a login</Link>
              </Button>
              <Button onClick={handleRegister} size="lg" className="flex-1" disabled={authLoading}>
                {authLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </div>
            {authError && <p className="text-destructive text-sm">{authError}</p>}
          </div>
        </div>
      </main>
    </div>
  )
}
