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
import { comisionAPI, cursadaAPI, tpAPI, evaluacionAPI } from "@/lib/api";
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
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
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
        evaluacionAPI.getByComision(comisionId),
      ])
        .then(([comisionRes, cursadasRes, tpsRes, evaluacionesRes]) => {
          console.log("Comision detail data:", {
            comisionRes,
            cursadasRes,
            tpsRes,
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

          const evaluacionesList =
            evaluacionesRes.data || evaluacionesRes || [];
          setEvaluaciones(
            Array.isArray(evaluacionesList) ? evaluacionesList : [],
          );
        })
        .catch((err) => {
          console.error("Error loading comision data:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [user, comisionId]);

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

  const pendingGrades = tps.filter((tp) => !tp.nota).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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

        {/* Stats */}
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

        {/* Students List */}
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
                      {cursada.nota_final > 0 && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Nota Final
                          </p>
                          <p className="text-lg font-bold">
                            {cursada.nota_final}
                          </p>
                        </div>
                      )}
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

        {/* TPs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Trabajos Prácticos
            </CardTitle>
            <CardDescription>
              Trabajos asignados a esta comisión
            </CardDescription>
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

        {/* Evaluaciones List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Evaluaciones
            </CardTitle>
            <CardDescription>
              Evaluaciones programadas para esta comisión
            </CardDescription>
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
