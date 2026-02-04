// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

// path: Módulo nativo de Node.js para manipular rutas de archivos
// __dirname: Variable que contiene la ruta absoluta del directorio actual
const path = require("path");

// sqlite3: Driver de SQLite para Node.js
// verbose(): Habilita mensajes de error más detallados en la consola
const sqlite3 = require("sqlite3").verbose();

// ============================================================
// CONFIGURACIÓN DE LA RUTA DE LA BASE DE DATOS
// ============================================================

// dbPath: Ruta absoluta donde se creará el archivo de la base de datos
// path.resolve(): Convierte rutas relativas en absolutas
// __dirname + "/database.sqlite": Archivo se guardará en src/db/database.sqlite
const dbPath = path.resolve(__dirname, "database.sqlite");

// ============================================================
// CREACIÓN DE LA CONEXIÓN
// ============================================================

// new sqlite3.Database(): Crea o abre la base de datos SQLite
// Parámetros: ruta, y un callback que se ejecuta al intentar conectar
const db = new sqlite3.Database(dbPath, (err) => {
  // Si hay un error, lo mostramos en consola
  if (err) {
    console.error("Error al conectar con SQLite:", err.message);
  } else {
    // Si todo va bien, confirmamos la conexión exitosa
    console.log("Conectado a la base de datos SQLite.");
  }
});

// ============================================================
// EXPORTACIÓN
// ============================================================

// Exportamos la instancia 'db' para usarla en otros archivos
// Será importada con: const db = require("../db/sqlite");
module.exports = db;