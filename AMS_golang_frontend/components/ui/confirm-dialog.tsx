"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

type ConfirmDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  message: string
  title?: string
  onConfirm: () => Promise<void> | void
  confirmText?: string
  cancelText?: string
}

export default function ConfirmDialog({
  open,
  setOpen,
  message,
  title = "Confirmar acción",
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => setOpen(o)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={async () => { await onConfirm() }}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
