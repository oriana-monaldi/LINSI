"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { alumnoAPI, profesorAPI, materiaAPI, cursadaAPI } from "@/lib/api"
import { Users, GraduationCap, BookOpen, TrendingUp, UserPlus, Plus, FileText } from "lucide-react"
import Link from "next/link"

type Alumno = {
  id: number
  nombre: string
  apellido: string
  legajo: string
}

type Profesor = {
  id: number
  nombre: string
  apellido: string
}

type Materia = {
  id: number
  nombre: string
  ano_carrera: number
}

type Comision = {
  id: number
  nombre: string
  materia?: Materia
}

type Cursada = {
  id: number
  ano_lectivo: number
  alumno_id: number
  comision_id: number
  alumno?: Alumno
  comision?: Comision
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [cursadas, setCursadas] = useState<Cursada[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const [alumnosData, profesoresData, materiasData, cursadasData] = await Promise.all([
          alumnoAPI.getAll(),
          profesorAPI.getAll(),
          materiaAPI.getAll(),
          cursadaAPI.getAll()
        ])
        setAlumnos(alumnosData || [])
        setProfesores(profesoresData || [])
        setMaterias(materiasData || [])
        setCursadas(cursadasData || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setLoadingData(false)
      }
    }

    if (user && user.role === "admin") {
      fetchData()
    }
  }, [user])

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalStudents = alumnos.length
  const totalTeachers = profesores.length
  const totalMaterias = materias.length
  const totalCursadas = cursadas.length

  const recentCursadas = [...cursadas].slice(-5).reverse()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Administracion</h1>
            <p className="text-muted-foreground">Gestiona el sistema de seguimiento estudiantil</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/admin/usuarios/crear">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </Link>
            <Link href="/dashboard/admin/materias/crear">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Materia
              </Button>
            </Link>
          </div>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Activos en el sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTeachers}</div>
                  <p className="text-xs text-muted-foreground">Docentes registrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Materias</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMaterias}</div>
                  <p className="text-xs text-muted-foreground">Materias disponibles</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cursadas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCursadas}</div>
                  <p className="text-xs text-muted-foreground">Inscripciones activas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rapidas</CardTitle>
                  <CardDescription>Gestion del sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/admin/estudiantes">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Gestionar Estudiantes
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/profesores">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Gestionar Profesores
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/materias">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Gestionar Materias
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/cursadas">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Gestionar Cursadas
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cursadas Recientes</CardTitle>
                  <CardDescription>Ultimas inscripciones realizadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentCursadas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay cursadas registradas</p>
                  ) : (
                    recentCursadas.map((cursada) => (
                      <div
                        key={cursada.id}
                        className="flex items-center justify-between border-l-4 border-primary pl-4 py-2"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {cursada.alumno?.nombre} {cursada.alumno?.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cursada.comision?.materia?.nombre || cursada.comision?.nombre || `Comision ${cursada.comision_id}`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">{cursada.ano_lectivo}</span>
                      </div>
                    ))
                  )}
                  <Link href="/dashboard/admin/cursadas">
                    <Button variant="outline" className="w-full bg-transparent">
                      Ver Todas las Cursadas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Materias del Sistema
                </CardTitle>
                <CardDescription>Vista general de las materias</CardDescription>
              </CardHeader>
              <CardContent>
                {materias.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No hay materias registradas</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {materias.map((materia) => (
                      <Card key={materia.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{materia.nombre}</CardTitle>
                          <CardDescription>Año {materia.ano_carrera}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Link href={`/dashboard/admin/materias/${materia.id}`}>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              Ver Detalles
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
