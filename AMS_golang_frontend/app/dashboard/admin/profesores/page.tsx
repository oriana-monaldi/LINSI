"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { profesorAPI } from "@/lib/api"
import { GraduationCap, Search, UserPlus, Mail, Phone, Pencil } from "lucide-react"
import Link from "next/link"

type Profesor = {
  id: number
  nombre: string
  apellido: string
  email: string
  legajo: string
  telefono?: string
}

export default function AdminProfesoresPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        setLoadingData(true)
        const data = await profesorAPI.getAll()
        setProfesores(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar profesores")
        setProfesores([])
      } finally {
        setLoadingData(false)
      }
    }

    if (user && user.role === "admin") {
      fetchProfesores()
    }
  }, [user])

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredProfesores = profesores.filter(
    (profesor) =>
      profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profesor.legajo.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Gestión de Profesores
            </h1>
            <p className="text-muted-foreground">Administra los profesores del sistema</p>
          </div>
          <Link href="/dashboard/admin/usuarios/crear?role=teacher">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Profesor
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Profesores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido o legajo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professors List */}
        <Card>
          <CardHeader>
            <CardTitle>Profesores ({filteredProfesores.length})</CardTitle>
            <CardDescription>Lista de todos los profesores registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : filteredProfesores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No se encontraron profesores</div>
            ) : (
              <div className="space-y-3">
                {filteredProfesores.map((profesor) => (
                  <div
                    key={profesor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium text-lg">
                          Prof. {profesor.nombre} {profesor.apellido}
                        </p>
                        <p className="text-sm text-muted-foreground">Legajo: {profesor.legajo}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{profesor.email}</span>
                        </div>
                        {profesor.telefono && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{profesor.telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link href={`/dashboard/admin/usuarios/crear?role=teacher&id=${profesor.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
