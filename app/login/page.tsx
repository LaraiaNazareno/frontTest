"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { Home } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const handleLogin = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

    setAuthLoading(true)
    setAuthError(null)

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const message = await response.json().catch(() => null)
        const errorText =
          message && typeof message === "object" && "message" in message
            ? String(message.message)
            : await response.text().catch(() => "")
        throw new Error(errorText || "No se pudo iniciar sesion.")
      }

      const data = (await response.json()) as { token?: string }

      if (!data.token) {
        throw new Error("El backend no devolvio token.")
      }

      localStorage.setItem("token", data.token)
      router.push("/")
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error inesperado al iniciar sesion.")
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-end">
          <Button asChild variant="outline" size="icon" aria-label="Volver al menú principal">
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary">Login</h1>
            <p className="text-muted-foreground mt-2">Accede para ver tus catálogos y exportar PDFs.</p>
          </div>
          <div className="space-y-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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
            <Button onClick={handleLogin} size="lg" className="w-full" disabled={authLoading}>
              {authLoading ? "Ingresando..." : "Ingresar"}
            </Button>
            {authError && <p className="text-destructive text-sm">{authError}</p>}
            <p className="text-sm text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link href="/registro" className="text-primary hover:underline">
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
