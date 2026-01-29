"use client"

import * as React from "react"
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes"

/* ----------------------------------------------------------
 * ThemeProvider
 * Encapsula el provider de `next-themes` para habilitar:
 *  - Cambio de tema (light/dark/system)
 *  - Persistencia automática del tema en localStorage
 *  - Acceso al contexto desde cualquier parte de la UI
 *
 * Este wrapper permite mantener el código limpio y controlar
 * configuraciones globales del theme en un solo lugar.
 * ----------------------------------------------------------
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
