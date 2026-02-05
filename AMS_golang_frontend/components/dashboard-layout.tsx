"use client";

import type React from "react";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { GraduationCap, Bell, LogOut, CheckCheck } from "lucide-react";

import { notificacionAPI } from "@/lib/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Notificacion {
  id: number;
  mensaje: string;
  fecha_hora: string;
  leida: boolean;
  alumno_id: number;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id || (user.role !== "student" && user.role !== "alumno"))
        return;

      try {
        const data = await notificacionAPI.getByAlumno(String(user.id));
        setNotificaciones(data || []);
        setUnreadCount(
          (data || []).filter((n: Notificacion) => !n.leida).length,
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificacionAPI.markAsRead(String(id));
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.nombre?.[0] ?? "";
    const last = user.apellido?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "student":
        return "Alumno";
      case "teacher":
        return "Profesor";
      case "admin":
        return "Administrador";
      default:
        return "Usuario";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 pl-6 cursor-pointer"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Sistema Académico</h1>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {(user?.role === "student" || user?.role === "alumno") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} sin leer
                      </Badge>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-[300px]">
                    {notificaciones.length > 0 ? (
                      notificaciones.slice(0, 10).map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                            !notif.leida ? "bg-primary/5" : ""
                          }`}
                          onClick={() =>
                            !notif.leida && handleMarkAsRead(notif.id)
                          }
                        >
                          <div className="flex items-start gap-2 w-full">
                            {!notif.leida && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            )}
                            <p
                              className={`text-sm flex-1 ${!notif.leida ? "font-medium" : ""}`}
                            >
                              {notif.mensaje}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground pl-4">
                            {new Date(notif.fecha_hora).toLocaleDateString(
                              "es-AR",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No hay notificaciones
                      </div>
                    )}
                  </ScrollArea>
                  {notificaciones.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Link
                        href="/dashboard/student/notificaciones"
                        className="block"
                      >
                        <DropdownMenuItem className="justify-center text-primary cursor-pointer">
                          Ver todas las notificaciones
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>

                  <span className="hidden sm:inline-block">
                    {user?.nombre} {user?.apellido}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.nombre} {user?.apellido}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="w-full max-w-5xl mx-auto px-6">{children}</div>
      </main>
    </div>
  );
}
