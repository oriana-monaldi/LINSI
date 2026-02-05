"use client";

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
import {
  comisionAPI,
  cursadaAPI,
  tpAPI,
  evaluacionAPI,
  entregaTPAPI,
  materiaCompetenciaAPI,
} from "@/lib/api";
import { Users, TrendingUp, FileText, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function TeacherMateriaDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const comisionId = params.id as string;

  const [comision, setComision] = useState<any>(null);
  const [cursadas, setCursadas] = useState<any[]>([]);
  const [tps, setTps] = useState<any[]>([]);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [evaluacionEntregas, setEvaluacionEntregas] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [creatingCompetencia, setCreatingCompetencia] = useState(false);
  const [competenciaNombre, setCompetenciaNombre] = useState("");
  const [competenciaDescripcion, setCompetenciaDescripcion] = useState("");
  const [editingCompetenciaId, setEditingCompetenciaId] = useState<
    number | null
  >(null);
  const [editingNombre, setEditingNombre] = useState("");
  const [editingDescripcion, setEditingDescripcion] = useState("");
  const [profesorFeedbacks, setProfesorFeedbacks] = useState<
    Record<number, string>
  >({});
  const [savingFeedbackIds, setSavingFeedbackIds] = useState<
    Record<number, boolean>
  >({});
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "teacher" && user.role !== "profesor"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && comisionId) {
      setLoading(true);
      Promise.all([
        comisionAPI.getById(comisionId),
        cursadaAPI.getByComision(comisionId),
        tpAPI.getAll(),
        entregaTPAPI.getAll(),
        evaluacionAPI.getByComision(comisionId),
      ])
        .then(
          async ([
            comisionRes,
            cursadasRes,
            tpsRes,
            entregasRes,
            evaluacionesRes,
          ]) => {
            console.log("Comision detail data:", {
              comisionRes,
              cursadasRes,
              tpsRes,
              entregasRes,
              evaluacionesRes,
            });

            setComision(comisionRes);

            const cursadasList = cursadasRes.data || cursadasRes || [];
            setCursadas(Array.isArray(cursadasList) ? cursadasList : []);

            const allTps = tpsRes.data || tpsRes.tps || tpsRes || [];
            const comisionTps = Array.isArray(allTps)
              ? allTps.filter(
                  (tp: any) => tp.comision_id === parseInt(comisionId),
                )
              : [];
            setTps(comisionTps);

            const entregasList =
              entregasRes.data || entregasRes.entregas || entregasRes || [];
            setEntregas(Array.isArray(entregasList) ? entregasList : []);

            const evaluacionesList =
              evaluacionesRes.data || evaluacionesRes || [];
            const evaluacionesArray = Array.isArray(evaluacionesList)
              ? evaluacionesList
              : [];
            setEvaluaciones(evaluacionesArray);

            if (evaluacionesArray.length > 0) {
              const entregasEvaluacionesRes = await Promise.all(
                evaluacionesArray.map((evaluacion: any) =>
                  evaluacionAPI
                    .getEntregas(String(evaluacion.id))
                    .catch(() => []),
                ),
              );
              const entregasEvaluacionesList = entregasEvaluacionesRes.flatMap(
                (res: any) => res?.data || res?.entregas || res || [],
              );
              setEvaluacionEntregas(
                Array.isArray(entregasEvaluacionesList)
                  ? entregasEvaluacionesList
                  : [],
              );
            } else {
              setEvaluacionEntregas([]);
            }

            const materiaId = comisionRes?.materia?.id;
            if (materiaId) {
              const competenciasRes = await materiaCompetenciaAPI
                .getByMateria(String(materiaId))
                .catch(() => []);
              const competenciasList =
                competenciasRes.data || competenciasRes || [];
              setCompetencias(
                Array.isArray(competenciasList) ? competenciasList : [],
              );
            } else {
              setCompetencias([]);
            }
          },
        )
        .catch((err) => {
          console.error("Error loading comision data:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [user, comisionId]);

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
    const nextFeedbacks: Record<number, string> = {};
    cursadas.forEach((cursada) => {
      const parsed = parseFeedback(cursada.feedback);
      if (cursada?.id != null) {
        nextFeedbacks[cursada.id] = parsed.profesor || "";
      }
    });
    setProfesorFeedbacks(nextFeedbacks);
  }, [cursadas]);

  const handleSaveFeedback = async (cursada: any) => {
    const parsed = parseFeedback(cursada.feedback);
    const draft = (profesorFeedbacks[cursada.id] || "").trim();
    setSavingFeedbackIds((prev) => ({ ...prev, [cursada.id]: true }));
    try {
      const updated = await cursadaAPI.update(String(cursada.id), {
        feedback: JSON.stringify({
          alumno: parsed.alumno || "",
          profesor: draft,
        }),
      });
      const updatedItem = updated?.data || updated;
      setCursadas((prev) =>
        prev.map((c) => (c.id === cursada.id ? updatedItem : c)),
      );
      setProfesorFeedbacks((prev) => ({ ...prev, [cursada.id]: draft }));
    } catch (err) {
      console.error("Error saving feedback:", err);
    } finally {
      setSavingFeedbackIds((prev) => ({ ...prev, [cursada.id]: false }));
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!comision) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-lg font-medium">Comisión no encontrada</p>
          <Link href="/dashboard/teacher">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const comisionTpIds = new Set(tps.map((tp) => Number(tp.id)));
  const pendingGrades = entregas.filter((entrega) => {
    const entregaTpId = Number(
      entrega?.tp_id ?? entrega?.tp?.id ?? entrega?.Tp?.ID,
    );
    const isComisionTp =
      Number.isFinite(entregaTpId) && comisionTpIds.has(entregaTpId);
    return (
      isComisionTp && (entrega?.estado === "pendiente" || entrega?.nota == null)
    );
  }).length;

  const handleCreateCompetencia = async () => {
    if (!competenciaNombre.trim()) return;
    const materiaId = comision?.materia?.id;
    if (!materiaId) {
      console.error("No hay materia para asociar la competencia");
      return;
    }
    setCreatingCompetencia(true);
    try {
      const created = await materiaCompetenciaAPI.create(String(materiaId), {
        nombre: competenciaNombre.trim(),
        descripcion: competenciaDescripcion.trim(),
      });
      const newItem = created?.data || created;
      setCompetencias((prev) => [...prev, newItem]);
      setCompetenciaNombre("");
      setCompetenciaDescripcion("");
    } catch (err) {
      console.error("Error creating competencia:", err);
    } finally {
      setCreatingCompetencia(false);
    }
  };

  const handleEditCompetencia = (competencia: any) => {
    setEditingCompetenciaId(competencia.id);
    setEditingNombre(competencia.nombre || "");
    setEditingDescripcion(competencia.descripcion || "");
  };

  const handleSaveCompetencia = async (id: number) => {
    if (!editingNombre.trim()) return;
    try {
      const updated = await materiaCompetenciaAPI.update(String(id), {
        nombre: editingNombre.trim(),
        descripcion: editingDescripcion.trim(),
      });
      const updatedItem = updated?.data || updated;
      setCompetencias((prev) =>
        prev.map((c) => (c.id === id ? updatedItem : c)),
      );
      setEditingCompetenciaId(null);
      setEditingNombre("");
      setEditingDescripcion("");
    } catch (err) {
      console.error("Error updating competencia:", err);
    }
  };

  const getFinalAverageForCursada = (cursada: any) => {
    const cursadaId = Number(cursada?.id);
    const alumnoId = Number(cursada?.alumno?.id ?? cursada?.alumno_id);
    const tpGrades = entregas
      .filter((entrega) => {
        const entregaCursadaId = Number(
          entrega?.cursada_id ?? entrega?.cursada?.id,
        );
        return Number.isFinite(entregaCursadaId) && entregaCursadaId === cursadaId;
      })
      .map((entrega) => Number(entrega?.nota))
      .filter((nota) => Number.isFinite(nota));

    const evaluacionGrades = evaluacionEntregas
      .filter((entrega) => {
        const entregaAlumnoId = Number(
          entrega?.alumno_id ?? entrega?.alumno?.id,
        );
        return (
          Number.isFinite(entregaAlumnoId) && entregaAlumnoId === alumnoId
        );
      })
      .map((entrega) => Number(entrega?.nota))
      .filter((nota) => Number.isFinite(nota));

    const finalGrades = [...tpGrades, ...evaluacionGrades];
    if (finalGrades.length === 0) return null;

    const average =
      finalGrades.reduce((total, value) => total + value, 0) /
      finalGrades.length;
    return average.toFixed(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teacher">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {comision.materia?.nombre || "Materia"}
            </h1>
            <p className="text-muted-foreground">
              {comision.nombre} - {comision.horarios}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cursadas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trabajos Prácticos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tps.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Evaluaciones
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluaciones.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Por Calificar
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingGrades}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Estudiantes
            </CardTitle>
            <CardDescription>
              Lista de estudiantes cursando esta materia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cursadas.length > 0 ? (
              <div className="space-y-3">
                {cursadas.map((cursada) => (
                  <div
                    key={cursada.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {cursada.alumno?.nombre} {cursada.alumno?.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Legajo: {cursada.alumno?.legajo}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      {(() => {
                        const finalAverage = getFinalAverageForCursada(cursada);
                        if (!finalAverage) return null;
                        return (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Nota Final
                          </p>
                          <p className="text-lg font-bold">
                            {finalAverage}
                          </p>
                        </div>
                        );
                      })()}
                      {cursada.nota_conceptual > 0 && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Conceptual
                          </p>
                          <p className="text-lg font-bold">
                            {cursada.nota_conceptual}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay estudiantes inscriptos
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback de cursada</CardTitle>
            <CardDescription>
              Comentarios generales entre estudiantes y profesor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cursadas.length > 0 ? (
              <div className="space-y-4">
                {cursadas.map((cursada) => {
                  const parsed = parseFeedback(cursada.feedback);
                  const draft =
                    profesorFeedbacks[cursada.id] ?? parsed.profesor ?? "";
                  const isExpanded = expandedFeedbackId === cursada.id;
                  return (
                    <div
                      key={cursada.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {cursada.alumno?.nombre} {cursada.alumno?.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Legajo: {cursada.alumno?.legajo}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedFeedbackId(
                              isExpanded ? null : cursada.id,
                            )
                          }
                        >
                          {isExpanded ? "Ocultar" : "Ver feedback"}
                        </Button>
                      </div>
                      {isExpanded ? (
                        <>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Feedback general del alumno
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {parsed.alumno || "Sin feedback"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Feedback general del profesor</Label>
                            <Textarea
                              value={draft}
                              onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                              ) =>
                                setProfesorFeedbacks((prev) => ({
                                  ...prev,
                                  [cursada.id]: e.target.value,
                                }))
                              }
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => handleSaveFeedback(cursada)}
                              disabled={savingFeedbackIds[cursada.id]}
                            >
                              {savingFeedbackIds[cursada.id]
                                ? "Guardando..."
                                : "Guardar"}
                            </Button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay estudiantes inscriptos
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competencias</CardTitle>
            <CardDescription>
              Competencias asociadas a esta materia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competencia-nombre">Nombre</Label>
              <Input
                id="competencia-nombre"
                value={competenciaNombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCompetenciaNombre(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competencia-descripcion">Descripción</Label>
              <Textarea
                id="competencia-descripcion"
                value={competenciaDescripcion}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCompetenciaDescripcion(e.target.value)
                }
                rows={4}
              />
            </div>
            <Button
              onClick={handleCreateCompetencia}
              disabled={creatingCompetencia}
            >
              {creatingCompetencia ? "Guardando..." : "Agregar Competencia"}
            </Button>

            {competencias.length > 0 ? (
              <div className="space-y-3">
                {competencias.map((competencia) => (
                  <div
                    key={competencia.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {editingCompetenciaId === competencia.id ? (
                      <>
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input
                            value={editingNombre}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setEditingNombre(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descripción</Label>
                          <Textarea
                            value={editingDescripcion}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setEditingDescripcion(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleSaveCompetencia(competencia.id)
                            }
                          >
                            Guardar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingCompetenciaId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="font-medium">{competencia.nombre}</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {competencia.descripcion || "Sin descripción"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCompetencia(competencia)}
                        >
                          Editar
                        </Button>
                      </>
                    )}
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Trabajos Prácticos
                </CardTitle>
                <CardDescription>
                  Trabajos asignados a esta comisión
                </CardDescription>
              </div>
              <Link href="/dashboard/teacher/trabajos">
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {tps.length > 0 ? (
              <div className="space-y-3">
                {tps.map((tp) => {
                  const consignaStr = tp.consigna ? String(tp.consigna) : "";
                  const firstLine = consignaStr
                    ? consignaStr.split("\n")[0].trim()
                    : "";
                  const tpTitle =
                    tp.titulo ||
                    tp.nombre ||
                    (firstLine ? firstLine.slice(0, 80) : `TP #${tp.id}`);
                  const consignaPreview =
                    consignaStr && tpTitle === firstLine.slice(0, 80)
                      ? consignaStr.split("\n").slice(1).join(" ").trim()
                      : consignaStr;
                  return (
                    <div
                      key={tp.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{tpTitle}</p>
                        {consignaPreview ? (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {consignaPreview}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          Entrega:{" "}
                          {format(new Date(tp.fecha_entrega), "dd/MM/yyyy")}
                        </div>
                        <Link href={`/dashboard/teacher/trabajos/${tp.id}`}>
                          <Button size="sm" variant="outline">
                            Ver Entregas
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay trabajos prácticos asignados
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Evaluaciones
                </CardTitle>
                <CardDescription>
                  Evaluaciones programadas para esta comisión
                </CardDescription>
              </div>
              <Link href="/dashboard/teacher/evaluaciones">
                <Button variant="outline" size="sm">
                  Ver Todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {evaluaciones.length > 0 ? (
              <div className="space-y-3">
                {evaluaciones.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{ev.temas}</p>
                      <p className="text-sm text-muted-foreground">
                        Fecha:{" "}
                        {format(new Date(ev.fecha_evaluacion), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <Link href={`/dashboard/teacher/evaluaciones/${ev.id}`}>
                      <Button size="sm" variant="outline">
                        Ver Detalle
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay evaluaciones programadas
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
