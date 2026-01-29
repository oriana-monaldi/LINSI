"use client";

import * as React from "react";
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
import {
  materiaAPI,
  comisionAPI,
  profesorXComisionAPI,
  profesorAPI,
} from "@/lib/api";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Save,
  X,
  GraduationCap,
  BookOpen,
  Plus,
  Users,
  Clock,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type Materia = {
  id: number;
  nombre: string;
  ano_carrera: number;
};

type Comision = {
  id: number;
  nombre: string;
  horarios: string;
  materia_id: number;
};

type Profesor = {
  id: number;
  nombre: string;
  apellido: string;
  legajo: string;
};

type ProfesorXComision = {
  id: number;
  cargo: string;
  profesor_id: number;
  comision_id: number;
  profesor?: Profesor;
};

export default function AdminMateriaDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const materiaId = params.id as string;

  // Materia state
  const [materia, setMateria] = useState<Materia | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editAnoCarrera, setEditAnoCarrera] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
  }>({ open: false, message: "", onConfirm: async () => {} });

  // Comisiones state
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loadingComisiones, setLoadingComisiones] = useState(true);
  const [showNewComision, setShowNewComision] = useState(false);
  const [newComisionNombre, setNewComisionNombre] = useState("");
  const [newComisionHorarios, setNewComisionHorarios] = useState("");
  const [creatingComision, setCreatingComision] = useState(false);

  // Profesores assignment state
  const [profesoresAsignados, setProfesoresAsignados] = useState<
    Record<number, ProfesorXComision[]>
  >({});
  const [allProfesores, setAllProfesores] = useState<Profesor[]>([]);
  const [showAssignProfesor, setShowAssignProfesor] = useState<number | null>(
    null
  );
  const [selectedProfesorId, setSelectedProfesorId] = useState("");
  const [selectedCargo, setSelectedCargo] = useState<string>("JTP");
  const [assigningProfesor, setAssigningProfesor] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setLoadingComisiones(true);

        const [materiaData, comisionesData, profesoresData] = await Promise.all(
          [
            materiaAPI.getById(materiaId),
            comisionAPI.getByMateria(materiaId),
            profesorAPI.getAll(),
          ]
        );

        setMateria(materiaData);
        setEditNombre(materiaData.nombre);
        setEditAnoCarrera(materiaData.ano_carrera.toString());
        setComisiones(comisionesData || []);
        setAllProfesores(profesoresData || []);

        // Fetch professors for each comision
        const asignaciones: Record<number, ProfesorXComision[]> = {};
        for (const comision of comisionesData || []) {
          try {
            const profs = await profesorXComisionAPI.getByComision(
              comision.id.toString()
            );
            asignaciones[comision.id] = profs || [];
          } catch {
            asignaciones[comision.id] = [];
          }
        }
        setProfesoresAsignados(asignaciones);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
        setMateria(null);
      } finally {
        setLoadingData(false);
        setLoadingComisiones(false);
      }
    };

    if (user && user.role === "admin" && materiaId) {
      fetchData();
    }
  }, [user, materiaId]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!materia) return;
    setSaving(true);
    setError(null);

    try {
      const updated = await materiaAPI.update(materiaId, {
        nombre: editNombre,
        ano_carrera: parseInt(editAnoCarrera, 10),
      });
      setMateria(updated);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar materia"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setConfirmDialog({
      open: true,
      message: "¿Estás seguro de eliminar esta materia?",
      onConfirm: async () => {
        setConfirmDialog((s) => ({ ...s, open: false }));
        setDeleting(true);
        setError(null);
        try {
          await materiaAPI.delete(materiaId);
          router.push("/dashboard/admin/materias");
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : "Error al eliminar materia";
          if (
            errorMsg.includes("foreign key") ||
            errorMsg.includes("constraint") ||
            errorMsg.includes("23503")
          ) {
            setError(
              "No se puede eliminar esta materia porque tiene comisiones asociadas. Elimina primero las comisiones."
            );
          } else {
            setError(errorMsg);
          }
          setDeleting(false);
        }
      },
    });
  };

  const handleCancelEdit = () => {
    if (materia) {
      setEditNombre(materia.nombre);
      setEditAnoCarrera(materia.ano_carrera.toString());
    }
    setEditing(false);
  };

  const handleCreateComision = async () => {
    if (!newComisionNombre || !newComisionHorarios) return;
    setCreatingComision(true);
    setError(null);

    try {
      const newComision = await comisionAPI.create({
        nombre: newComisionNombre,
        horarios: newComisionHorarios,
        materia_id: parseInt(materiaId, 10),
      });
      setComisiones([...comisiones, newComision]);
      setProfesoresAsignados({ ...profesoresAsignados, [newComision.id]: [] });
      setNewComisionNombre("");
      setNewComisionHorarios("");
      setShowNewComision(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear comision");
    } finally {
      setCreatingComision(false);
    }
  };

  const handleDeleteComision = (comisionId: number) => {
    const assignedProfs = profesoresAsignados[comisionId] || [];
    const confirmMsg =
      assignedProfs.length > 0
        ? `Esta comision tiene ${assignedProfs.length} profesor(es) asignado(s). Se eliminaran las asignaciones. ¿Continuar?`
        : "¿Estás seguro de eliminar esta comision?";

    setConfirmDialog({
      open: true,
      message: confirmMsg,
      onConfirm: async () => {
        setConfirmDialog((s) => ({ ...s, open: false }));
        setError(null);

        try {
          for (const asig of assignedProfs) {
            await profesorXComisionAPI.delete(asig.id.toString());
          }

          await comisionAPI.delete(comisionId.toString());
          setComisiones(comisiones.filter((c) => c.id !== comisionId));
          const newAsignados = { ...profesoresAsignados };
          delete newAsignados[comisionId];
          setProfesoresAsignados(newAsignados);
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : "Error al eliminar comision";
          if (
            errorMsg.includes("foreign key") ||
            errorMsg.includes("constraint") ||
            errorMsg.includes("cursada")
          ) {
            setError(
              "No se puede eliminar esta comision porque tiene cursadas activas. Elimina primero las cursadas."
            );
          } else {
            setError(errorMsg);
          }
        }
      },
    });
  };

  const handleAssignProfesor = async (comisionId: number) => {
    if (!selectedProfesorId || !selectedCargo) return;
    setAssigningProfesor(true);
    setError(null);

    try {
      const assignment = await profesorXComisionAPI.create({
        profesor_id: parseInt(selectedProfesorId, 10),
        comision_id: comisionId,
        cargo: selectedCargo as "Titular" | "Adjunto" | "JTP",
      });

      // Add profesor info to the assignment
      const profesor = allProfesores.find(
        (p) => p.id === parseInt(selectedProfesorId, 10)
      );
      const fullAssignment = { ...assignment, profesor };

      setProfesoresAsignados({
        ...profesoresAsignados,
        [comisionId]: [
          ...(profesoresAsignados[comisionId] || []),
          fullAssignment,
        ],
      });
      setShowAssignProfesor(null);
      setSelectedProfesorId("");
      setSelectedCargo("JTP");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al asignar profesor"
      );
    } finally {
      setAssigningProfesor(false);
    }
  };

  const handleRemoveProfesor = (assignmentId: number, comisionId: number) => {
    setConfirmDialog({
      open: true,
      message: "¿Quitar este profesor de la comision?",
      onConfirm: async () => {
        setConfirmDialog((s) => ({ ...s, open: false }));
        setError(null);

        try {
          await profesorXComisionAPI.delete(assignmentId.toString());
          setProfesoresAsignados({
            ...profesoresAsignados,
            [comisionId]: profesoresAsignados[comisionId].filter(
              (a) => a.id !== assignmentId
            ),
          });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Error al quitar profesor"
          );
        }
      },
    });
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !materia) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link href="/dashboard/admin/materias">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-lg font-medium text-destructive">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!materia) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Link href="/dashboard/admin/materias">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="text-center py-12">
            <p className="text-lg font-medium">Materia no encontrada</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/materias">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              {materia.nombre}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Año {materia.ano_carrera}
            </p>
          </div>
    
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informacion de la Materia</CardTitle>
            <CardDescription>
              {editing
                ? "Modifica los datos de la materia"
                : "Detalles de la materia"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anoCarrera">Año de Carrera</Label>
                  <select
                    id="anoCarrera"
                    value={editAnoCarrera}
                    onChange={(e) => setEditAnoCarrera(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="1">1er Año</option>
                    <option value="2">2do Año</option>
                    <option value="3">3er Año</option>
                    <option value="4">4to Año</option>
                    <option value="5">5to Año</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="text-lg font-medium">{materia.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Año de Carrera
                  </p>
                  <p className="text-lg font-medium">
                    {materia.ano_carrera}° Año
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comisiones ({comisiones.length})
                </CardTitle>
                <CardDescription>
                  Secciones de clase para esta materia
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowNewComision(true)}
                disabled={showNewComision}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Comision
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNewComision && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/50 space-y-4">
                <h4 className="font-medium">Nueva Comision</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Ej: Comision A"
                      value={newComisionNombre}
                      onChange={(e) => setNewComisionNombre(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horarios</Label>
                    <Input
                      placeholder="Ej: Lunes 14:00-18:00"
                      value={newComisionHorarios}
                      onChange={(e) => setNewComisionHorarios(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateComision}
                    disabled={creatingComision}
                  >
                    {creatingComision ? "Creando..." : "Crear Comision"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewComision(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {loadingComisiones ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : comisiones.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No hay comisiones creadas
              </p>
            ) : (
              <div className="space-y-4">
                {comisiones.map((comision) => (
                  <div
                    key={comision.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-lg">
                          {comision.nombre}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {comision.horarios}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/admin/cursadas?comision=${comision.id}`}
                        >
                          <Button variant="outline" size="sm">
                            Ver Cursadas
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteComision(comision.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pl-4 border-l-2 border-muted">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          Profesores asignados:
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowAssignProfesor(
                              showAssignProfesor === comision.id
                                ? null
                                : comision.id
                            )
                          }
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Asignar
                        </Button>
                      </div>

                      {showAssignProfesor === comision.id && (
                        <div className="mb-3 p-3 bg-muted/50 rounded space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Profesor</Label>
                              <select
                                value={selectedProfesorId}
                                onChange={(e) =>
                                  setSelectedProfesorId(e.target.value)
                                }
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                              >
                                <option value="">Seleccionar...</option>
                                {allProfesores.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nombre} {p.apellido}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Cargo</Label>
                              <select
                                value={selectedCargo}
                                onChange={(e) =>
                                  setSelectedCargo(e.target.value)
                                }
                                className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                              >
                                <option value="Titular">Titular</option>
                                <option value="Adjunto">Adjunto</option>
                                <option value="JTP">JTP</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAssignProfesor(comision.id)}
                              disabled={
                                assigningProfesor || !selectedProfesorId
                              }
                            >
                              {assigningProfesor ? "Asignando..." : "Asignar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowAssignProfesor(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      {(profesoresAsignados[comision.id] || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Sin profesores asignados
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {profesoresAsignados[comision.id].map((asig) => (
                            <div
                              key={asig.id}
                              className="flex items-center justify-between text-sm py-1"
                            >
                              <span>
                                {asig.profesor?.nombre}{" "}
                                {asig.profesor?.apellido}
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  {asig.cargo}
                                </span>
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  handleRemoveProfesor(asig.id, comision.id)
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
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
