"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { tpAPI, evaluacionAPI, comisionAPI, entregaTPAPI } from "@/lib/api"
import { FileText, Users, AlertCircle, Calendar, Plus, BookOpen } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function TeacherDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [tps, setTps] = useState<any[]>([])
  const [entregas, setEntregas] = useState<any[]>([])
  const [evaluaciones, setEvaluaciones] = useState<any[]>([])
  const [comisiones, setComisiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher" && user.role !== "profesor")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setLoading(true)
      Promise.all([
        tpAPI.getMine(),
        entregaTPAPI.getAll(),
        evaluacionAPI.getMine(),
        comisionAPI.getByProfesor(),
      ])
        .then(([tpsResponse, entregasResponse, evaluacionesResponse, comisionesResponse]) => {
          console.log('Dashboard data:', { tpsResponse, entregasResponse, evaluacionesResponse, comisionesResponse })

          const tpsList = tpsResponse.data || tpsResponse.tps || tpsResponse || []
          const entregasList = entregasResponse.data || entregasResponse.entregas || entregasResponse || []
          const evaluacionesList = evaluacionesResponse.data || evaluacionesResponse.evaluaciones || evaluacionesResponse || []
          const profesorComisiones = comisionesResponse.data || comisionesResponse || []
          const comisionesList = Array.isArray(profesorComisiones)
            ? profesorComisiones.map((pc: any) => pc.comision).filter(Boolean)
            : []

          setTps(Array.isArray(tpsList) ? tpsList : [])
          setEntregas(Array.isArray(entregasList) ? entregasList : [])
          setEvaluaciones(Array.isArray(evaluacionesList) ? evaluacionesList : [])
          setComisiones(comisionesList)
        })
        .catch(err => {
          console.error('Error loading dashboard data:', err)
          setTps([])
          setEntregas([])
          setEvaluaciones([])
          setComisiones([])
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  if (isLoading || !user || user.role !== "teacher" && user.role !== "profesor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const professorTpIds = new Set(tps.map((tp) => Number(tp.id)))
  const pendingEntregas = entregas.filter((entrega) => {
    const entregaTpId = Number(entrega?.tp_id ?? entrega?.tp?.id ?? entrega?.Tp?.ID)
    const isProfessorTp = Number.isFinite(entregaTpId) ? professorTpIds.has(entregaTpId) : false
    return isProfessorTp && (entrega?.estado === "pendiente" || entrega?.nota == null)
  })
  const pendingGrades = pendingEntregas.length
  const upcomingEvaluaciones = evaluaciones.filter((ev) => new Date(ev.fecha_evaluacion) > new Date())

  const allGrades = [
    ...tps.filter((tp) => tp.nota).map((tp) => tp.nota),
    ...evaluaciones.filter((ev) => ev.nota).map((ev) => ev.nota),
  ]
  const averageGrade =
    allGrades.length > 0 ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1) : "N/A"

  const recentSubmissions = pendingEntregas.slice(0, 3)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bienvenido, Prof. {user.apellido}</h1>
            <p className="text-muted-foreground">Legajo: {user.legajo}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/teacher/trabajos/crear">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear TP
              </Button>
            </Link>
            <Link href="/dashboard/teacher/evaluaciones/crear">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Evaluación
              </Button>
            </Link>
          </div>
        </div>

  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Por Calificar</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-muted rounded w-16"></div>
              ) : (
                <div className="text-2xl font-bold">{pendingGrades}</div>
              )}
              <p className="text-xs text-muted-foreground">Trabajos pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-muted rounded w-16"></div>
              ) : (
                <div className="text-2xl font-bold">{comisiones.length}</div>
              )}
              <p className="text-xs text-muted-foreground">Que dictas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Evaluaciones</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 bg-muted rounded w-16"></div>
              ) : (
                <div className="text-2xl font-bold">{upcomingEvaluaciones.length}</div>
              )}
              <p className="text-xs text-muted-foreground">Programadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Entregas Pendientes de Calificación
              </CardTitle>
              <CardDescription>Trabajos que requieren tu revisión</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : recentSubmissions.length > 0 ? (
                recentSubmissions.map((entrega) => {
                  const tp = entrega.tp || entrega.Tp
                  const tpTitle = tp?.titulo || tp?.nombre || (tp?.consigna ? String(tp.consigna).split('\n')[0].slice(0, 80) : `Trabajo ${entrega.tp_id}`)
                  return (
                    <div key={entrega.id} className="flex items-start justify-between border-l-4 border-primary pl-4 py-2">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm">{tpTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {tp?.comision?.nombre || `Comisión ${tp?.comision_id || entrega?.tp?.comision_id || "-"}`}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {entrega?.alumno?.nombre ? `${entrega.alumno.nombre} ${entrega.alumno.apellido}` : "Entrega pendiente"}
                        </p>
                      </div>
                      <Link href={`/dashboard/teacher/trabajos/${entrega.tp_id}`}>
                        <Button size="sm">Ver Entregas</Button>
                      </Link>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay entregas pendientes</p>
              )}
              <Link href="/dashboard/teacher/trabajos">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todos los Trabajos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Evaluaciones
              </CardTitle>
              <CardDescription>Exámenes programados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : upcomingEvaluaciones.length > 0 ? (
                upcomingEvaluaciones.slice(0, 3).map((ev) => {
                  return (
                    <div key={ev.id} className="flex items-start justify-between border-l-4 border-primary pl-4 py-2">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm">
                          {ev.comision?.nombre || `Comisión ${ev.comision_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">{ev.temas}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ev.fecha_evaluacion), "dd 'de' MMMM", { locale: es })}
                        </p>
                      </div>
                      <Badge variant="secondary">Próxima</Badge>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones próximas</p>
              )}
              <Link href="/dashboard/teacher/evaluaciones">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todas las Evaluaciones
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Comisiones
            </CardTitle>
            <CardDescription>Comisiones que dictas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : comisiones.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {comisiones.map((comision) => {
                  const comisionTPs = tps.filter((tp) => tp.comision_id === comision.id)
                  const comisionEvaluaciones = evaluaciones.filter((ev) => ev.comision_id === comision.id)
                  const pendingCount = pendingEntregas.filter((entrega) => {
                    const entregaComisionId = Number(entrega?.tp?.comision_id ?? entrega?.tp?.comision?.id)
                    return Number.isFinite(entregaComisionId) && entregaComisionId === Number(comision.id)
                  }).length

                  return (
                    <Link key={comision.id} href={`/dashboard/teacher/materias/${comision.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{comision.materia?.nombre || 'Materia'}</CardTitle>
                          <CardDescription>{comision.nombre} - {comision.horarios}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{comisionEvaluaciones.length} evaluaciones</span>
                            </div>
                            {pendingCount > 0 && <Badge variant="destructive">{pendingCount} por calificar</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{comisionTPs.length} trabajos asignados</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No hay comisiones asignadas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
