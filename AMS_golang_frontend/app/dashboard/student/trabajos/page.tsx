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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tpAPI, entregaTPAPI, cursadaAPI, competenciaAPI } from "@/lib/api";
import {
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function TrabajosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTP, setSelectedTP] = useState<any>(null);
  const [archivoUrl, setArchivoUrl] = useState("");

  const [tps, setTps] = useState<any[]>([]);
  const [entregas, setEntregas] = useState<any[]>([]);
  const [cursadas, setCursadas] = useState<any[]>([]);
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "student" && user.role !== "alumno"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && (user.role === "student" || user.role === "alumno")) {
      setLoading(true);
      Promise.all([
        tpAPI.getMyAsStudent().catch(() => []),
        entregaTPAPI.getMine(),
        cursadaAPI.getByAlumno(user.id.toString()),
        competenciaAPI.getAll().catch(() => []),
      ])
        .then(
          ([
            tpsResponse,
            entregasResponse,
            cursadasResponse,
            competenciasResponse,
          ]) => {
            console.log("Student TPs data:", {
              tpsResponse,
              entregasResponse,
              cursadasResponse,
              competenciasResponse,
            });

            const tpsList =
              tpsResponse.data || tpsResponse.tps || tpsResponse || [];
            const entregasList =
              entregasResponse.data ||
              entregasResponse.entregas ||
              entregasResponse ||
              [];
            const cursadasList =
              cursadasResponse.data ||
              cursadasResponse.cursadas ||
              cursadasResponse ||
              [];
            const competenciasList =
              competenciasResponse.data || competenciasResponse || [];

            setTps(Array.isArray(tpsList) ? tpsList : []);
            setEntregas(Array.isArray(entregasList) ? entregasList : []);
            setCursadas(Array.isArray(cursadasList) ? cursadasList : []);
            setCompetencias(
              Array.isArray(competenciasList) ? competenciasList : [],
            );
          },
        )
        .catch((err) => {
          console.error("Error loading student TPs:", err);
          setTps([]);
          setEntregas([]);
          setCursadas([]);
          setCompetencias([]);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

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

  const availableTPs = tps;

  const pendingTPs = availableTPs.filter(
    (tp) => !entregas.some((e) => e.tp_id === tp.id),
  );
  const submittedTPs = entregas;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedTP || !archivoUrl.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa la URL del archivo",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const cursada = cursadas.find(
        (c) => c.comision_id === selectedTP.comision_id,
      );
      if (!cursada) {
        throw new Error("No se encontró la cursada para esta comisión");
      }

      await entregaTPAPI.create({
        tp_id: selectedTP.id,
        cursada_id: cursada.id,
        archivo_url: archivoUrl,
      });

      toast({
        title: "Entrega enviada",
        description: "Tu trabajo ha sido enviado exitosamente",
      });

      const entregasResponse = await entregaTPAPI.getMine();
      const entregasList =
        entregasResponse.data ||
        entregasResponse.entregas ||
        entregasResponse ||
        [];
      setEntregas(Array.isArray(entregasList) ? entregasList : []);

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedTP(null);
      setArchivoUrl("");
    } catch (error: any) {
      console.error("Error submitting TP:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la entrega",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toLocalDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const renderPendingTPCard = (tp: any) => {
    const entregaDate = toLocalDate(tp.fecha_entrega);
    const daysUntil = entregaDate
      ? Math.ceil(
          (entregaDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;
    const isOverdue = daysUntil < 0;
    const tpCompetencias = competencias.filter(
      (c) => Number(c.tp_id) === Number(tp.id),
    );

    return (
      <Card key={tp.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">
                {tp.comision?.nombre || `Comisión ${tp.comision_id}`}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {tp.consigna}
              </CardDescription>
            </div>
            {isOverdue ? (
              <Badge variant="destructive">Vencido</Badge>
            ) : (
              <Badge variant="secondary">Pendiente</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tpCompetencias.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Competencias del TP</p>
              <div className="space-y-2">
                {tpCompetencias.map((competencia: any) => (
                  <div key={competencia.id} className="border rounded-lg p-3">
                    <p className="text-sm font-medium">{competencia.nombre}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {competencia.descripcion || "Sin descripción"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha de entrega</p>
              <p className="font-medium">
                {entregaDate ? format(entregaDate, "dd/MM/yyyy") : "Sin fecha"}
              </p>
            </div>
          </div>

          <Dialog
            open={uploadDialogOpen && selectedTP?.id === tp.id}
            onOpenChange={setUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full" onClick={() => setSelectedTP(tp)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir Entrega
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Entrega</DialogTitle>
                <DialogDescription>Sube tu trabajo práctico</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="archivo_url">URL del Archivo</Label>
                  <Input
                    id="archivo_url"
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={archivoUrl}
                    onChange={(e) => setArchivoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ingresa el enlace a tu archivo (Google Drive, Dropbox, etc.)
                  </p>
                </div>
                <Button
                  onClick={handleUpload}
                  className="w-full"
                  disabled={!archivoUrl.trim() || submitting}
                >
                  {submitting ? "Enviando..." : "Confirmar Entrega"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  const renderSubmittedTPCard = (entrega: any) => {
    const tpId = entrega.tp_id ?? entrega.tp?.id;
    const tpCompetencias = competencias.filter(
      (c) => Number(c.tp_id) === Number(tpId),
    );
    const entregaDate = toLocalDate(entrega.fecha_entrega);
    return (
      <Card key={entrega.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">
                {entrega.tp?.comision?.nombre || `TP #${entrega.tp_id}`}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {entrega.tp?.consigna}
              </CardDescription>
            </div>
            {entrega.nota ? (
              <Badge className="bg-green-500 hover:bg-green-600">
                Calificado: {entrega.nota}
              </Badge>
            ) : (
              <Badge variant="secondary">En revisión</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tpCompetencias.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Competencias del TP</p>
              <div className="space-y-2">
                {tpCompetencias.map((competencia: any) => (
                  <div key={competencia.id} className="border rounded-lg p-3">
                    <p className="text-sm font-medium">{competencia.nombre}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {competencia.descripcion || "Sin descripción"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Entregado</p>
                <p className="font-medium">
                  {entregaDate
                    ? format(entregaDate, "dd/MM/yyyy")
                    : "Sin fecha"}
                </p>
              </div>
            </div>
            {entrega.nota && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Calificación</p>
                  <p className="font-medium text-lg">{entrega.nota}</p>
                </div>
              </div>
            )}
          </div>

          {entrega.devolucion && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">
                Devolución del profesor:
              </p>
              <p className="text-sm text-muted-foreground">
                {entrega.devolucion}
              </p>
            </div>
          )}

          {entrega.archivo_url && (
            <div className="text-xs text-muted-foreground">
              Archivo: {entrega.archivo_url}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Trabajos Prácticos
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus entregas y consulta calificaciones
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pendientes ({pendingTPs.length})
              </TabsTrigger>
              <TabsTrigger value="submitted" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Entregados ({submittedTPs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingTPs.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingTPs.map(renderPendingTPCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">
                      No hay trabajos pendientes
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Todos tus trabajos están al día
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4">
              {submittedTPs.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {submittedTPs.map(renderSubmittedTPCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">
                      No hay trabajos entregados
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Aún no has entregado ningún trabajo
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
