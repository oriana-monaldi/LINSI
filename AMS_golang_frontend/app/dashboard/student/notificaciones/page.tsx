"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { notificacionAPI } from "@/lib/api"
import { Bell, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Notificacion {
  id: number
  mensaje: string
  fecha_hora: string
  leida: boolean
  alumno_id: number
}

export default function NotificacionesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch notifications from API
  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.id || (user.role !== "student" && user.role !== "alumno")) return

      try {
        const data = await notificacionAPI.getByAlumno(String(user.id))
        setNotifications(data || [])
      } catch (err) {
        console.error("Error fetching notifications:", err)
      } finally {
        setLoading(false)
      }
    }

    if (!isLoading && user) {
      fetchNotifications()
    }
  }, [user, isLoading])

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "student" && user.role !== "alumno"))) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || loading || !user || (user.role !== "student" && user.role !== "alumno")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter((n) => !n.leida).length

  const markAsRead = async (id: number) => {
    try {
      await notificacionAPI.markAsRead(String(id))
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)))
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifs = notifications.filter((n) => !n.leida)
      await Promise.all(unreadNotifs.map((n) => notificacionAPI.markAsRead(String(n.id))))
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })))
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  const deleteNotification = (id: number) => {
    // Note: No delete endpoint in API, just remove from local state
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notificaciones
            </h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
                : "Todas las notificaciones están al día"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`transition-all ${notif.leida ? "bg-card" : "bg-primary/5 border-primary/20"}`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`mt-1 ${notif.leida ? "text-muted-foreground" : "text-primary"}`}>
                    {notif.leida ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className={`text-sm ${notif.leida ? "text-muted-foreground" : "font-medium"}`}>
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(notif.fecha_hora), "dd 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                      {!notif.leida && <Badge variant="secondary">Nueva</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notif.leida && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(notif.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay notificaciones</p>
                <p className="text-sm text-muted-foreground">Cuando recibas notificaciones aparecerán aquí</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
