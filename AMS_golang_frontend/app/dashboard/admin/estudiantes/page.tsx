"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { alumnoAPI } from "@/lib/api"
import { Users, Search, UserPlus, Mail, Phone, Pencil, Save, X } from "lucide-react"
import Link from "next/link"

type Alumno = {
  id: number
  nombre: string
  apellido: string
  email: string
  legajo: string
  telefono?: string
}

export default function AdminEstudiantesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState("")
  const [editApellido, setEditApellido] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editLegajo, setEditLegajo] = useState("")
  const [editTelefono, setEditTelefono] = useState("")

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setLoadingData(true)
        const data = await alumnoAPI.getAll()
        setAlumnos(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar estudiantes")
        setAlumnos([])
      } finally {
        setLoadingData(false)
      }
    }

    if (user && user.role === "admin") {
      fetchAlumnos()
    }
  }, [user])

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredStudents = alumnos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.legajo.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Gestión de Estudiantes
            </h1>
            <p className="text-muted-foreground">Administra los estudiantes del sistema</p>
          </div>
          <Link href="/dashboard/admin/usuarios/crear?role=student">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Estudiante
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Estudiantes</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Estudiantes ({filteredStudents.length})</CardTitle>
            <CardDescription>Lista de todos los estudiantes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No se encontraron estudiantes</div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((alumno) => (
                  <div
                    key={alumno.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {editingId === alumno.id ? (
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                          <Input value={editApellido} onChange={(e) => setEditApellido(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={editLegajo} onChange={(e) => setEditLegajo(e.target.value)} />
                          <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-medium text-lg">
                            {alumno.nombre} {alumno.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">Legajo: {alumno.legajo}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{alumno.email}</span>
                          </div>
                          {alumno.telefono && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{alumno.telefono}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 ml-4">
                      {editingId === alumno.id ? (
                        <>
                          <Button onClick={async () => {
                            try {
                              await alumnoAPI.update(alumno.id.toString(), { nombre: editNombre, apellido: editApellido, email: editEmail, legajo: editLegajo, telefono: editTelefono })
                              setAlumnos(alumnos.map(a => a.id === alumno.id ? { ...a, nombre: editNombre, apellido: editApellido, email: editEmail, legajo: editLegajo, telefono: editTelefono } : a))
                              setEditingId(null)
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Error al actualizar estudiante")
                            }
                          }}>
                            <Save className="h-4 w-4 mr-2" />Guardar
                          </Button>
                          <Button variant="outline" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4 mr-2" />Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" onClick={() => {
                            setEditingId(alumno.id)
                            setEditNombre(alumno.nombre)
                            setEditApellido(alumno.apellido)
                            setEditEmail(alumno.email)
                            setEditLegajo(alumno.legajo)
                            setEditTelefono(alumno.telefono || "")
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
