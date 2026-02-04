// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

// db: Instancia de la conexión SQLite creada en sqlite.js
const db = require("./sqlite");

// ============================================================
// CREACIÓN DE TABLAS
// ============================================================

// db.serialize(): Ejecuta las sentencias SQL en orden secuencial
// Útil cuando necesitamos crear múltiples tablas relacionadas
db.serialize(() => {
  // --- TABLA DE USUARIOS ---
  // users: Almacena los usuarios registrados en el sistema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID único auto-incrementado
      username TEXT UNIQUE NOT NULL,         -- Nombre de usuario (único)
      password_hash TEXT NOT NULL            -- Contraseña hasheada (nunca en texto plano)
    )
  `);

  // --- TABLA DE ITEMS (recurso extra de ejemplo) ---
  // items: Ejemplo de un recurso protegido que solo usuarios autenticados pueden ver/crear
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID único auto-incrementado
      name TEXT NOT NULL,                    -- Nombre del item
      description TEXT                       -- Descripción opcional del item
    )
  `);

  // Confirmamos que las tablas se crearon/verificaron exitosamente
  console.log("Tablas creadas / verificadas.");
});

// ============================================================
// EXPORTACIÓN
// ============================================================

module.exports = db;