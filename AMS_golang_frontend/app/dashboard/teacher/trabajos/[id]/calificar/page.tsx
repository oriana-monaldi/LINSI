"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { entregaTPAPI } from "@/lib/api";
import { ArrowLeft, Save, FileText, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Entrega {
  ID: number;
  tp_id: number;
  alumno_id: number;
  cursada_id: number;
  archivo_url: string;
  fecha_entrega: string;
  nota: number | null;
  devolucion: string;
  estado: string;
  Tp?: {
    ID: number;
    consigna: string;
    fecha_entrega: string;
    Comision?: {
      ID: number;
      nombre: string;
      Materia?: {
        ID: number;
        nombre: string;
      };
    };
  };
  Alumno?: {
    ID: number;
    nombre: string;
    apellido: string;
    email: string;
    legajo: string;
  };
}

export default function CalificarTPPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const entregaId = params.id as string;

  const [nota, setNota] = useState("");
  const [devolucion, setDevolucion] = useState("");
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [loadingEntrega, setLoadingEntrega] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntrega() {
      try {
        setLoadingEntrega(true);
        const data = await entregaTPAPI.getById(entregaId);
        setEntrega(data);
        if (data.nota) {
          setNota(data.nota.toString());
          setDevolucion(data.devolucion || "");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error loading submission",
        );
      } finally {
        setLoadingEntrega(false);
      }
    }

    if (!isLoading && entregaId) {
      fetchEntrega();
    }
  }, [isLoading, entregaId]);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "teacher" && user.role !== "profesor"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (
    isLoading ||
    loadingEntrega ||
    !user ||
    (user.role !== "teacher" && user.role !== "profesor")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !entrega) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">
            {error || "Trabajo no encontrado"}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await entregaTPAPI.update(entregaId, {
        nota: parseFloat(nota),
        devolucion: devolucion,
        estado: "calificado",
      });
      router.push("/dashboard/teacher/trabajos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving grade");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teacher/trabajos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Calificar Trabajo Práctico
            </h1>
            <p className="text-muted-foreground">
              Evalúa el trabajo del estudiante
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Trabajo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Estudiante</p>
                  <p className="font-medium">
                    {entrega.Alumno?.nombre} {entrega.Alumno?.apellido}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Materia</p>
                  <p className="font-medium">
                    {entrega.Tp?.Comision?.Materia?.nombre ||
                      entrega.Tp?.Comision?.nombre}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de entrega
                  </p>
                  <p className="font-medium">
                    {format(new Date(entrega.fecha_entrega), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Consigna:</p>
              <p className="text-sm text-muted-foreground">
                {entrega.Tp?.consigna}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calificación</CardTitle>
            <CardDescription>
              Ingresa la nota y devolución para el estudiante
            </CardDescription>
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
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Calificación
                </Button>
                <Link href="/dashboard/teacher/trabajos" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
