// ============================================================
// MIDDLEWARE: Manejo de errores
// ============================================================

/**
 * Middleware para manejo centralizado de errores
 * Captura cualquier error que ocurra en las rutas
 */
function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Determinar código de estado HTTP
  let statusCode = 500;

  // Errores conocidos con códigos específicos
  if (err.message.includes("no encontrada")) {
    statusCode = 404;
  } else if (err.message.includes("inválid") || err.message.includes("requerid")) {
    statusCode = 400;
  } else if (err.message.includes("no autorizado")) {
    statusCode = 401;
  }

  // Responder con error estructurado
  res.status(statusCode).json({
    error: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

/**
 * Middleware para rutas no encontradas (404)
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
}

module.exports = { errorHandler, notFoundHandler };
