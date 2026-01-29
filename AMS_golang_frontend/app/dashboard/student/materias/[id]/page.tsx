"use client";

import { useEffect, useState, ChangeEvent } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cursadaAPI, entregaTPAPI, tpAPI } from "@/lib/api";
import {
  BookOpen,
  Award,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Materia {
  id: number;
  nombre: string;
  ano_carrera: number;
}

interface Comision {
  id: number;
  nombre: string;
  horarios: string;
  materia_id: number;
  materia: Materia;
}

interface Cursada {
  id: number;
  ano_lectivo: number;
  nota_final: number | null;
  nota_conceptual: number | null;
  feedback: string;
  alumno_id: number;
  comision_id: number;
  comision: Comision;
}

interface TP {
  id: number;
  consigna: string;
  fecha_entrega: string;
  vigente: boolean;
  comision_id: number;
}

interface EntregaTP {
  id: number;
  tp_id: number;
  alumno_id: number;
  cursada_id: number;
  archivo_url: string;
  fecha_entrega: string;
  nota: number | null;
  devolucion: string;
  estado: string;
  tp: TP;
}

export default function MateriaDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cursadaId = params.id as string;

  const [cursada, setCursada] = useState<Cursada | null>(null);
  const [entregas, setEntregas] = useState<EntregaTP[]>([]);
  const [tps, setTps] = useState<TP[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    Record<number, File | null>
  >({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "student" && user.role !== "alumno"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.id || !cursadaId) return;

      setDataLoading(true);
      setError(null);

      try {
        const [cursadasData, entregasData] = await Promise.all([
          cursadaAPI.getByAlumno(String(user.id)),
          entregaTPAPI.getMine(),
        ]);

        const tpsData = await tpAPI.getAll();

        const foundCursada = (cursadasData || []).find(
          (c: Cursada) => c.id === Number(cursadaId)
        );
        setCursada(foundCursada || null);

        const filteredEntregas = (entregasData || []).filter(
          (e: EntregaTP) => e.cursada_id === Number(cursadaId)
        );
        setEntregas(filteredEntregas);

        if (foundCursada && Array.isArray(tpsData)) {
          const tpsForComision = (tpsData as TP[]).filter(
            (t) => t.comision_id === foundCursada.comision.id
          );
          setTps(tpsForComision);
        } else {
          setTps([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar los datos"
        );
      } finally {
        setDataLoading(false);
      }
    }

    if (user && (user.role === "student" || user.role === "alumno")) {
      fetchData();
    }
  }, [user, cursadaId]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  async function handleFileSelect(
    tpId: number,
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFiles((prev) => ({ ...prev, [tpId]: file }));
  }

  async function handleSubmitEntrega(tp: TP) {
    const file = selectedFiles[tp.id];
    if (!file) {
      alert("Selecciona un archivo antes de enviar");
      return;
    }

    try {
      setUploading((p) => ({ ...p, [tp.id]: true }));

    
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch(`${API_URL}/entregas/upload`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => null);
        throw new Error(err?.error || `Upload failed: ${uploadRes.status}`);
      }

      const uploadJson = await uploadRes.json();
      const archivo_url = uploadJson.archivo_url;

      const created = await entregaTPAPI.create({
        tp_id: tp.id,
        cursada_id: Number(cursadaId),
        archivo_url,
      });

      setEntregas((prev) => [created as EntregaTP, ...prev]);
      setSelectedFiles((p) => ({ ...p, [tp.id]: null }));
      alert("Entrega creada correctamente");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Error al enviar entrega");
    } finally {
      setUploading((p) => ({ ...p, [tp.id]: false }));
    }
  }

  if (
    isLoading ||
    !user ||
    (user.role !== "student" && user.role !== "alumno")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!cursada) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">Materia no encontrada</p>
        </div>
      </DashboardLayout>
    );
  }

  const completedEntregas = entregas.filter((e) => e.estado === "calificado");
  const progress =
    entregas.length > 0
      ? (completedEntregas.length / entregas.length) * 100
      : 0;

  const allGrades = completedEntregas
    .filter((e) => e.nota !== null)
    .map((e) => e.nota!);
  const average =
    allGrades.length > 0
      ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1)
      : "N/A";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {cursada.comision?.materia?.nombre || cursada.comision?.nombre}
          </h1>
          <p className="text-muted-foreground">{cursada.comision?.horarios}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{average}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Nota Conceptual
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cursada.nota_conceptual || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <Progress value={progress} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nota Final</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cursada.nota_final || "Pendiente"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trabajos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trabajos">Trabajos Prácticos</TabsTrigger>
          </TabsList>

          <TabsContent value="trabajos" className="space-y-4">
            {entregas.length > 0 || tps.length > 0 ? (
              <div className="grid gap-4">
      
                {(() => {
                  const tpIdsWithEntrega = new Set(
                    entregas.map((e) => e.tp_id)
                  );
                  const entregaItems = entregas.map((entrega) => ({
                    type: "entrega" as const,
                    data: entrega,
                  }));
                  const pendingTpItems = tps
                    .filter((t) => !tpIdsWithEntrega.has(t.id))
                    .map((t) => ({ type: "tp" as const, data: t }));

                  const items = [...entregaItems, ...pendingTpItems];

                  return items.map((item) => {
                    if (item.type === "entrega") {
                      const entrega = item.data as EntregaTP;
                      return (
                        <Card key={`entrega-${entrega.id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {entrega.tp?.consigna || "Trabajo Práctico"}
                                </CardTitle>
                                <CardDescription>
                                  Entrega:{" "}
                                  {entrega.tp?.fecha_entrega
                                    ? format(
                                        new Date(entrega.tp.fecha_entrega),
                                        "dd/MM/yyyy"
                                      )
                                    : "Sin fecha"}
                                </CardDescription>
                              </div>
                              {entrega.estado === "calificado" &&
                              entrega.nota !== null ? (
                                <Badge className="bg-green-500 hover:bg-green-600">
                                  Nota: {entrega.nota}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {entrega.estado === "pendiente"
                                    ? "Pendiente"
                                    : entrega.estado}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          {entrega.devolucion && (
                            <CardContent>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-1">
                                  Devolución:
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {entrega.devolucion}
                                </p>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    } else {
                      const tp = item.data as TP;
                      return (
                        <Card key={`tp-${tp.id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {tp.consigna || "Trabajo Práctico"}
                                </CardTitle>
                                <CardDescription>
                                  Entrega:{" "}
                                  {tp.fecha_entrega
                                    ? format(
                                        new Date(tp.fecha_entrega),
                                        "dd/MM/yyyy"
                                      )
                                    : "Sin fecha"}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="secondary">No enviado</Badge>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    accept="*/*"
                                    onChange={(e) => handleFileSelect(tp.id, e)}
                                    className="text-sm"
                                  />
                                  <button
                                    className="px-3 py-1 rounded bg-primary text-white text-sm"
                                    onClick={() => handleSubmitEntrega(tp)}
                                    disabled={!!uploading[tp.id]}
                                  >
                                    {uploading[tp.id]
                                      ? "Subiendo..."
                                      : "Entregar"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    }
                  });
                })()}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">
                    No hay trabajos prácticos
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function FeedbackForm({ cursadaId }: { cursadaId: string }) {
  const storageKey = `feedback_${cursadaId}`;
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setValue(stored);
      }
    } catch (e) {
    }
  }, [storageKey]);

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        placeholder="Escribe tu feedback para el profesor..."
        className="w-full p-3 border rounded-md resize-y min-h-[100px]"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} size="sm">
          Guardar
        </Button>
        {saved && <span className="text-sm text-success">Guardado</span>}
      </div>
    </div>
  );
}
