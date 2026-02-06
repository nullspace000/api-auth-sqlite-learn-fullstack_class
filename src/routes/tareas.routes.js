// ============================================================
// RUTAS: API RESTful de Tareas
// ============================================================

// express: Framework para crear rutas
const express = require("express");

// tareasJson: Módulo de manejo de datos con fs.promises
const tareasJson = require("../db/tareasJson");

// auth: Middleware de autenticación JWT
const auth = require("../middleware/auth");

// Middleware de validación
const { validarTarea, validarIdNumerico } = require("../middleware/validation");

// ============================================================
// CONFIGURACIÓN DEL ROUTER
// ============================================================

const router = express.Router();

// ============================================================
// RUTA: OBTENER TODAS LAS TAREAS (PROTEGIDA)
// ============================================================
// GET /tareas
// Devuelve todas las tareas almacenadas en el archivo JSON

router.get("/", auth, async (req, res, next) => {
  try {
    // Obtener todas las tareas del archivo JSON
    const tareas = await tareasJson.obtenerTareas();

    // 200 = OK
    res.json({
      total: tareas.length,
      tareas,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// RUTA: CREAR UNA NUEVA TAREA (PROTEGIDA)
// ============================================================
// POST /tareas
// Permite agregar una nueva tarea con título y descripción

router.post("/", auth, validarTarea, async (req, res, next) => {
  try {
    const { titulo, descripcion } = req.body;

    // Crear la nueva tarea en el archivo JSON
    const nuevaTarea = await tareasJson.agregarTarea({
      titulo,
      descripcion: descripcion || "",
    });

    // 201 = Created
    res.status(201).json({
      message: "Tarea creada exitosamente",
      tarea: nuevaTarea,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// RUTA: ACTUALIZAR UNA TAREA (PROTEGIDA)
// ============================================================
// PUT /tareas/:id
// Actualiza una tarea existente según el ID proporcionado

router.put("/:id", auth, validarIdNumerico, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, completada } = req.body;

    // Buscar si la tarea existe
    const tareaExistente = await tareasJson.obtenerTareaPorId(parseInt(id));

    if (!tareaExistente) {
      return res.status(404).json({
        error: "Tarea no encontrada",
      });
    }

    // Actualizar la tarea
    const tareaActualizada = await tareasJson.actualizarTarea(parseInt(id), {
      titulo,
      descripcion,
      completada,
    });

    res.json({
      message: "Tarea actualizada exitosamente",
      tarea: tareaActualizada,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// RUTA: ELIMINAR UNA TAREA (PROTEGIDA)
// ============================================================
// DELETE /tareas/:id
// Elimina una tarea según el ID proporcionado

router.delete("/:id", auth, validarIdNumerico, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar si la tarea existe
    const tareaExistente = await tareasJson.obtenerTareaPorId(parseInt(id));

    if (!tareaExistente) {
      return res.status(404).json({
        error: "Tarea no encontrada",
      });
    }

    // Eliminar la tarea
    await tareasJson.eliminarTarea(parseInt(id));

    res.json({
      message: "Tarea eliminada exitosamente",
      tareaEliminada: tareaExistente,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// EXPORTACIÓN
// ============================================================

module.exports = router;
