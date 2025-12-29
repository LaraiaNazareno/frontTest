"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegistroPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const handleRegister = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

    setAuthLoading(true)
    setAuthError(null)

    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const message = await response.text().catch(() => "")
        throw new Error(message || "No se pudo crear la cuenta.")
      }

      router.push("/login")
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Error inesperado al crear la cuenta.")
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-primary">Registro</h1>
          <p className="text-muted-foreground mt-2">Crea tu cuenta para administrar catálogos.</p>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 mx-auto">
          <div className="space-y-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />
            <Button onClick={handleRegister} size="lg" className="w-full" disabled={authLoading}>
              {authLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
            {authError && <p className="text-destructive text-sm">{authError}</p>}
            <p className="text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Ir a login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
