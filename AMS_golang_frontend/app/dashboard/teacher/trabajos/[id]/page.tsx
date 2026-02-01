"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { tpAPI, entregaTPAPI } from "@/lib/api"
import { ArrowLeft, FileText, Calendar, Users, CheckCircle2, Clock, AlertCircle, Pencil } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function TPDetailPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const tpId = params.id as string

  const [tp, setTp] = useState<any>(null)
  const [entregas, setEntregas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "teacher" && user.role !== "profesor")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user && tpId) {
      setLoading(true)
      Promise.all([
        tpAPI.getById(tpId),
        entregaTPAPI.getByTP(tpId),
      ])
        .then(([tpResponse, entregasResponse]) => {
          console.log('TP and Entregas:', { tpResponse, entregasResponse })

          const tpData = tpResponse.data || tpResponse
          const entregasData = entregasResponse.data || entregasResponse.entregas || entregasResponse || []

          setTp(tpData)
          setEntregas(Array.isArray(entregasData) ? entregasData : [])
        })
        .catch(err => {
          console.error('Error loading TP details:', err)
          toast({
            title: "Error",
            description: "No se pudo cargar la información del TP",
            variant: "destructive"
          })
        })
        .finally(() => setLoading(false))
    }
  }, [user, tpId, toast])

  if (isLoading || !user || user.role !== "teacher" && user.role !== "profesor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!loading && !tp) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Trabajo Práctico no encontrado</p>
          <Link href="/dashboard/teacher/trabajos">
            <Button className="mt-4" variant="outline">Volver a Trabajos</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const pendingCount = entregas.filter(e => !e.nota).length
  const gradedCount = entregas.filter(e => e.nota).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teacher/trabajos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <p className="text-muted-foreground">
              {tp?.comision?.nombre || `Comisión ${tp?.comision_id}`}
            </p>
          </div>
          <Link href={`/dashboard/teacher/trabajos/${tpId}/editar`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          {tp?.vigente !== undefined && (
            <Badge variant={tp.vigente ? "default" : "secondary"}>
              {tp.vigente ? "Activo" : "Inactivo"}
            </Badge>
          )}
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
                  Información del Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de entrega</p>
                    <p className="font-medium">
                      {tp && tp.fecha_entrega && format(new Date(tp.fecha_entrega), "EEEE dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Consigna:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tp?.consigna}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submissions Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Entregas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{entregas.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Calificar</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calificadas</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gradedCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Student Submissions List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Entregas de Estudiantes
                </CardTitle>
                <CardDescription>
                  Todas las entregas recibidas para este trabajo práctico
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entregas.length > 0 ? (
                  <div className="space-y-3">
                    {entregas.map((entrega) => (
                      <div
                        key={entrega.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">
                              {entrega.alumno?.nombre} {entrega.alumno?.apellido}
                            </p>
                            {entrega.nota ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                Calificado: {entrega.nota}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pendiente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Entregado: {format(new Date(entrega.fecha_entrega), "dd/MM/yyyy HH:mm")}
                          </p>
                          {entrega.archivo_url && (
                            <p className="text-xs text-muted-foreground">
                              Archivo: {entrega.archivo_url}
                            </p>
                          )}
                        </div>
                        <Link href={`/dashboard/teacher/trabajos/${tpId}/entregas/${entrega.id}`}>
                          <Button size="sm">
                            {entrega.nota ? "Ver Detalles" : "Calificar"}
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No hay entregas aún</p>
                    <p className="text-sm text-muted-foreground">
                      Los estudiantes aún no han enviado sus trabajos
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
