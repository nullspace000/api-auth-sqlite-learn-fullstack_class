// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

const express = require("express");
const db = require("../db/sqlite");
const auth = require("../middleware/auth");

// ============================================================
// CONFIGURACIÓN DEL ROUTER
// ============================================================

const router = express.Router();

// ============================================================
// RUTA: OBTENER TODOS LOS ITEMS (PROTEGIDA)
// ============================================================

// GET /: Lista todos los items de la base de datos
// auth: Middleware que se ejecuta antes de la ruta
// Verifica que el token JWT sea válido antes de permitir el acceso
router.get("/", auth, (req, res) => {
  // Sentencia SQL para seleccionar todos los items
  const sql = "SELECT * FROM items";
  const params = []; // Sin parámetros (consulta sin WHERE)

  // db.all(): Ejecuta una consulta que retorna TODAS las filas que coincidan
  // (err, rows): Array con todos los registros encontrados
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener items" });
    }

    // 200 = OK, retornamos el array de items
    res.json(rows);
  });
});

// ============================================================
// RUTA: CREAR UN ITEM (PROTEGIDA)
// ============================================================

// POST /: Crea un nuevo item en la base de datos
router.post("/", auth, (req, res) => {
  // Obtener datos del body
  const { name, description } = req.body;

  // Validación: name es obligatorio
  if (!name) {
    return res.status(400).json({ error: "name es obligatorio" });
  }

  // Sentencia SQL para insertar un nuevo item
  const sql = "INSERT INTO items (name, description) VALUES (?, ?)";
  const params = [name, description || null]; // Si description es undefined, usar null

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: "Error al crear item" });
    }

    // 201 = Created, retornamos el item recién creado con su ID
    res.status(201).json({
      id: this.lastID,  // ID generado por AUTOINCREMENT
      name,
      description: description || null,
    });
  });
});

// ============================================================
// EXPORTACIÓN
// ============================================================

module.exports = router;