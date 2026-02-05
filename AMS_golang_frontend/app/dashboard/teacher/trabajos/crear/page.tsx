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
import { Textarea } from "@/components/ui/textarea";
import { tpAPI, comisionAPI, competenciaAPI } from "@/lib/api";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function CrearTPPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [consigna, setConsigna] = useState("");
  const [comisionId, setComisionId] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horaEntrega, setHoraEntrega] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [comisiones, setComisiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [competencias, setCompetencias] = useState<
    Array<{ nombre: string; descripcion: string }>
  >([{ nombre: "", descripcion: "" }]);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "teacher" && user.role !== "profesor"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      comisionAPI
        .getByProfesor()
        .then((response) => {
          console.log("Comisiones response:", response);
          const profesorComisiones = response.data || response || [];
          const comisionesList = Array.isArray(profesorComisiones)
            ? profesorComisiones.map((pc: any) => pc.comision).filter(Boolean)
            : [];
          setComisiones(comisionesList);
        })
        .catch((err) => {
          console.error("Error loading comisiones:", err);
          setComisiones([]);
        });
    }
  }, [user]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!horaEntrega) {
        toast({
          title: "Error",
          description: "La hora de entrega es obligatoria",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const fechaISO = new Date(`${fechaEntrega}T${horaEntrega}`).toISOString();

      const created = await tpAPI.create({
        consigna,
        comision_id: parseInt(comisionId),
        fecha_entrega: fechaISO,
      });

      const createdTp = created?.data || created;
      const tpId = createdTp?.id;

      if (tpId) {
        const payloads = competencias
          .map((c) => ({
            nombre: c.nombre.trim(),
            descripcion: c.descripcion.trim(),
          }))
          .filter((c) => c.nombre.length > 0);

        if (payloads.length > 0) {
          await Promise.all(
            payloads.map((c) =>
              competenciaAPI.create({
                nombre: c.nombre,
                descripcion: c.descripcion,
                tp_id: Number(tpId),
              }),
            ),
          );
        }
      }

      toast({
        title: "TP creado exitosamente",
        description: "El trabajo práctico ha sido creado.",
      });

      router.push("/dashboard/teacher/trabajos");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el TP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleCompetenciaChange = (
    index: number,
    field: "nombre" | "descripcion",
    value: string,
  ) => {
    setCompetencias((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddCompetencia = () => {
    setCompetencias((prev) => [...prev, { nombre: "", descripcion: "" }]);
  };

  const handleRemoveCompetencia = (index: number) => {
    setCompetencias((prev) => prev.filter((_, idx) => idx !== index));
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
              Crear Trabajo Práctico
            </h1>
            <p className="text-muted-foreground">
              Asigna un nuevo trabajo a tus estudiantes
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Trabajo Práctico</CardTitle>
            <CardDescription>
              Completa los detalles del nuevo TP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="comision">Comisión</Label>
                <select
                  id="comision"
                  value={comisionId}
                  onChange={(e) => setComisionId(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" className="bg-background text-foreground">
                    Selecciona una comisión
                  </option>
                  {comisiones.length === 0 && (
                    <option
                      disabled
                      className="bg-background text-muted-foreground"
                    >
                      Cargando comisiones...
                    </option>
                  )}
                  {comisiones.map((com) => (
                    <option
                      key={com.id}
                      value={com.id}
                      className="bg-background text-foreground"
                    >
                      {com.materia?.nombre
                        ? `${com.materia.nombre} - ${com.nombre}`
                        : com.nombre || `Comisión ${com.id}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Comisiones cargadas: {comisiones.length}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consigna">Consigna</Label>
                <Textarea
                  id="consigna"
                  placeholder="Describe el trabajo práctico que deben realizar los estudiantes..."
                  value={consigna}
                  onChange={(e) => setConsigna(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaEntrega">Hora de Entrega</Label>
                <Input
                  id="horaEntrega"
                  type="time"
                  value={horaEntrega}
                  onChange={(e) => setHoraEntrega(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="archivo">
                  Material Complementario (opcional)
                </Label>
                <Input id="archivo" type="file" onChange={handleFileChange} />
                {archivo && (
                  <p className="text-sm text-muted-foreground">
                    Archivo: {archivo.name}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Competencias del TP</Label>
                    <p className="text-xs text-muted-foreground">
                      Agrega una o más competencias para este trabajo práctico
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCompetencia}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar competencia
                  </Button>
                </div>

                <div className="space-y-4">
                  {competencias.map((competencia, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={competencia.nombre}
                          onChange={(e) =>
                            handleCompetenciaChange(
                              index,
                              "nombre",
                              e.target.value,
                            )
                          }
                          placeholder="Nombre de la competencia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={competencia.descripcion}
                          onChange={(e) =>
                            handleCompetenciaChange(
                              index,
                              "descripcion",
                              e.target.value,
                            )
                          }
                          placeholder="Descripción de la competencia"
                          rows={3}
                        />
                      </div>
                      {competencias.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveCompetencia(index)}
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Creando..." : "Crear Trabajo Práctico"}
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
