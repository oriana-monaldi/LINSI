"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { evaluacionAPI, cursadaAPI } from "@/lib/api"
import { ArrowLeft, FileText, Calendar, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function EvaluacionDetailPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const evaluacionId = params.id as string

  const [evaluacion, setEvaluacion] = useState<any>(null)
  const [cursadas, setCursadas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher" && user.role !== "profesor")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && evaluacionId) {
      setLoading(true)
      evaluacionAPI.getById(evaluacionId)
        .then(async (evalResponse) => {
          console.log('Evaluacion:', evalResponse)
          const evalData = evalResponse.data || evalResponse
          setEvaluacion(evalData)

          // Obtener las cursadas de la comisión
          if (evalData.comision_id) {
            try {
              const cursadasResponse = await cursadaAPI.getByComision(evalData.comision_id.toString())
              const cursadasData = cursadasResponse.data || cursadasResponse || []
              setCursadas(Array.isArray(cursadasData) ? cursadasData : [])
            } catch (err) {
              console.error('Error loading cursadas:', err)
              setCursadas([])
            }
          }
        })
        .catch(err => {
          console.error('Error loading evaluacion details:', err)
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la evaluación",
            variant: "destructive"
          })
        })
        .finally(() => setLoading(false))
    }
  }, [user, evaluacionId, toast])

  if (isLoading || !user || user.role !== "teacher" && user.role !== "profesor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!loading && !evaluacion) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Evaluación no encontrada</p>
          <Link href="/dashboard/teacher/evaluaciones">
            <Button className="mt-4" variant="outline">Volver a Evaluaciones</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  // Para evaluaciones, mostramos todos los estudiantes de la cursada
  const totalCount = cursadas.length
  const gradedCount = 0 // Por ahora, hasta que implementemos el sistema de calificaciones

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teacher/evaluaciones">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Evaluación</h1>
            <p className="text-muted-foreground">
              {evaluacion?.comision?.nombre || `Comisión ${evaluacion?.comision_id}`}
            </p>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información de la Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de evaluación</p>
                      <p className="font-medium" suppressHydrationWarning>
                        {evaluacion && evaluacion.fecha_evaluacion && format(new Date(evaluacion.fecha_evaluacion), "EEEE dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de devolución</p>
                      <p className="font-medium" suppressHydrationWarning>
                        {evaluacion && evaluacion.fecha_devolucion && format(new Date(evaluacion.fecha_devolucion), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Temas:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{evaluacion?.temas}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Calificar</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCount - gradedCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calificados</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gradedCount}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Estudiantes
                </CardTitle>
                <CardDescription>
                  Lista de estudiantes inscriptos en la comisión
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cursadas.length > 0 ? (
                  <div className="space-y-3">
                    {cursadas.map((cursada) => (
                      <div
                        key={cursada.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">
                              {cursada.alumno?.nombre} {cursada.alumno?.apellido}
                            </p>
                            {cursada.nota_final ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Calificado: {cursada.nota_final}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pendiente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Legajo: {cursada.alumno?.legajo}
                          </p>
                        </div>
                        <Link href={`/dashboard/teacher/evaluaciones/${evaluacionId}/calificar/${cursada.id}`}>
                          <Button size="sm">
                            {cursada.nota_final ? "Ver Detalles" : "Calificar"}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No hay estudiantes inscriptos</p>
                    <p className="text-sm text-muted-foreground">
                      No hay estudiantes inscriptos en esta comisión.
                    </p>
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
