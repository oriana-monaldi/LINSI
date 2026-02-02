"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { evaluacionAPI } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function EditEvaluacionPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const evaluacionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    temas: "",
    fecha_evaluacion: "",
  });

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "teacher" && user.role !== "profesor"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && evaluacionId) {
      setLoading(true);
      evaluacionAPI
        .getById(evaluacionId)
        .then((response) => {
          const evaluacionData = response.data || response;
          setFormData({
            temas: evaluacionData.temas || "",
            fecha_evaluacion: evaluacionData.fecha_evaluacion
              ? evaluacionData.fecha_evaluacion.split("T")[0]
              : "",
          });
        })
        .catch((err) => {
          console.error("Error loading evaluacion:", err);
          toast({
            title: "Error",
            description: "No se pudo cargar la evaluación",
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user, evaluacionId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.temas.trim()) {
      toast({
        title: "Error",
        description: "Los temas son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fecha_evaluacion) {
      toast({
        title: "Error",
        description: "La fecha de evaluación es obligatoria",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const updateData: any = {
        temas: formData.temas.trim(),
        fecha_evaluacion: new Date(formData.fecha_evaluacion).toISOString(),
      };

      await evaluacionAPI.update(evaluacionId, updateData);

      toast({
        title: "Éxito",
        description: "Evaluación actualizada correctamente",
      });

      router.push(`/dashboard/teacher/evaluaciones/${evaluacionId}`);
    } catch (error: any) {
      console.error("Error updating evaluacion:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la evaluación",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (
    isLoading ||
    !user ||
    (user.role !== "teacher" && user.role !== "profesor")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/teacher/evaluaciones/${evaluacionId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Editar Evaluación</h1>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Información de la Evaluación</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="temas">Temas *</Label>
                  <Textarea
                    id="temas"
                    value={formData.temas}
                    onChange={(e) =>
                      setFormData({ ...formData, temas: e.target.value })
                    }
                    placeholder="Describe los temas que se evaluarán..."
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_evaluacion">
                    Fecha de Evaluación *
                  </Label>
                  <Input
                    id="fecha_evaluacion"
                    type="date"
                    value={formData.fecha_evaluacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_evaluacion: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Link
                    href={`/dashboard/teacher/evaluaciones/${evaluacionId}`}
                  >
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
