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
import { tpAPI } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function EditTPPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const tpId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    consigna: "",
    fecha_entrega: "",
    hora_entrega: "",
    vigente: true,
  });

  const pad = (value: number) => String(value).padStart(2, "0");
  const toDateInput = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
  const toTimeInput = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "teacher" && user.role !== "profesor"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && tpId) {
      setLoading(true);
      tpAPI
        .getById(tpId)
        .then((response) => {
          const tpData = response.data || response;
          setFormData({
            consigna: tpData.consigna || "",
            fecha_entrega: toDateInput(tpData.fecha_entrega),
            hora_entrega: toTimeInput(tpData.fecha_entrega),
            vigente: tpData.vigente !== undefined ? tpData.vigente : true,
          });
        })
        .catch((err) => {
          console.error("Error loading TP:", err);
          toast({
            title: "Error",
            description: "No se pudo cargar el trabajo práctico",
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user, tpId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consigna.trim()) {
      toast({
        title: "Error",
        description: "La consigna es obligatoria",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fecha_entrega) {
      toast({
        title: "Error",
        description: "La fecha de entrega es obligatoria",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hora_entrega) {
      toast({
        title: "Error",
        description: "La hora de entrega es obligatoria",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const updateData: any = {
        consigna: formData.consigna.trim(),
        fecha_entrega: new Date(
          `${formData.fecha_entrega}T${formData.hora_entrega}`,
        ).toISOString(),
        vigente: formData.vigente,
      };

      await tpAPI.update(tpId, updateData);

      toast({
        title: "Éxito",
        description: "Trabajo práctico actualizado correctamente",
      });

      router.push(`/dashboard/teacher/trabajos/${tpId}`);
    } catch (error: any) {
      console.error("Error updating TP:", error);
      toast({
        title: "Error",
        description:
          error.message || "No se pudo actualizar el trabajo práctico",
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
          <Link href={`/dashboard/teacher/trabajos/${tpId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Editar Trabajo Práctico</h1>
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
              <CardTitle>Información del Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="consigna">Consigna *</Label>
                  <Textarea
                    id="consigna"
                    value={formData.consigna}
                    onChange={(e) =>
                      setFormData({ ...formData, consigna: e.target.value })
                    }
                    placeholder="Describe las instrucciones del trabajo práctico..."
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_entrega">Fecha de Entrega *</Label>
                  <Input
                    id="fecha_entrega"
                    type="date"
                    value={formData.fecha_entrega}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_entrega: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora_entrega">Hora de Entrega *</Label>
                  <Input
                    id="hora_entrega"
                    type="time"
                    value={formData.hora_entrega}
                    onChange={(e) =>
                      setFormData({ ...formData, hora_entrega: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vigente"
                    checked={formData.vigente}
                    onChange={(e) =>
                      setFormData({ ...formData, vigente: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label
                    htmlFor="vigente"
                    className="font-normal cursor-pointer"
                  >
                    Trabajo práctico activo
                  </Label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Link href={`/dashboard/teacher/trabajos/${tpId}`}>
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
