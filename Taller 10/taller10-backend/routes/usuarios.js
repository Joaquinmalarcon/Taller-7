// Rutas de usuarios (Taller 9). Se montan en servidor.js en "/api/usuarios".

const express = require("express");
const usuarios = require("../datos/usuarios");
const verificarToken = require("../middleware/auth");

const router = express.Router();

// GET /api/usuarios/yo (ruta protegida)
// Devuelve los datos del usuario autenticado a partir de req.usuario (puesto por verificarToken).
router.get("/yo", verificarToken, (req, res) => {
  const usuario = usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json({ id: usuario.id, username: usuario.username, avatarUrl: usuario.avatarUrl });
});

module.exports = router;