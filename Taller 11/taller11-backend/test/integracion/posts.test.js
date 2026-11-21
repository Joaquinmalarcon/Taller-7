const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../../app");

const iniciarSesion = async (username, password) => {
  const respuesta = await request(app)
    .post("/api/login")
    .send({ username, password });
  return respuesta.body.token;
};

describe("GET /api/posts", () => {
  test("responde 200 con las 5 publicaciones iniciales", async () => {
    const respuesta = await request(app).get("/api/posts");
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.length, 5);
  });

  test("filtra publicaciones por userId", async () => {
    const respuesta = await request(app).get("/api/posts?userId=2");
    assert.equal(respuesta.status, 200);
    assert.deepEqual(
      respuesta.body.map((p) => p.id),
      [3, 4]
    );
  });
});

describe("POST /api/posts", () => {
  test("responde 401 si no se envía token", async () => {
    const respuesta = await request(app)
      .post("/api/posts")
      .send({ title: "Sin token", body: "No debería crearse" });
    assert.equal(respuesta.status, 401);
  });

  test("responde 400 si el JSON está mal formado", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .set("Content-Type", "application/json")
      .send('{ "title": "Hola", }');
    assert.equal(respuesta.status, 400);
  });

  test("responde 400 si faltan datos", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });
    assert.equal(respuesta.status, 400);
  });

  test("crea una publicación con token válido", async () => {
    const token = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Publicación de prueba",
        body: "Creada por una prueba",
      });
    assert.equal(respuesta.status, 201);
    assert.equal(respuesta.body.title, "Publicación de prueba");
    assert.equal(respuesta.body.userId, 1);
  });
});

describe("PUT y DELETE /api/posts/:id", () => {
  test("responde 403 si intenta editar una publicación ajena", async () => {
    const tokenAna = await iniciarSesion("ana", "ana-12345");
    const respuesta = await request(app)
      .put("/api/posts/5")
      .set("Authorization", `Bearer ${tokenAna}`)
      .send({ title: "Editado", body: "Intento no autorizado" });
    assert.equal(respuesta.status, 403);
  });

  test("el autor puede editar y eliminar su propia publicación", async () => {
    const tokenAna = await iniciarSesion("ana", "ana-12345");

    const creada = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${tokenAna}`)
      .send({ title: "Temporal", body: "Para editar y borrar" });
    const postId = creada.body.id;

    const editada = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenAna}`)
      .send({ title: "Actualizado", body: "Contenido nuevo" });
    assert.equal(editada.status, 200);
    assert.equal(editada.body.title, "Actualizado");

    const eliminada = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${tokenAna}`);
    assert.equal(eliminada.status, 204);
  });
});