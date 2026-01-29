"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { alumnoAPI, profesorAPI, adminAPI } from "@/lib/api";

export default function CrearUsuarioPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const idParam = searchParams.get("id");
  const isEdit = Boolean(idParam);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [legajo, setLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(
    roleParam === "teacher"
      ? "teacher"
      : roleParam === "student"
        ? "student"
        : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If editing, fetch existing user data and prefill the form
    const fetchUser = async () => {
      if (!isEdit || !role) return;
      setSubmitting(true);
      try {
        if (role === "teacher") {
          const data = await profesorAPI.getById(idParam!);
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setEmail(data.email || "");
          setLegajo(data.legajo ? String(data.legajo) : "");
          setTelefono(data.telefono || "");
        } else if (role === "student") {
          const data = await alumnoAPI.getById(idParam!);
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setEmail(data.email || "");
          setLegajo(data.legajo ? String(data.legajo) : "");
          setTelefono((data as any).telefono || "");
        } else if (role === "admin") {
          const data = await adminAPI.getById(idParam!);
          setNombre(data.nombre || "");
          setApellido(data.apellido || "");
          setEmail(data.email || "");
          setTelefono((data as any).telefono || "");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuario",
        );
      } finally {
        setSubmitting(false);
      }
    };

    fetchUser();
  }, [isEdit, role, idParam]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit && idParam) {
        // Update existing user
        const payload: any = { nombre, apellido, email };
        if (legajo) payload.legajo = legajo;
        if (telefono) payload.telefono = telefono;
        if (password) payload.password = password;

        if (role === "student") {
          await alumnoAPI.update(idParam, payload);
          router.push("/dashboard/admin/estudiantes");
        } else if (role === "teacher") {
          await profesorAPI.update(idParam, payload);
          router.push("/dashboard/admin/profesores");
        } else if (role === "admin") {
          await adminAPI.update(idParam, payload);
          router.push("/dashboard/admin");
        }
      } else {
        // Create new user
        if (role === "student") {
          await alumnoAPI.create({ nombre, apellido, email, password, legajo });
          router.push("/dashboard/admin/estudiantes");
        } else if (role === "teacher") {
          await profesorAPI.create({
            nombre,
            apellido,
            email,
            password,
            legajo,
          });
          router.push("/dashboard/admin/profesores");
        } else if (role === "admin") {
          await adminAPI.create({ nombre, apellido, email, password });
          router.push("/dashboard/admin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Editar Usuario" : "Crear Usuario"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Modifica los datos del usuario"
                : "Agrega un nuevo usuario al sistema"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Completa los datos del nuevo usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuario</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Selecciona el tipo de usuario</option>
                  <option value="student">Estudiante</option>
                  <option value="teacher">Profesor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    placeholder="Pérez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="legajo">Legajo</Label>
                <Input
                  id="legajo"
                  placeholder="12345"
                  value={legajo}
                  onChange={(e) => setLegajo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    isEdit
                      ? "Dejar vacío para mantener la actual"
                      : "Mínimo 8 caracteres"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEdit}
                  minLength={isEdit ? undefined : 8}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {submitting
                    ? isEdit
                      ? "Guardando..."
                      : "Creando..."
                    : isEdit
                      ? "Guardar cambios"
                      : "Crear Usuario"}
                </Button>
                <Link href="/dashboard/admin" className="flex-1">
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
