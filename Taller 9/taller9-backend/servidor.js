const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Paso 1: Validar variable de entorno JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error("Falta la variable de entorno JWT_SECRET. Revisa el archivo .env");
  process.exit(1);
}

const app = express();
const puerto = 3000;

// Middlewares generales
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routers
const loginRouter = require("./routes/login");
const usuariosRouter = require("./routes/usuarios");
const postsRouter = require("./routes/posts");

// Paso 3 y 4: Montar rutas
app.use("/api/login", loginRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/posts", postsRouter);

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Paso 6: Manejador de errores
app.use((error, req, res, next) => {
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Token expirado" });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Token inválido" });
  }

  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(puerto, () => {
  console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});