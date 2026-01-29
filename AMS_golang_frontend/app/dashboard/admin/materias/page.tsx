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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { materiaAPI } from "@/lib/api";
import { BookOpen, Search, Plus, GraduationCap } from "lucide-react";
import Link from "next/link";

type Materia = {
  id: number;
  nombre: string;
  ano_carrera: number;
};

export default function AdminMateriasPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoadingData(true);
        const data = await materiaAPI.getAll();
        setMaterias(data || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar materias"
        );
        setMaterias([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (user && user.role === "admin") {
      fetchMaterias();
    }
  }, [user]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredMaterias = materias.filter((materia) =>
    materia.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Gestión de Materias
            </h1>
            <p className="text-muted-foreground">
              Administra las cátedras del sistema
            </p>
          </div>
          <Link href="/dashboard/admin/materias/crear">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Materias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Materias Grid */}
        {loadingData ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : filteredMaterias.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron materias
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterias.map((materia) => (
              <Card
                key={materia.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{materia.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Año {materia.ano_carrera}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/dashboard/admin/materias/${materia.id}`}>
                    <Button variant="outline" className="w-full bg-transparent">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
