// ============================================================
// MÓDULO: Manejo de datos con el módulo fs
// ============================================================

// fs.promises: Versión basada en promesas del módulo fs
// Permite operaciones asincrónicas sin bloquear el Event Loop
const fs = require("fs").promises;

// Path del archivo JSON donde se almacenan las tareas
const DATA_FILE = "tareas.json";

/**
 * Lee todas las tareas del archivo JSON
 * @returns {Promise<Array>} Array de tareas
 */
async function obtenerTareas() {
  try {
    // Verificar si el archivo existe
    try {
      await fs.access(DATA_FILE);
    } catch {
      // Si no existe, crear archivo vacío
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }

    // Leer archivo de forma asincrónica
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    throw new Error(`Error al leer tareas: ${err.message}`);
  }
}

/**
 * Guarda todas las tareas en el archivo JSON
 * @param {Array} tareas - Array de tareas a guardar
 * @returns {Promise<void>}
 */
async function guardarTareas(tareas) {
  try {
    // Escribir archivo de forma asincrónica
    // JSON.stringify con indentación para legibilidad
    await fs.writeFile(DATA_FILE, JSON.stringify(tareas, null, 2));
  } catch (err) {
    throw new Error(`Error al guardar tareas: ${err.message}`);
  }
}

/**
 * Obtiene una tarea por su ID
 * @param {number} id - ID de la tarea
 * @returns {Promise<Object|null>} Tarea encontrada o null
 */
async function obtenerTareaPorId(id) {
  const tareas = await obtenerTareas();
  return tareas.find((tarea) => tarea.id === id) || null;
}

/**
 * Agrega una nueva tarea
 * @param {Object} tarea - Tarea a agregar
 * @returns {Promise<Object>} Tarea creada con ID asignado
 */
async function agregarTarea(tarea) {
  const tareas = await obtenerTareas();

  // Generar nuevo ID (timestamp + random para evitar colisiones)
  const nuevoId = Date.now();

  const nuevaTarea = {
    id: nuevoId,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion || "",
    completada: false,
    createdAt: new Date().toISOString(),
  };

  tareas.push(nuevaTarea);
  await guardarTareas(tareas);

  return nuevaTarea;
}

/**
 * Actualiza una tarea existente por ID
 * @param {number} id - ID de la tarea a actualizar
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object|null>} Tarea actualizada o null si no existe
 */
async function actualizarTarea(id, datos) {
  const tareas = await obtenerTareas();
  const indice = tareas.findIndex((tarea) => tarea.id === id);

  if (indice === -1) {
    return null;
  }

  // Actualizar solo los campos proporcionados
  const tareaActualizada = {
    ...tareas[indice],
    ...datos,
    id: tareas[indice].id, // Mantener el ID original
    updatedAt: new Date().toISOString(),
  };

  tareas[indice] = tareaActualizada;
  await guardarTareas(tareas);

  return tareaActualizada;
}

/**
 * Elimina una tarea por ID
 * @param {number} id - ID de la tarea a eliminar
 * @returns {Promise<boolean>} true si se eliminó, false si no existe
 */
async function eliminarTarea(id) {
  const tareas = await obtenerTareas();
  const indice = tareas.findIndex((tarea) => tarea.id === id);

  if (indice === -1) {
    return false;
  }

  // Eliminar la tarea del array
  tareas.splice(indice, 1);
  await guardarTareas(tareas);

  return true;
}

module.exports = {
  obtenerTareas,
  guardarTareas,
  obtenerTareaPorId,
  agregarTarea,
  actualizarTarea,
  eliminarTarea,
};
