const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Trabajos Prácticos
export const tpAPI = {
  getAll: () => fetchAPI("/tps/"),
  getMine: () => fetchAPI("/profesor/tps"),
  getMyAsStudent: () => fetchAPI("/alumno/tps"),
  getById: (id: string) => fetchAPI(`/tps/${id}`),
  create: (data: {
    consigna: string;
    comision_id: number;
    fecha_entrega: string;
  }) =>
    fetchAPI("/tps/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/tps/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/tps/${id}`, { method: "DELETE" }),
};

// Evaluaciones
export const evaluacionAPI = {
  getAll: () => fetchAPI("/evaluaciones/"),
  getMine: () => fetchAPI("/profesor/evaluaciones"),
  getMyAsStudent: () => fetchAPI("/alumno/evaluaciones"),
  getById: (id: string) => fetchAPI(`/evaluaciones/${id}`),
  getEntregas: (evaluacionId: string) =>
    fetchAPI(`/evaluaciones/${evaluacionId}/entregas`),
  getEntrega: (evaluacionId: string, alumnoId: string) =>
    fetchAPI(`/evaluaciones/${evaluacionId}/entregas/${alumnoId}`),
  getByComision: (comisionId: string) =>
    fetchAPI(`/evaluaciones/comision/${comisionId}`),
  create: (data: {
    fecha_evaluacion: string;
    comision_id: number;
    temas: string;
  }) =>
    fetchAPI("/evaluaciones/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/evaluaciones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  updateEntrega: (evaluacionId: string, alumnoId: string, data: any) =>
    fetchAPI(`/evaluaciones/${evaluacionId}/entregas/${alumnoId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/evaluaciones/${id}`, { method: "DELETE" }),
};

// Entregas TP
export const entregaTPAPI = {
  getAll: () => fetchAPI("/entregas/"),
  getByTP: (tpId: string) => fetchAPI(`/entregas/tp/${tpId}`),
  getMine: () => fetchAPI("/entregas/mis-entregas"),
  getById: (id: string) => fetchAPI(`/entregas/${id}`),
  create: (data: { tp_id: number; cursada_id: number; archivo_url?: string }) =>
    fetchAPI("/entregas/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: {
      archivo_url?: string;
      nota?: number;
      devolucion?: string;
      estado?: string;
    }
  ) =>
    fetchAPI(`/entregas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/entregas/${id}`, { method: "DELETE" }),
};

// Entregas
export const entregaAPI = {
  getAll: () => fetchAPI("/entregas/"),
  getMine: () => fetchAPI("/mis-entregas/"),
  getById: (id: string) => fetchAPI(`/entregas/${id}`),
  create: (data: any) =>
    fetchAPI("/entregas/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  uploadFile: (id: string, formData: FormData) =>
    fetch(`${API_URL}/entregas/${id}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    }),
    
};

// Notificaciones
export const notificacionAPI = {
  getByAlumno: (alumnoId: string) =>
    fetchAPI(`/notificaciones/alumnos/${alumnoId}`),
  getUnread: (alumnoId: string) =>
    fetchAPI(`/notificaciones/alumnos/${alumnoId}/unread`),
  markAsRead: (id: string) =>
    fetchAPI(`/notificaciones/${id}/mark-read`, {
      method: "PATCH",
    }),
};

// Comisiones
export const comisionAPI = {
  getAll: () => fetchAPI("/comisiones/"),
  getById: (id: string) => fetchAPI(`/comisiones/${id}`),
  getByMateria: (materiaId: string) =>
    fetchAPI(`/comisiones/materia/${materiaId}`),
  getByProfesor: () => fetchAPI("/profesor-comision/mis-comisiones"),
  create: (data: { nombre: string; horarios: string; materia_id: number }) =>
    fetchAPI("/comisiones/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: { nombre?: string; horarios?: string; materia_id?: number }
  ) =>
    fetchAPI(`/comisiones/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/comisiones/${id}`, { method: "DELETE" }),
};

// ProfesorXComision 
export const profesorXComisionAPI = {
  getAll: () => fetchAPI("/profesor-comision/"),
  getById: (id: string) => fetchAPI(`/profesor-comision/${id}`),
  getByProfesor: (profesorId: string) =>
    fetchAPI(`/profesor-comision/profesor/${profesorId}`),
  getByComision: (comisionId: string) =>
    fetchAPI(`/profesor-comision/comision/${comisionId}`),
  create: (data: {
    profesor_id: number;
    comision_id: number;
    cargo: "Titular" | "Adjunto" | "JTP";
  }) =>
    fetchAPI("/profesor-comision/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: {
      profesor_id?: number;
      comision_id?: number;
      cargo?: "Titular" | "Adjunto" | "JTP";
    }
  ) =>
    fetchAPI(`/profesor-comision/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI(`/profesor-comision/${id}`, { method: "DELETE" }),
};

// Cursadas
export const cursadaAPI = {
  getAll: () => fetchAPI("/cursadas"),
  getById: (id: string) => fetchAPI(`/cursadas/${id}`),
  getByAlumno: (alumnoId: string) => fetchAPI(`/cursadas/alumno/${alumnoId}`),
  getByComision: (comisionId: string) =>
    fetchAPI(`/cursadas/comision/${comisionId}`),
  create: (data: {
    alumno_id: number;
    comision_id: number;
    ano_lectivo: number;
  }) =>
    fetchAPI("/cursadas", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: { nota_final?: number; nota_conceptual?: number; feedback?: string }
  ) =>
    fetchAPI(`/cursadas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/cursadas/${id}`, { method: "DELETE" }),
};

// Materias
export const materiaAPI = {
  getAll: () => fetchAPI("/materias/"),
  getById: (id: string) => fetchAPI(`/materias/${id}`),
  create: (data: { nombre: string; ano_carrera: number }) =>
    fetchAPI("/materias/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { nombre?: string; ano_carrera?: number }) =>
    fetchAPI(`/materias/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/materias/${id}`, { method: "DELETE" }),
};

// Alumnos
export const alumnoAPI = {
  getAll: () => fetchAPI("/alumnos/"),
  getById: (id: string) => fetchAPI(`/alumnos/${id}`),
  create: (data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    legajo: string;
  }) =>
    fetchAPI("/alumnos/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: {
      nombre?: string;
      apellido?: string;
      email?: string;
      password?: string;
      legajo?: string;
    }
  ) =>
    fetchAPI(`/alumnos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/alumnos/${id}`, { method: "DELETE" }),
};

// Profesores
export const profesorAPI = {
  getAll: () => fetchAPI("/profesores/"),
  getById: (id: string) => fetchAPI(`/profesores/${id}`),
  create: (data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    legajo: string;
  }) =>
    fetchAPI("/profesores/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: {
      nombre?: string;
      apellido?: string;
      email?: string;
      password?: string;
      legajo?: string;
    }
  ) =>
    fetchAPI(`/profesores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/profesores/${id}`, { method: "DELETE" }),
};

// Admins
export const adminAPI = {
  getAll: () => fetchAPI("/admins/"),
  getById: (id: string) => fetchAPI(`/admins/${id}`),
  create: (data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
  }) =>
    fetchAPI("/admins/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (
    id: string,
    data: {
      nombre?: string;
      apellido?: string;
      email?: string;
      password?: string;
    }
  ) =>
    fetchAPI(`/admins/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchAPI(`/admins/${id}`, { method: "DELETE" }),
};