import { afterEach, describe, expect, test, vi } from "vitest";
import {
  actualizarPublicacion,
  crearPublicacion,
  eliminarPublicacion,
  encabezadosConToken,
  ErrorApi,
  iniciarSesion,
  obtenerPublicaciones,
} from "./api";
import { guardarSesion } from "./sesion";

const respuestaJson = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("encabezadosConToken", () => {
  test("no agrega Authorization si no hay sesión", () => {
    expect(encabezadosConToken()).toEqual({});
  });

  test("agrega Authorization Bearer si hay sesión guardada", () => {
    guardarSesion({ token: "abc123", id: 1, username: "ana" });
    expect(encabezadosConToken()).toEqual({
      Authorization: "Bearer abc123",
    });
  });
});

describe("obtenerPublicaciones", () => {
  test("consulta /api/posts sin filtros", async () => {
    const datos = [{ id: 1, title: "Hola", body: "Mundo", userId: 1 }];
    const fetchSimulado = vi.fn().mockResolvedValue(respuestaJson(200, datos));
    vi.stubGlobal("fetch", fetchSimulado);

    const resultado = await obtenerPublicaciones();

    expect(fetchSimulado).toHaveBeenCalledWith("http://localhost:3000/api/posts");
    expect(resultado).toEqual(datos);
  });

  test("agrega ?userId= a la URL al filtrar por usuario", async () => {
    const fetchSimulado = vi.fn().mockResolvedValue(respuestaJson(200, []));
    vi.stubGlobal("fetch", fetchSimulado);

    await obtenerPublicaciones(2);

    expect(fetchSimulado).toHaveBeenCalledWith(
      "http://localhost:3000/api/posts?userId=2"
    );
  });
});

describe("iniciarSesion", () => {
  test("envía credenciales y devuelve los datos de sesión", async () => {
    const sesion = { token: "xyz", id: 1, username: "ana" };
    const fetchSimulado = vi.fn().mockResolvedValue(respuestaJson(200, sesion));
    vi.stubGlobal("fetch", fetchSimulado);

    const resultado = await iniciarSesion("ana", "ana-12345");

    expect(fetchSimulado).toHaveBeenCalledWith(
      "http://localhost:3000/api/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ username: "ana", password: "ana-12345" }),
      })
    );
    expect(resultado).toEqual(sesion);
  });

  test("lanza ErrorApi cuando el servidor responde 401", async () => {
    const fetchSimulado = vi
      .fn()
      .mockResolvedValue(respuestaJson(401, { error: "Credenciales inválidas" }));
    vi.stubGlobal("fetch", fetchSimulado);

    const error = await iniciarSesion("ana", "mal").catch((e) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(401);
  });
});

describe("crear, actualizar y eliminar publicaciones", () => {
  test("crearPublicacion envía POST con token", async () => {
    guardarSesion({ token: "abc123", id: 1, username: "ana" });
    const postCreado = { id: 6, title: "Nuevo", body: "Texto", userId: 1 };
    const fetchSimulado = vi
      .fn()
      .mockResolvedValue(respuestaJson(201, postCreado));
    vi.stubGlobal("fetch", fetchSimulado);

    const resultado = await crearPublicacion({ title: "Nuevo", body: "Texto" });

    expect(fetchSimulado).toHaveBeenCalledWith(
      "http://localhost:3000/api/posts",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      })
    );
    expect(resultado).toEqual(postCreado);
  });

  test("crearPublicacion lanza ErrorApi con status 400 si faltan datos", async () => {
    guardarSesion({ token: "abc123", id: 1, username: "ana" });
    const fetchSimulado = vi
      .fn()
      .mockResolvedValue(respuestaJson(400, { error: "Debes enviar title y body" }));
    vi.stubGlobal("fetch", fetchSimulado);

    const error = await crearPublicacion({ title: "", body: "" }).catch((e) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(400);
  });

  test("actualizarPublicacion envía PUT con token", async () => {
    guardarSesion({ token: "abc123", id: 1, username: "ana" });
    const postActualizado = { id: 1, title: "Editado", body: "Texto", userId: 1 };
    const fetchSimulado = vi
      .fn()
      .mockResolvedValue(respuestaJson(200, postActualizado));
    vi.stubGlobal("fetch", fetchSimulado);

    const resultado = await actualizarPublicacion(1, {
      title: "Editado",
      body: "Texto",
    });

    expect(fetchSimulado).toHaveBeenCalledWith(
      "http://localhost:3000/api/posts/1",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      })
    );
    expect(resultado).toEqual(postActualizado);
  });

  test("eliminarPublicacion maneja respuesta 204 sin contenido", async () => {
    guardarSesion({ token: "abc123", id: 1, username: "ana" });
    const fetchSimulado = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchSimulado);

    await expect(eliminarPublicacion(1)).resolves.toBeUndefined();
    expect(fetchSimulado).toHaveBeenCalledWith(
      "http://localhost:3000/api/posts/1",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      })
    );
  });
});