const express = require("express");
const bcrypt = require("bcryptjs");
const verificarToken = require("../middleware/auth");
const usuarios = require("../datos/usuarios");

const router = express.Router();

// Paso 3: Registrar usuario (POST /api/usuarios)
router.post("/", async (req, res) => {
  const datos = req.body;
  if (!datos || !datos.username || !datos.password) {
    return res.status(400).json({ error: "Debes enviar username y password" });
  }
  if (datos.password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }
  if (usuarios.some((u) => u.username === datos.username)) {
    return res.status(409).json({ error: "El nombre de usuario ya existe" });
  }

  const nuevoUsuario = {
    id: usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
    username: datos.username,
    passwordHash: await bcrypt.hash(datos.password, 10)
  };
  usuarios.push(nuevoUsuario);

  res.status(201).json({ id: nuevoUsuario.id, username: nuevoUsuario.username });
});

// Paso 5: Obtener perfil del usuario autenticado (GET /api/usuarios/yo)
router.get("/yo", verificarToken, (req, res) => {
  const usuario = usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }
  res.json({ id: usuario.id, username: usuario.username });
});

// Desafío 2: Cambiar contraseña (PUT /api/usuarios/yo/password)
router.put("/yo/password", verificarToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Debes enviar la contraseña actual y la nueva" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 8 caracteres" });
  }

  const usuario = usuarios.find((u) => u.id === req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  const passwordCorrecta = await bcrypt.compare(currentPassword, usuario.passwordHash);
  if (!passwordCorrecta) {
    return res.status(401).json({ error: "La contraseña actual es incorrecta" });
  }

  usuario.passwordHash = await bcrypt.hash(newPassword, 10);

  res.json({ mensaje: "Contraseña actualizada correctamente" });
});

module.exports = router;