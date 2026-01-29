"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tpAPI } from "@/lib/api";
import { FileText, CheckCircle2, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function TeacherTrabajosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [tps, setTps] = useState<any[]>([]);
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
    if (user) {
      setLoading(true);
      tpAPI
        .getMine()
        .then((response) => {
          console.log("TPs response:", response);
          const tpsList = response.data || response.tps || response || [];
          setTps(Array.isArray(tpsList) ? tpsList : []);
        })
        .catch((err) => {
          console.error("Error loading TPs:", err);
          setTps([]);
        })
        .finally(() => setLoading(false));
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

  // Note: Backend TPs don't have a 'nota' field - they represent assignments, not submissions
  // For now, treat all TPs as pending (assignments waiting for submissions)
  const pendingTPs = tps;
  const gradedTPs: any[] = [];

  const renderTPCard = (tp: any) => {
    const consignaStr = tp.consigna ? String(tp.consigna) : "";
    const firstLine = consignaStr ? consignaStr.split("\n")[0].trim() : "";
    const tpTitle =
      tp.titulo ||
      tp.nombre ||
      (firstLine ? firstLine.slice(0, 80) : `TP #${tp.id}`);
    // If the title came from the first line of the consigna, avoid repeating it below;
    // show the remaining lines (joined) or nothing if no more content.
    const consignaPreview =
      consignaStr && tpTitle === firstLine.slice(0, 80)
        ? consignaStr.split("\n").slice(1).join(" ").trim()
        : consignaStr;

    return (
      <Card key={tp.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{tpTitle}</CardTitle>
              <CardDescription>
                {tp.comision?.nombre || `Comisión ${tp.comision_id}`}
              </CardDescription>
              {consignaPreview ? (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {consignaPreview}
                </p>
              ) : null}
            </div>
            <Badge variant="secondary">
              {tp.vigente ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fecha de entrega</span>
            <span className="font-medium">
              {format(new Date(tp.fecha_entrega), "dd/MM/yyyy")}
            </span>
          </div>

          <Link href={`/dashboard/teacher/trabajos/${tp.id}`}>
            <Button variant="outline" className="w-full bg-transparent">
              Ver Entregas
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Trabajos Prácticos
            </h1>
            <p className="text-muted-foreground">
              Gestiona y califica los trabajos de tus estudiantes
            </p>
          </div>
          <Link href="/dashboard/teacher/trabajos/crear">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo TP
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <FileText className="h-4 w-4" />
              Mis Trabajos ({pendingTPs.length})
            </TabsTrigger>
            <TabsTrigger value="graded" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Entregas ({gradedTPs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : pendingTPs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingTPs.map((tp) => renderTPCard(tp))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">
                    No hay trabajos prácticos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crea un nuevo TP para comenzar
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Entregas de estudiantes</p>
                <p className="text-sm text-muted-foreground">
                  Haz clic en un TP para ver las entregas
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
