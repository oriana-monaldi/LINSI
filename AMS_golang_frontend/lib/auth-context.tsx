"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type User = {
  id: number
  email: string
  role: string
  nombre?: string
  apellido?: string
  legajo?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = "http://localhost:8080"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  /* ----------------------------------------------------------
   * Verificar sesión existente
   * ---------------------------------------------------------- */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/whoami`, {
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  /* ----------------------------------------------------------
   * Login REAL (backend Go)
   * ---------------------------------------------------------- */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 👈 FUNDAMENTAL
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) return false

      // Traer usuario autenticado
      const whoami = await fetch(`${API_URL}/auth/whoami`, {
        credentials: "include",
      })

      if (whoami.ok) {
        const data = await whoami.json()
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  /* ----------------------------------------------------------
   * Logout
   * ---------------------------------------------------------- */
  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
