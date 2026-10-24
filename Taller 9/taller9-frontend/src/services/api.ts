// Taller 9: servicios API
import { obtenerSesion } from "./sesion";
import type { Sesion } from "./sesion";

export interface Publicacion {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface DatosPublicacion {
  title: string;
  body: string;
}

export const API_URL = "http://localhost:3000";

export class ErrorApi extends Error {
  status: number;

  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.status = status;
  }
}

const procesarRespuesta = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }
  const texto = await response.text();
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    datos = null;
  }
  if (!response.ok) {
    throw new ErrorApi(datos?.error ?? `El servidor respondió con el código ${response.status}`, response.status);
  }
  return datos;
};

// Paso 8: POST /api/login
export const iniciarSesion = async (username: string, password: string): Promise<Sesion> => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return procesarRespuesta(response);
};

// Desafío 1: POST /api/usuarios (Registro)
export const registrarUsuario = async (username: string, password: string): Promise<{ id: number; username: string }> => {
  const response = await fetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return procesarRespuesta(response);
};

// Paso 9: Encabezados con token
export const encabezadosConToken = (): Record<string, string> => {
  const sesion = obtenerSesion();
  const encabezados: Record<string, string> = {};
  if (sesion) {
    encabezados.Authorization = `Bearer ${sesion.token}`;
  }
  return encabezados;
};

// GET /api/usuarios/yo
export const obtenerPerfil = async (): Promise<{ id: number; username: string }> => {
  const response = await fetch(`${API_URL}/api/usuarios/yo`, { headers: encabezadosConToken() });
  return procesarRespuesta(response);
};

// GET /api/posts
export const obtenerPublicaciones = async (userId?: number): Promise<Publicacion[]> => {
  const url = userId ? `${API_URL}/api/posts?userId=${userId}` : `${API_URL}/api/posts`;
  const response = await fetch(url);
  return procesarRespuesta(response);
};

// POST /api/posts
export const crearPublicacion = async (datos: DatosPublicacion): Promise<Publicacion> => {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...encabezadosConToken() },
    body: JSON.stringify(datos)
  });
  return procesarRespuesta(response);
};

// PUT /api/posts/:id
export const actualizarPublicacion = async (id: number, datos: DatosPublicacion): Promise<Publicacion> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...encabezadosConToken() },
    body: JSON.stringify(datos)
  });
  return procesarRespuesta(response);
};

// DELETE /api/posts/:id
export const eliminarPublicacion = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: encabezadosConToken()
  });
  await procesarRespuesta(response);
};