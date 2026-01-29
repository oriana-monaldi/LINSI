"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { evaluacionAPI } from "@/lib/api"
import { Calendar, ArrowLeft, Save } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EvaluacionDetailPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const evaluacionId = params.id as string

  const [evaluacion, setEvaluacion] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nota, setNota] = useState("")
  const [devolucion, setDevolucion] = useState("")
  const [observaciones, setObservaciones] = useState("")

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "teacher" && user.role !== "profesor"))) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && evaluacionId) {
      loadEvaluacion()
    }
  }, [user, evaluacionId])

  const loadEvaluacion = async () => {
    try {
      setLoading(true)
      const response = await evaluacionAPI.getById(evaluacionId)
      const ev = response.data || response
      setEvaluacion(ev)

      if (ev.nota !== null && ev.nota !== undefined) {
        setNota(ev.nota.toString())
      }
      if (ev.devolucion) {
        setDevolucion(ev.devolucion)
      }
      if (ev.observaciones) {
        setObservaciones(ev.observaciones)
      }
    } catch (err) {
      console.error("Error loading evaluacion:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nota.trim()) {
      alert("Por favor ingrese una nota")
      return
    }

    const notaNum = parseFloat(nota)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      alert("La nota debe ser un número entre 0 y 10")
      return
    }

    try {
      setSaving(true)
      await evaluacionAPI.update(evaluacionId, {
        nota: notaNum,
        devolucion: devolucion.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
      })

      alert("Evaluación calificada exitosamente")
      router.push("/dashboard/teacher/evaluaciones")
    } catch (err) {
      console.error("Error saving grade:", err)
      alert("Error al guardar la calificación")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user || (user.role !== "teacher" && user.role !== "profesor")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!evaluacion) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Evaluación no encontrada</p>
        </div>
      </DashboardLayout>
    )
  }

  const isGraded = evaluacion.nota !== null && evaluacion.nota !== undefined

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calificar Evaluación</h1>
            <p className="text-muted-foreground">Evaluación #{evaluacion.id}</p>
          </div>
          {isGraded && <Badge className="bg-green-500">Calificado</Badge>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Evaluation Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
              <CardDescription>Detalles del examen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Comisión</Label>
                <p className="font-medium">
                  {evaluacion.comision?.nombre || `Comisión ${evaluacion.comision_id}`}
                </p>
                {evaluacion.comision?.materia?.nombre && (
                  <p className="text-sm text-muted-foreground">
                    {evaluacion.comision.materia.nombre}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Fecha de Evaluación</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {format(new Date(evaluacion.fecha_evaluacion), "EEEE dd 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>

              {evaluacion.fecha_devolucion && (
                <div>
                  <Label className="text-muted-foreground">Fecha de Devolución</Label>
                  <p className="font-medium">
                    {format(new Date(evaluacion.fecha_devolucion), "dd/MM/yyyy")}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Temas Evaluados</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{evaluacion.temas}</p>
              </div>
            </CardContent>
          </Card>

          {/* Grading Form */}
          <Card>
            <CardHeader>
              <CardTitle>Calificación</CardTitle>
              <CardDescription>
                {isGraded ? "Editar calificación existente" : "Ingresar nota y devolución"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nota">
                    Nota <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nota"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="0.00"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Nota entre 0 y 10</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="devolucion">Devolución</Label>
                  <Textarea
                    id="devolucion"
                    placeholder="Comentarios sobre el desempeño del alumno..."
                    rows={4}
                    value={devolucion}
                    onChange={(e) => setDevolucion(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : isGraded ? "Actualizar Calificación" : "Guardar Calificación"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
