"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { materiaAPI } from "@/lib/api";

export default function CrearMateriaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [anoCarrera, setAnoCarrera] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await materiaAPI.create({
        nombre,
        ano_carrera: parseInt(anoCarrera, 10),
      });
      router.push("/dashboard/admin/materias");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear materia");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/materias">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crear Materia</h1>
            <p className="text-muted-foreground">
              Agrega una nueva materia al sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informacion de la Materia</CardTitle>
            <CardDescription>
              Completa los detalles de la nueva materia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Materia</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Programacion I"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anoCarrera">Año de Carrera</Label>
                <select
                  id="anoCarrera"
                  value={anoCarrera}
                  onChange={(e) => setAnoCarrera(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Selecciona el año</option>
                  <option value="1">1er Año</option>
                  <option value="2">2do Año</option>
                  <option value="3">3er Año</option>
                  <option value="4">4to Año</option>
                  <option value="5">5to Año</option>
                </select>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  {submitting ? "Creando..." : "Crear Materia"}
                </Button>
                <Link href="/dashboard/admin/materias" className="flex-1">
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
