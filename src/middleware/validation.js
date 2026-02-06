// ============================================================
// MIDDLEWARE: Validación de datos
// ============================================================

/**
 * Middleware para validar que existen los campos requeridos
 * @param {string[]} campos - Array de nombres de campos requeridos
 */
function validarCamposRequeridos(campos) {
  return (req, res, next) => {
    const camposFaltantes = campos.filter((campo) => {
      // Verificar tanto en body como en params
      const valor = req.body[campo] ?? req.params[campo];
      return valor === undefined || valor === null || valor === "";
    });

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        error: "Campos requeridos faltantes",
        camposFaltantes,
      });
    }

    next();
  };
}

/**
 * Middleware para validar el formato de una tarea
 */
function validarTarea(req, res, next) {
  const { titulo, descripcion } = req.body;

  // El título es obligatorio
  if (!titulo) {
    return res.status(400).json({
      error: "El campo 'titulo' es obligatorio",
    });
  }

  // Validar tipo de datos
  if (typeof titulo !== "string") {
    return res.status(400).json({
      error: "El campo 'titulo' debe ser una cadena de texto",
    });
  }

  if (descripcion !== undefined && typeof descripcion !== "string") {
    return res.status(400).json({
      error: "El campo 'descripcion' debe ser una cadena de texto",
    });
  }

  // Limitar longitud del título
  if (titulo.length > 200) {
    return res.status(400).json({
      error: "El título no puede exceder 200 caracteres",
    });
  }

  next();
}

/**
 * Middleware para validar ID numérico
 */
function validarIdNumerico(req, res, next) {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(parseInt(id))) {
    return res.status(400).json({
      error: "El ID debe ser un número entero válido",
    });
  }

  next();
}

module.exports = {
  validarCamposRequeridos,
  validarTarea,
  validarIdNumerico,
};
