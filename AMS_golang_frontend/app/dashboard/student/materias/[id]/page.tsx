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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cursadaAPI,
  entregaTPAPI,
  tpAPI,
  evaluacionAPI,
  competenciaAPI,
  materiaCompetenciaAPI,
} from "@/lib/api";
import {
  BookOpen,
  Award,
  FileText,
  TrendingUp,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

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

interface EntregaEvaluacion {
  id: number;
  evaluacion_id: number;
  alumno_id: number;
  evaluacion: {
    id: number;
    fecha_evaluacion: string;
    fecha_devolucion: string;
    temas: string;
    nota: number | null;
    devolucion: string | null;
    observaciones: string | null;
    comision_id: number;
    comision: Comision;
  };
  archivo_url: string;
  fecha_entrega: string;
  nota: number | null;
  devolucion: string | null;
  observaciones: string | null;
}

export default function MateriaDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const cursadaId = params.id as string;

  const [cursada, setCursada] = useState<Cursada | null>(null);
  const [entregas, setEntregas] = useState<EntregaTP[]>([]);
  const [tps, setTps] = useState<TP[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EntregaEvaluacion[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [materiaCompetencias, setMateriaCompetencias] = useState<any[]>([]);
  const [alumnoFeedback, setAlumnoFeedback] = useState("");
  const [profesorFeedback, setProfesorFeedback] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);
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
        const [cursadasResult, entregasResult, tpsResult] =
          await Promise.allSettled([
            cursadaAPI.getByAlumno(String(user.id)),
            entregaTPAPI.getMine(),
            tpAPI.getAll(),
          ]);

        if (cursadasResult.status === "rejected") {
          console.error("Error fetching cursadas:", cursadasResult.reason);
          setError("No se pudieron cargar las cursadas");
          return;
        }

        if (entregasResult.status === "rejected") {
          console.error("Error fetching entregas:", entregasResult.reason);
          setError("No se pudieron cargar las entregas");
          return;
        }

        const cursadasData =
          cursadasResult.status === "fulfilled" ? cursadasResult.value : [];
        const entregasData =
          entregasResult.status === "fulfilled" ? entregasResult.value : [];
        const tpsData = tpsResult.status === "fulfilled" ? tpsResult.value : [];

        const foundCursada = (cursadasData || []).find(
          (c: Cursada) => c.id === Number(cursadaId),
        );
        setCursada(foundCursada || null);

        const filteredEntregas = (entregasData || []).filter(
          (e: EntregaTP) => e.cursada_id === Number(cursadaId),
        );
        setEntregas(filteredEntregas);

        if (foundCursada && Array.isArray(tpsData)) {
          const tpsForComision = (tpsData as TP[]).filter(
            (t) => t.comision_id === foundCursada.comision.id,
          );
          setTps(tpsForComision);

          const tpIds = new Set(tpsForComision.map((tp) => tp.id));
          const [allCompetencias, materiaCompetenciasRes] = await Promise.all([
            competenciaAPI.getAll().catch((err) => {
              console.error("Error loading competencias TP:", err);
              return null;
            }),
            materiaCompetenciaAPI
              .getByMateria(String(foundCursada.comision.materia.id))
              .catch((err) => {
                console.error("Error loading competencias materia:", err);
                return null;
              }),
          ]);
          const allList = allCompetencias?.data || allCompetencias || [];
          const filtered = Array.isArray(allList)
            ? allList.filter((c: any) => tpIds.has(c.tp_id))
            : [];
          setCompetencias(filtered);
          const materiaList =
            materiaCompetenciasRes?.data || materiaCompetenciasRes || [];
          setMateriaCompetencias(Array.isArray(materiaList) ? materiaList : []);

          try {
            console.log(
              "Fetching evaluaciones for student in comision:",
              foundCursada.comision.id,
            );
            const evaluacionesData = await evaluacionAPI
              .getMyAsStudent()
              .catch((err) => {
                console.error("Error from getMyAsStudent:", err);
                return [];
              });
            console.log("Evaluaciones response:", evaluacionesData);
            const evalList = Array.isArray(evaluacionesData)
              ? evaluacionesData
              : evaluacionesData?.data || evaluacionesData?.evaluaciones || [];
            console.log("Evaluaciones list after parsing:", evalList);
            console.log("Filtering by comision_id:", foundCursada.comision.id);

            const evalForComision = evalList.filter((e: EntregaEvaluacion) => {
              console.log(
                "Checking entrega:",
                e.id,
                "evaluacion?.comision_id:",
                e.evaluacion?.comision_id,
                "foundCursada.comision.id:",
                foundCursada.comision.id,
              );
              return e.evaluacion?.comision_id === foundCursada.comision.id;
            });
            console.log("Filtered evaluaciones for comision:", evalForComision);
            setEvaluaciones(
              Array.isArray(evalForComision) ? evalForComision : [],
            );
          } catch (err) {
            console.error("Error loading evaluaciones:", err);
            setEvaluaciones([]);
          }
        } else {
          setTps([]);
          setEvaluaciones([]);
          setCompetencias([]);
          setMateriaCompetencias([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar los datos",
        );
      } finally {
        setDataLoading(false);
      }
    }

    if (user && (user.role === "student" || user.role === "alumno")) {
      fetchData().catch((err) => {
        console.error("Error fetching data (unhandled):", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar los datos",
        );
        setDataLoading(false);
      });
    }
  }, [user, cursadaId]);

  const parseFeedback = (value?: string | null) => {
    if (!value) return { alumno: "", profesor: "" };
    try {
      const parsed = JSON.parse(value);
      return {
        alumno: parsed?.alumno || "",
        profesor: parsed?.profesor || "",
      };
    } catch {
      return { alumno: value, profesor: "" };
    }
  };

  useEffect(() => {
    if (!cursada) return;
    const feedbackParsed = parseFeedback(cursada.feedback);
    setAlumnoFeedback(feedbackParsed.alumno);
    setProfesorFeedback(feedbackParsed.profesor);
  }, [cursada]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  async function handleFileSelect(
    tpId: number,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFiles((prev) => ({ ...prev, [tpId]: file }));
  }

  async function handleSubmitEntrega(tp: TP) {
    const file = selectedFiles[tp.id];
    if (!file) {
      toast({
        title: "Error",
        description: "Selecciona un archivo antes de enviar",
        variant: "destructive",
      });
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
      toast({
        title: "Éxito",
        description: "Entrega creada correctamente",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Error al enviar entrega",
        variant: "destructive",
      });
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
  const totalTps = tps.length;
  const progress =
    totalTps > 0 ? (completedEntregas.length / totalTps) * 100 : 0;

  const tpGrades = completedEntregas
    .filter((e) => e.nota !== null && e.nota !== undefined)
    .map((e) => Number(e.nota))
    .filter((n) => Number.isFinite(n));

  const evaluacionGrades = evaluaciones
    .filter((e) => e.nota !== null && e.nota !== undefined)
    .map((e) => Number(e.nota))
    .filter((n) => Number.isFinite(n));

  const averageTps =
    tpGrades.length > 0
      ? (tpGrades.reduce((a, b) => a + b, 0) / tpGrades.length).toFixed(1)
      : "N/A";

  const finalGrades = [...tpGrades, ...evaluacionGrades];
  const finalGradeAverage =
    finalGrades.length > 0
      ? (finalGrades.reduce((a, b) => a + b, 0) / finalGrades.length).toFixed(
          1,
        )
      : "Pendiente";

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
              <CardTitle className="text-sm font-medium">
                Promedio de trabajos prácticos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageTps}</div>
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
                {finalGradeAverage}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>
              Intercambio de feedback con el profesor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-alumno">
                Tu feedback para el profesor
              </Label>
              <Textarea
                id="feedback-alumno"
                value={alumnoFeedback}
                onChange={(e) => setAlumnoFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={async () => {
                setSavingFeedback(true);
                try {
                  const updated = await cursadaAPI.update(String(cursada.id), {
                    feedback: JSON.stringify({
                      alumno: alumnoFeedback,
                      profesor: profesorFeedback,
                    }),
                  });
                  const updatedData = updated?.data || updated;
                  setCursada(updatedData || cursada);
                  toast({
                    title: "Feedback guardado",
                    description: "Tu feedback fue enviado correctamente",
                  });
                } catch (err: any) {
                  console.error("Error saving feedback:", err);
                  toast({
                    title: "Error",
                    description:
                      err?.message || "No se pudo guardar el feedback",
                    variant: "destructive",
                  });
                } finally {
                  setSavingFeedback(false);
                }
              }}
              disabled={savingFeedback}
            >
              {savingFeedback ? "Guardando..." : "Guardar Feedback"}
            </Button>

            {profesorFeedback && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">
                  Feedback del profesor:
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profesorFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competencias de la materia</CardTitle>
            <CardDescription>Listado de competencias generales</CardDescription>
          </CardHeader>
          <CardContent>
            {materiaCompetencias.length > 0 ? (
              <div className="space-y-3">
                {materiaCompetencias.map((competencia) => (
                  <div key={competencia.id} className="border rounded-lg p-4">
                    <p className="font-medium">{competencia.nombre}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {competencia.descripcion || "Sin descripción"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay competencias cargadas.
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="trabajos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trabajos">Trabajos Prácticos</TabsTrigger>
            <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="trabajos" className="space-y-4">
            {entregas.length > 0 || tps.length > 0 ? (
              <div className="grid gap-4">
                {(() => {
                  const tpIdsWithEntrega = new Set(
                    entregas.map((e) => e.tp_id),
                  );
                  const entregaItems = entregas.map((entrega) => ({
                    type: "entrega" as const,
                    data: entrega,
                  }));
                  const pendingTpItems = tps
                    .filter((t) => !tpIdsWithEntrega.has(t.id))
                    .map((t) => ({ type: "tp" as const, data: t }));

                  const items = [...entregaItems, ...pendingTpItems];

                  const normalizeText = (value?: string) =>
                    (value || "").trim().toLowerCase();
                  const materiaKeys = new Set(
                    materiaCompetencias.map(
                      (c: any) =>
                        `${normalizeText(c.nombre)}::${normalizeText(c.descripcion)}`,
                    ),
                  );
                  const competenciasByTp = (tpId: number) =>
                    competencias.filter((c) => {
                      if (Number(c.tp_id) !== Number(tpId)) return false;
                      const key = `${normalizeText(c.nombre)}::${normalizeText(c.descripcion)}`;
                      return !materiaKeys.has(key);
                    });

                  return items.map((item) => {
                    if (item.type === "entrega") {
                      const entrega = item.data as EntregaTP;
                      const tpId = entrega.tp_id ?? entrega.tp?.id;
                      const tpCompetencias = tpId ? competenciasByTp(tpId) : [];
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
                                        "dd/MM/yyyy",
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
                          <CardContent className="space-y-3">
                            {tpCompetencias.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Competencias del TP
                                </p>
                                <div className="space-y-2">
                                  {tpCompetencias.map((competencia: any) => (
                                    <div
                                      key={competencia.id}
                                      className="border rounded-lg p-3"
                                    >
                                      <p className="text-sm font-medium">
                                        {competencia.nombre}
                                      </p>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {competencia.descripcion ||
                                          "Sin descripción"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {entrega.devolucion && (
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-1">
                                  Devolución:
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {entrega.devolucion}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    } else {
                      const tp = item.data as TP;
                      const tpCompetencias = competenciasByTp(tp.id);
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
                                        "dd/MM/yyyy",
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
                          <CardContent className="space-y-3">
                            {tpCompetencias.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">
                                  Competencias del TP
                                </p>
                                <div className="space-y-2">
                                  {tpCompetencias.map((competencia: any) => (
                                    <div
                                      key={competencia.id}
                                      className="border rounded-lg p-3"
                                    >
                                      <p className="text-sm font-medium">
                                        {competencia.nombre}
                                      </p>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {competencia.descripcion ||
                                          "Sin descripción"}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
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

          <TabsContent value="evaluaciones" className="space-y-4">
            {evaluaciones.length > 0 ? (
              <div className="grid gap-4">
                {evaluaciones.map((entregaEvaluacion) => (
                  <Card key={entregaEvaluacion.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            Evaluación
                          </CardTitle>
                          <CardDescription
                            className="flex items-center gap-2 mt-1"
                            suppressHydrationWarning
                          >
                            <Calendar className="h-3 w-3" />
                            {format(
                              new Date(
                                entregaEvaluacion.evaluacion.fecha_evaluacion,
                              ),
                              "EEEE dd 'de' MMMM, yyyy",
                              { locale: es },
                            )}
                          </CardDescription>
                        </div>
                        {entregaEvaluacion.nota !== null &&
                        entregaEvaluacion.nota !== undefined ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Nota: {entregaEvaluacion.nota}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Temas:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {entregaEvaluacion.evaluacion.temas}
                        </p>
                      </div>

                      {entregaEvaluacion.evaluacion.fecha_devolucion && (
                        <div
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          suppressHydrationWarning
                        >
                          <Calendar className="h-4 w-4" />
                          <span>
                            Devolución:{" "}
                            {format(
                              new Date(
                                entregaEvaluacion.evaluacion.fecha_devolucion,
                              ),
                              "dd/MM/yyyy",
                            )}
                          </span>
                        </div>
                      )}

                      {entregaEvaluacion.devolucion && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">
                            Devolución del profesor:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entregaEvaluacion.devolucion}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No hay evaluaciones</p>
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
    } catch (e) {}
  }, [storageKey]);

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
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
