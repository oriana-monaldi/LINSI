"use client"

import type React from "react"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { alumnoAPI, comisionAPI, cursadaAPI } from "@/lib/api"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

type Alumno = {
  id: number
  nombre: string
  apellido: string
  legajo: string
}

type Materia = {
  id: number
  nombre: string
}

type Comision = {
  id: number
  nombre: string
  horarios: string
  materia?: Materia
}

function CrearCursadaContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const comisionParam = searchParams.get("comision")

  const [alumnoId, setAlumnoId] = useState("")
  const [comisionId, setComisionId] = useState(comisionParam || "")
  const [anoLectivo, setAnoLectivo] = useState(new Date().getFullYear().toString())

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        const [alumnosData, comisionesData] = await Promise.all([
          alumnoAPI.getAll(),
          comisionAPI.getAll()
        ])
        setAlumnos(alumnosData || [])
        setComisiones(comisionesData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await cursadaAPI.create({
        alumno_id: parseInt(alumnoId, 10),
        comision_id: parseInt(comisionId, 10),
        ano_lectivo: parseInt(anoLectivo, 10),
      })
      router.push("/dashboard/admin/cursadas")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cursada")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/cursadas">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inscribir Estudiante</h1>
            <p className="text-muted-foreground">Inscribe un estudiante en una comisión</p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informacion de la Cursada</CardTitle>
            <CardDescription>Selecciona el estudiante y la comision</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="alumno">Estudiante</Label>
                  <select
                    id="alumno"
                    value={alumnoId}
                    onChange={(e) => setAlumnoId(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona un estudiante</option>
                    {alumnos.map((alumno) => (
                      <option key={alumno.id} value={alumno.id}>
                        {alumno.nombre} {alumno.apellido} - Legajo: {alumno.legajo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comision">Comision</Label>
                  <select
                    id="comision"
                    value={comisionId}
                    onChange={(e) => setComisionId(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Selecciona una comision</option>
                    {comisiones.map((comision) => (
                      <option key={comision.id} value={comision.id}>
                        {comision.materia?.nombre} - {comision.nombre} ({comision.horarios})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anoLectivo">Año Lectivo</Label>
                  <select
                    id="anoLectivo"
                    value={anoLectivo}
                    onChange={(e) => setAnoLectivo(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {[2024, 2025, 2026].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    <Plus className="h-4 w-4 mr-2" />
                    {submitting ? "Inscribiendo..." : "Inscribir Estudiante"}
                  </Button>
                  <Link href="/dashboard/admin/cursadas" className="flex-1">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function CrearCursadaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CrearCursadaContent />
    </Suspense>
  )
}
