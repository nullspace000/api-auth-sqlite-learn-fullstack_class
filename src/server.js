// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

// dotenv: Carga las variables del archivo .env (si existe)
// process.env: Objeto global que contiene las variables de entorno
require("dotenv").config();

// express: Framework web para Node.js
// app: Instancia principal de Express que configura rutas y middlewares
const express = require("express");
const app = express();

// PORT: Puerto donde escuchará el servidor
// process.env.PORT: Toma el valor del .env, o usa 3000 por defecto
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES
// ============================================================

// express.json(): Middleware que parsea el body de peticiones incoming
// Convierte JSON enviado por el cliente en un objeto JavaScript accesible en req.body
app.use(express.json());

// ============================================================
// MIDDLEWARE DE ERRORES
// ============================================================

// Middleware para manejo centralizado de errores
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

// ============================================================
// RUTAS
// ============================================================

// Ruta de prueba (sanity check) para verificar que el servidor funciona
app.get("/", (req, res) => {
  // req: objeto con información de la petición (headers, body, params, etc.)
  // res: objeto con métodos para enviar respuestas al cliente
  res.json({
    message: "API Node + Express + JSON funcionando",
    rutas: {
      auth: {
        registro: "POST /api/auth/register",
        login: "POST /api/auth/login",
      },
      tareas: {
        listar: "GET /tareas (requiere token)",
        crear: "POST /tareas (requiere token)",
        actualizar: "PUT /tareas/:id (requiere token)",
        eliminar: "DELETE /tareas/:id (requiere token)",
      },
    },
  });
});

// Rutas de autenticación (públicas)
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);

// Rutas de tareas (protegidas por el middleware auth)
// Usando el archivo JSON para almacenamiento
const tareasRoutes = require("./routes/tareas.routes");
app.use("/tareas", tareasRoutes);

// ============================================================
// MIDDLEWARE DE ERRORES (deben ir después de las rutas)
// ============================================================

// Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Manejo centralizado de errores
app.use(errorHandler);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

// app.listen(): Inicia el servidor HTTP en el puerto especificado
// El callback se ejecuta cuando el servidor está listo para recibir peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`API RESTful con autenticación y almacenamiento JSON activa`);
});
