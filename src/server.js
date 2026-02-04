// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

// dotenv: Carga las variables del archivo .env (si existe)
//process.env: Objeto global que contiene las variables de entorno
require("dotenv").config();

// express: Framework web para Node.js
// app: Instancia principal de Express que configura rutas y middlewares
const express = require("express");
const app = express();

// PORT: Puerto donde escuchará el servidor
// process.env.PORT: Toma el valor del .env, o usa 3000 por defecto
const PORT = process.env.PORT || 3000;

// ============================================================
// INICIALIZACIÓN DE LA BASE DE DATOS
// ============================================================

// require("./db/init"): Ejecuta el script de inicialización
// Esto crea las tablas (users, items) si no existen
// Debe llamarse ANTES de definir las rutas que usen la BD
require("./db/init");

// Rutas de autenticación
const authRoutes = require("./routes/auth.routes");
// Rutas de items (protegidas)
const itemsRoutes = require("./routes/items.routes");

// ============================================================
// MIDDLEWARES
// ============================================================

// express.json(): Middleware que parsea el body de petitions incoming
// Convierte JSON enviado por el cliente en un objeto JavaScript accesible en req.body
app.use(express.json());

// ============================================================
// RUTAS
// ============================================================

// Ruta de prueba (sanity check) para verificar que el servidor funciona
app.get("/", (req, res) => {
  // req: objeto con información de la petición (headers, body, params, etc.)
  // res: objeto con métodos para enviar respuestas al cliente
  res.json({ message: "API Node + Express + SQLite funcionando" });
});

// TODO: Descomenta estas líneas después de crear las rutas
// const authRoutes = require("./routes/auth.routes");
// const itemsRoutes = require("./routes/items.routes");

// Rutas de autenticación (públicas)
app.use("/api/auth", authRoutes);

// Rutas de items (protegidas por el middleware auth)
app.use("/api/items", itemsRoutes);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

// app.listen(): Inicia el servidor HTTP en el puerto especificado
// El callback se ejecuta cuando el servidor está listo para recibir peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});