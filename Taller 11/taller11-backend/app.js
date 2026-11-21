const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rutasAuth = require("./routes/auth");
const rutasPosts = require("./routes/posts");
const manejadorErrores = require("./middlewares/manejadorErrores");

const app = express();

app.use(cors());
app.use(express.json());

// Durante las pruebas no mostramos el registro de cada petición.
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}

app.get("/", (req, res) => {
  res.json({ mensaje: "API Taller 11 funcionando" });
});

app.use("/api", rutasAuth);
app.use("/api/posts", rutasPosts);

app.use(manejadorErrores);

module.exports = app;