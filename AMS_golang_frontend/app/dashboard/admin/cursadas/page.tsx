"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { cursadaAPI, comisionAPI } from "@/lib/api";
import { FileText, Search, Plus, Trash2, UserPlus } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Link from "next/link";

type Alumno = {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
};

type Materia = {
  id: number;
  nombre: string;
};

type Comision = {
  id: number;
  nombre: string;
  horarios: string;
  materia?: Materia;
};

type Cursada = {
  id: number;
  ano_lectivo: number;
  nota_final: number | null;
  nota_conceptual: number | null;
  feedback: string;
  alumno_id: number;
  comision_id: number;
  alumno: Alumno;
  comision: Comision;
};

function CursadasContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const comisionFilter = searchParams.get("comision");

  const [searchTerm, setSearchTerm] = useState("");
  const [cursadas, setCursadas] = useState<Cursada[]>([]);
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComision, setSelectedComision] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({ open: false, message: "", onConfirm: async () => {} });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (comisionFilter) {
      setSelectedComision(comisionFilter);
    }
  }, [comisionFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [cursadasData, comisionesData] = await Promise.all([
          cursadaAPI.getAll(),
          comisionAPI.getAll(),
        ]);
        setCursadas(cursadasData || []);
        setComisiones(comisionesData || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
        setCursadas([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && user.role === "admin") {
      fetchData();
    }
  }, [user]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleDeleteCursada = (cursadaId: number) => {
    setConfirmDialog({
      open: true,
      message: "¿Estás seguro de eliminar esta cursada?",
      onConfirm: async () => {
        setConfirmDialog((s) => ({ ...s, open: false }));
        setError(null);
        try {
          await cursadaAPI.delete(cursadaId.toString());
          setCursadas(cursadas.filter((c) => c.id !== cursadaId));
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error al eliminar cursada"
          );
        }
      },
    });
  };

  const filteredCursadas = cursadas.filter((cursada) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      cursada.alumno?.nombre?.toLowerCase().includes(searchLower) ||
      cursada.alumno?.apellido?.toLowerCase().includes(searchLower) ||
      cursada.comision?.nombre?.toLowerCase().includes(searchLower) ||
      cursada.comision?.materia?.nombre?.toLowerCase().includes(searchLower);

    const matchesComision =
      !selectedComision ||
      cursada.comision_id === parseInt(selectedComision, 10);

    return matchesSearch && matchesComision;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Gestion de Cursadas
            </h1>
            <p className="text-muted-foreground">
              Administra las inscripciones de estudiantes
            </p>
          </div>
          <Link
            href={
              selectedComision
                ? `/dashboard/admin/cursadas/crear?comision=${selectedComision}`
                : "/dashboard/admin/cursadas/crear"
            }
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Inscribir Estudiante
            </Button>
          </Link>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Buscar Cursadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por estudiante o materia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedComision}
                onChange={(e) => setSelectedComision(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todas las comisiones</option>
                {comisiones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.materia?.nombre} - {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cursadas ({filteredCursadas.length})</CardTitle>
            <CardDescription>Lista de todas las inscripciones</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCursadas.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No se encontraron cursadas
              </p>
            ) : (
              <div className="space-y-3">
                {filteredCursadas.map((cursada) => (
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
                      <p className="text-sm text-muted-foreground">
                        {cursada.comision?.materia?.nombre} -{" "}
                        {cursada.comision?.nombre}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Año</p>
                        <p className="text-lg font-bold">
                          {cursada.ano_lectivo}
                        </p>
                      </div>
                      {cursada.nota_conceptual !== null && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Conceptual
                          </p>
                          <p className="text-lg font-bold">
                            {cursada.nota_conceptual}
                          </p>
                        </div>
                      )}
                      {cursada.nota_final !== null && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Final</p>
                          <p className="text-lg font-bold">
                            {cursada.nota_final}
                          </p>
                        </div>
                      )}
                      <Link
                        href={`/dashboard/admin/cursadas/crear?comision=${cursada.comision_id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          title="Inscribir otro estudiante"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCursada(cursada.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={confirmDialog.open}
        setOpen={(open) => setConfirmDialog((s) => ({ ...s, open }))}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
      />
    </DashboardLayout>
  );
}

export default function AdminCursadasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CursadasContent />
    </Suspense>
  );
}
