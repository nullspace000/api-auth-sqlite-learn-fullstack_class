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
```

### 5.2. Crear tablas (usuarios + recurso extra)

Archivo: `src/db/init.js`

```javascript
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