"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockEvaluaciones, mockCursadas, mockCatedras } from "@/lib/mock-data"
import { Calendar, FileText, Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EvaluacionesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const studentCursadas = mockCursadas.filter((c) => c.alumnoId === user.id)
  const studentEvaluaciones = mockEvaluaciones.filter((ev) => studentCursadas.some((c) => c.id === ev.cursadaId))

  const upcomingEvaluaciones = studentEvaluaciones.filter((ev) => new Date(ev.fecha) > new Date())
  const pastEvaluaciones = studentEvaluaciones.filter((ev) => new Date(ev.fecha) <= new Date())

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluaciones</h1>
          <p className="text-muted-foreground">Consulta tus exámenes programados y resultados</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Evaluaciones
          </h2>
          {upcomingEvaluaciones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingEvaluaciones.map((ev) => {
                const cursada = studentCursadas.find((c) => c.id === ev.cursadaId)
                const catedra = mockCatedras.find((cat) => cat.id === cursada?.catedraId)

                return (
                  <Card key={ev.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{catedra?.nombre}</CardTitle>
                          <CardDescription>Evaluación programada</CardDescription>
                        </div>
                        <Badge>Próxima</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(ev.fecha), "EEEE dd 'de' MMMM, yyyy", { locale: es })}
                        </span>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Temas:</p>
                        <p className="text-sm text-muted-foreground">{ev.temas}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay evaluaciones próximas</p>
                <p className="text-sm text-muted-foreground">No tienes exámenes programados</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Evaluaciones Anteriores
          </h2>
          {pastEvaluaciones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pastEvaluaciones.map((ev) => {
                const cursada = studentCursadas.find((c) => c.id === ev.cursadaId)
                const catedra = mockCatedras.find((cat) => cat.id === cursada?.catedraId)

                return (
                  <Card key={ev.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{catedra?.nombre}</CardTitle>
                          <CardDescription>{format(new Date(ev.fecha), "dd/MM/yyyy")}</CardDescription>
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
                        <p className="text-sm font-medium mb-1">Temas evaluados:</p>
                        <p className="text-sm text-muted-foreground">{ev.temas}</p>
                      </div>

                      {ev.nota && (
                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="font-medium">Calificación</span>
                          </div>
                          <span className="text-2xl font-bold text-primary">{ev.nota}</span>
                        </div>
                      )}

                      {ev.devolucion && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Devolución:</p>
                          <p className="text-sm text-muted-foreground">{ev.devolucion}</p>
                        </div>
                      )}

                      {ev.observaciones && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Observaciones:</p>
                          <p className="text-sm text-muted-foreground">{ev.observaciones}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay evaluaciones anteriores</p>
                <p className="text-sm text-muted-foreground">Aún no has rendido ningún examen</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
