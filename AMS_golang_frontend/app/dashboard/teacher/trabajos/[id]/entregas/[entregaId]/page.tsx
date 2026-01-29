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
import { entregaTPAPI } from "@/lib/api"
import { ArrowLeft, Save, FileText, User, Calendar, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function GradeEntregaPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const tpId = params.id as string
  const entregaId = params.entregaId as string

  const [entrega, setEntrega] = useState<any>(null)
  const [nota, setNota] = useState("")
  const [devolucion, setDevolucion] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher" && user.role !== "profesor")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && entregaId) {
      setLoading(true)
      entregaTPAPI.getById(entregaId)
        .then(response => {
          console.log('Entrega:', response)
          const entregaData = response.data || response
          setEntrega(entregaData)

          if (entregaData.nota) {
            setNota(entregaData.nota.toString())
          }
          if (entregaData.devolucion) {
            setDevolucion(entregaData.devolucion)
          }
        })
        .catch(err => {
          console.error('Error loading entrega:', err)
          toast({
            title: "Error",
            description: "No se pudo cargar la entrega",
            variant: "destructive"
          })
        })
        .finally(() => setLoading(false))
    }
  }, [user, entregaId, toast])

  if (isLoading || !user || user.role !== "teacher" && user.role !== "profesor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!loading && !entrega) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">Entrega no encontrada</p>
          <Link href={`/dashboard/teacher/trabajos/${tpId}`}>
            <Button className="mt-4" variant="outline">Volver al TP</Button>
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
      await entregaTPAPI.update(entregaId, {
        nota: notaNum,
        devolucion,
        estado: "calificado"
      })

      toast({
        title: "Calificación guardada",
        description: "La calificación se guardó exitosamente"
      })

      router.push(`/dashboard/teacher/trabajos/${tpId}`)
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
          <Link href={`/dashboard/teacher/trabajos/${tpId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calificar Entrega</h1>
            <p className="text-muted-foreground">Evalúa el trabajo del estudiante</p>
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
            {/* Student and Submission Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Información de la Entrega</CardTitle>
                  {entrega.nota && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Calificado: {entrega.nota}
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
                        {entrega.alumno?.nombre} {entrega.alumno?.apellido}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Legajo: {entrega.alumno?.legajo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de entrega</p>
                      <p className="font-medium">
                        {format(new Date(entrega.fecha_entrega), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Consigna del TP:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {entrega.tp?.consigna}
                  </p>
                </div>

                {entrega.archivo_url && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Archivo entregado</p>
                          <p className="text-xs text-muted-foreground">{entrega.archivo_url}</p>
                        </div>
                      </div>
                      <a href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') + entrega.archivo_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grading Form */}
            <Card>
              <CardHeader>
                <CardTitle>Calificación</CardTitle>
                <CardDescription>Ingresa la nota y devolución para el estudiante</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nota">Nota (1-10)</Label>
                    <Input
                      id="nota"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      placeholder="Ej: 8.5"
                      value={nota}
                      onChange={(e) => setNota(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="devolucion">Devolución</Label>
                    <Textarea
                      id="devolucion"
                      placeholder="Escribe tu feedback para el estudiante..."
                      value={devolucion}
                      onChange={(e) => setDevolucion(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Guardando..." : "Guardar Calificación"}
                    </Button>
                    <Link href={`/dashboard/teacher/trabajos/${tpId}`} className="flex-1">
                      <Button type="button" variant="outline" className="w-full bg-transparent">
                        Cancelar
                      </Button>
                    </Link>
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
