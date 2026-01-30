"use client"

import type React from "react"

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
import { evaluacionAPI, cursadaAPI } from "@/lib/api"
import { ArrowLeft, Save, FileText, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function GradeEvaluacionPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const evaluacionId = params.id as string
  const cursadaId = params.cursadaId as string

  const [evaluacion, setEvaluacion] = useState<any>(null)
  const [cursada, setCursada] = useState<any>(null)
  const [nota, setNota] = useState("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher" && user.role !== "profesor")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && evaluacionId && cursadaId) {
      setLoading(true)
      Promise.all([
        evaluacionAPI.getById(evaluacionId),
        cursadaAPI.getById(cursadaId)
      ])
        .then(([evalResponse, cursadaResponse]) => {
          console.log('Evaluacion and Cursada:', { evalResponse, cursadaResponse })
          const evalData = evalResponse.data || evalResponse
          const cursadaData = cursadaResponse.data || cursadaResponse
          
          setEvaluacion(evalData)
          setCursada(cursadaData)

          // Si ya tiene nota final, mostrarla
          if (cursadaData.nota_final) {
            setNota(cursadaData.nota_final.toString())
          }
          if (cursadaData.feedback) {
            setFeedback(cursadaData.feedback)
          }
        })
        .catch(err => {
          console.error('Error loading data:', err)
          toast({
            title: "Error",
            description: "No se pudo cargar la información",
            variant: "destructive"
          })
        })
        .finally(() => setLoading(false))
    }
  }, [user, evaluacionId, cursadaId, toast])

  if (isLoading || !user || user.role !== "teacher" && user.role !== "profesor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!loading && (!evaluacion || !cursada)) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">Información no encontrada</p>
          <Link href={`/dashboard/teacher/evaluaciones/${evaluacionId}`}>
            <Button className="mt-4" variant="outline">Volver a la Evaluación</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const notaNum = parseFloat(nota)
      
      if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
        toast({
          title: "Error",
          description: "La nota debe ser un número entre 0 y 10",
          variant: "destructive"
        })
        setSaving(false)
        return
      }

      await cursadaAPI.update(cursadaId, {
        nota_final: notaNum,
        feedback: feedback.trim() || undefined
      })

      toast({
        title: "Calificación guardada",
        description: "La calificación se guardó exitosamente"
      })

      router.push(`/dashboard/teacher/evaluaciones/${evaluacionId}`)
    } catch (error: any) {
      console.error('Error saving grade:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la calificación",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/teacher/evaluaciones/${evaluacionId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calificar Evaluación</h1>
            <p className="text-muted-foreground">Evalúa el desempeño del estudiante</p>
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
            {/* Student and Evaluation Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Información</CardTitle>
                  {cursada.nota_final && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Calificado: {cursada.nota_final}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estudiante</p>
                      <p className="font-medium">
                        {cursada.alumno?.nombre} {cursada.alumno?.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Legajo: {cursada.alumno?.legajo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de evaluación</p>
                      <p className="font-medium" suppressHydrationWarning>
                        {format(new Date(evaluacion.fecha_evaluacion), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Temas de la Evaluación:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {evaluacion.temas}
                  </p>
                </div>

                {evaluacion.fecha_devolucion && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" suppressHydrationWarning>
                    <Calendar className="h-4 w-4" />
                    <span>Fecha de devolución: {format(new Date(evaluacion.fecha_devolucion), "dd/MM/yyyy")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grading Form */}
            <Card>
              <CardHeader>
                <CardTitle>Calificación</CardTitle>
                <CardDescription>
                  {cursada.nota_final ? "Actualizar calificación existente" : "Ingresar nota y devolución"}
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
                    <Label htmlFor="feedback">Devolución / Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Comentarios sobre el desempeño del estudiante en la evaluación..."
                      rows={6}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/teacher/evaluaciones/${evaluacionId}`)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Guardando..." : cursada.nota_final ? "Actualizar Calificación" : "Guardar Calificación"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
