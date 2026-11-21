const { describe, test, mock } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../../app");

describe("POST /api/login", () => {
  test("inicia sesión con credenciales válidas y devuelve token", async () => {
    const respuesta = await request(app)
      .post("/api/login")
      .send({ username: "ana", password: "ana-12345" });

    assert.equal(respuesta.status, 200);
    assert.ok(respuesta.body.token);
    assert.equal(respuesta.body.username, "ana");
  });

  test("responde 401 con contraseña incorrecta", async () => {
    const respuesta = await request(app)
      .post("/api/login")
      .send({ username: "ana", password: "clave-incorrecta" });

    assert.equal(respuesta.status, 401);
  });

  test("responde 401 si el token fue alterado", async () => {
    const login = await request(app)
      .post("/api/login")
      .send({ username: "ana", password: "ana-12345" });

    const tokenAlterado = login.body.token.slice(0, -1) + "X";

    const respuesta = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${tokenAlterado}`)
      .send({ title: "Test", body: "Test" });

    assert.equal(respuesta.status, 401);
  });
});

describe("Autenticación con GitHub", () => {
  test("GET /api/auth/github/url devuelve URL con client_id y state válido", async () => {
    const respuesta = await request(app).get("/api/auth/github/url");
    assert.equal(respuesta.status, 200);

    const url = new URL(respuesta.body.url);
    assert.equal(url.origin, "https://github.com");
    assert.equal(url.searchParams.get("client_id"), process.env.GITHUB_CLIENT_ID);
    assert.match(url.searchParams.get("state"), /^[0-9a-f]{32}$/);
  });

  test("POST /api/auth/github rechaza un state inventado", async () => {
    const respuesta = await request(app)
      .post("/api/auth/github")
      .send({ code: "codigo-falso", state: "state-inventado-123" });

    assert.equal(respuesta.status, 400);
  });

  test("POST /api/auth/github intercambia el código usando fetch simulado", async () => {
    const resUrl = await request(app).get("/api/auth/github/url");
    const stateValido = new URL(resUrl.body.url).searchParams.get("state");

    const fetchOriginal = globalThis.fetch;
    mock.method(globalThis, "fetch", async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("github.com/login/oauth/access_token")) {
        return new Response(
          JSON.stringify({ access_token: "gho_token_simulado" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (urlStr.includes("api.github.com/user")) {
        return new Response(
          JSON.stringify({ id: 99999, login: "dev-github" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return fetchOriginal(url);
    });

    try {
      const respuesta = await request(app)
        .post("/api/auth/github")
        .send({ code: "codigo-oauth-valido", state: stateValido });

      assert.equal(respuesta.status, 200);
      assert.ok(respuesta.body.token);
      assert.equal(respuesta.body.username, "dev-github");
    } finally {
      mock.restoreAll();
    }
  });
});