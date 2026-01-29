"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cursadaAPI, entregaTPAPI, notificacionAPI } from "@/lib/api"
import { Calendar, FileText, TrendingUp, Clock, CheckCircle2, AlertCircle, BookOpen, Award, Bell } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface Materia {
  id: number
  nombre: string
  ano_carrera: number
}

interface Comision {
  id: number
  nombre: string
  horarios: string
  materia_id: number
  materia: Materia
}

interface Cursada {
  id: number
  ano_lectivo: number
  nota_final: number | null
  nota_conceptual: number | null
  feedback: string
  alumno_id: number
  comision_id: number
  comision: Comision
}

interface TP {
  id: number
  consigna: string
  fecha_entrega: string
  vigente: boolean
  nota: number | null
  devolucion: string
  comision_id: number
  comision: Comision
}

interface EntregaTP {
  id: number
  tp_id: number
  alumno_id: number
  cursada_id: number
  archivo_url: string
  fecha_entrega: string
  nota: number | null
  devolucion: string
  estado: string
  tp: TP
  cursada: Cursada
}

interface Notificacion {
  id: number
  mensaje: string
  fecha_hora: string
  leida: boolean
  alumno_id: number
}

export default function StudentDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [cursadas, setCursadas] = useState<Cursada[]>([])
  const [entregas, setEntregas] = useState<EntregaTP[]>([])
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "student" && user.role !== "alumno"))) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return

      setDataLoading(true)
      setError(null)

      try {
        const [cursadasData, entregasData, notificacionesData] = await Promise.all([
          cursadaAPI.getByAlumno(String(user.id)),
          entregaTPAPI.getMine(),
          notificacionAPI.getByAlumno(String(user.id)),
        ])

        setCursadas(cursadasData || [])
        setEntregas(entregasData || [])
        setNotificaciones(notificacionesData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setDataLoading(false)
      }
    }

    if (user && (user.role === "student" || user.role === "alumno")) {
      fetchData()
    }
  }, [user])

  if (isLoading || !user || (user.role !== "student" && user.role !== "alumno")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </DashboardLayout>
    )
  }

  const pendingEntregas = entregas.filter((e) => e.estado === "pendiente")
  const completedEntregas = entregas.filter((e) => e.estado === "calificado")
  const upcomingEntregas = entregas
    .filter((e) => e.tp && new Date(e.tp.fecha_entrega) > new Date() && e.estado === "pendiente")
    .slice(0, 3)

  const allGrades = completedEntregas.filter((e) => e.nota !== null).map((e) => e.nota!)
  const averageGrade =
    allGrades.length > 0 ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1) : "N/A"

  const recentNotifications = notificaciones.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido, {user.nombre} {user.apellido}
          </h1>
          <p className="text-muted-foreground">Legajo: {user.legajo}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TPs Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEntregas.length}</div>
              <p className="text-xs text-muted-foreground">Por entregar o calificar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TPs Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedEntregas.length}</div>
              <p className="text-xs text-muted-foreground">Con calificación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materias Cursando</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cursadas.length}</div>
              <p className="text-xs text-muted-foreground">Año lectivo {new Date().getFullYear()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Entregas
              </CardTitle>
              <CardDescription>Trabajos prácticos con fecha de entrega próxima</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEntregas.length > 0 ? (
                upcomingEntregas.map((entrega) => {
                  const daysUntil = Math.ceil(
                    (new Date(entrega.tp.fecha_entrega).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )

                  return (
                    <div key={entrega.id} className="flex items-start justify-between border-l-4 border-primary pl-4 py-2">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm">{entrega.tp.comision?.materia?.nombre || entrega.tp.comision?.nombre}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entrega.tp.consigna}</p>
                        <p className="text-xs text-muted-foreground">
                          Entrega: {format(new Date(entrega.tp.fecha_entrega), "dd 'de' MMMM", { locale: es })}
                        </p>
                      </div>
                      <Badge variant={daysUntil <= 3 ? "destructive" : "secondary"}>
                        {daysUntil} {daysUntil === 1 ? "día" : "días"}
                      </Badge>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay entregas próximas</p>
              )}
              <Link href="/dashboard/student/trabajos">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todos los Trabajos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones Recientes
              </CardTitle>
              <CardDescription>Últimas actualizaciones y avisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${notif.leida ? "bg-muted/50" : "bg-primary/5 border border-primary/20"}`}
                  >
                    <div className={`mt-0.5 ${notif.leida ? "text-muted-foreground" : "text-primary"}`}>
                      {notif.leida ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{notif.mensaje}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notif.fecha_hora), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay notificaciones</p>
              )}
              <Link href="/dashboard/student/notificaciones">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todas las Notificaciones
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Materias en Curso
            </CardTitle>
            <CardDescription>Tus materias del año lectivo {new Date().getFullYear()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {cursadas.map((cursada) => {
                const cursadaEntregas = entregas.filter((e) => e.cursada_id === cursada.id)
                const completedCount = cursadaEntregas.filter((e) => e.estado === "calificado").length
                const totalCount = cursadaEntregas.length
                const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

                return (
                  <Link key={cursada.id} href={`/dashboard/student/materias/${cursada.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{cursada.comision?.materia?.nombre || cursada.comision?.nombre}</CardTitle>
                        <CardDescription>{cursada.comision?.horarios}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">
                            {completedCount}/{totalCount} TPs
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center gap-4 text-sm">
                          {cursada.nota_conceptual && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>Conceptual: {cursada.nota_conceptual}</span>
                            </div>
                          )}
                          {cursada.nota_final && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>Final: {cursada.nota_final}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
