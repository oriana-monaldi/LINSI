"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { evaluacionAPI } from "@/lib/api"
import { Calendar, Plus, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function TeacherEvaluacionesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [evaluaciones, setEvaluaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher" && user.role !== "profesor")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setLoading(true)
      evaluacionAPI.getMine()
        .then(response => {
          console.log('Evaluaciones response:', response)
          const evaluacionesList = response.data || response.evaluaciones || response || []
          setEvaluaciones(Array.isArray(evaluacionesList) ? evaluacionesList : [])
        })
        .catch(err => {
          console.error('Error loading evaluaciones:', err)
          setEvaluaciones([])
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

  const upcomingEvaluaciones = evaluaciones.filter((ev) => new Date(ev.fecha_evaluacion) > new Date())
  const pastEvaluaciones = evaluaciones.filter((ev) => new Date(ev.fecha_evaluacion) <= new Date())

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluaciones</h1>
            <p className="text-muted-foreground">Gestiona los exámenes de tus materias</p>
          </div>
          <Link href="/dashboard/teacher/evaluaciones/crear">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Evaluación
            </Button>
          </Link>
        </div>

        {/* Upcoming Evaluations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Evaluaciones
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : upcomingEvaluaciones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvaluaciones.map((ev) => (
                <Card key={ev.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Evaluación #{ev.id}</CardTitle>
                        <CardDescription>
                          {ev.comision?.nombre || `Comisión ${ev.comision_id}`}
                        </CardDescription>
                      </div>
                      <Badge>Próxima</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(ev.fecha_evaluacion), "EEEE dd 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Temas:</p>
                      <p className="text-sm text-muted-foreground">{ev.temas}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay evaluaciones próximas</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Evaluations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Evaluaciones Anteriores
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : pastEvaluaciones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pastEvaluaciones.map((ev) => (
                <Card key={ev.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Evaluación #{ev.id}</CardTitle>
                        <CardDescription>
                          {ev.comision?.nombre || `Comisión ${ev.comision_id}`} - {format(new Date(ev.fecha_evaluacion), "dd/MM/yyyy")}
                        </CardDescription>
                      </div>
                      {ev.nota ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Calificado</Badge>
                      ) : (
                        <Badge variant="secondary">Pendiente</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Temas:</p>
                      <p className="text-sm text-muted-foreground">{ev.temas}</p>
                    </div>

                    {ev.fecha_devolucion && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Devolución</span>
                        <span className="font-medium">{format(new Date(ev.fecha_devolucion), "dd/MM/yyyy")}</span>
                      </div>
                    )}

                    {ev.nota && (
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="font-medium">Calificación</span>
                        <span className="text-2xl font-bold text-primary">{ev.nota}</span>
                      </div>
                    )}

                    <Link href={`/dashboard/teacher/evaluaciones/${ev.id}`}>
                      <Button variant="outline" className="w-full bg-transparent">
                        {ev.nota ? "Ver Detalles" : "Calificar"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay evaluaciones anteriores</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
