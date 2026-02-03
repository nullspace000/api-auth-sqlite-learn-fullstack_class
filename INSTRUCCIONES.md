# Guía de Temas: Node.js + Express + SQLite + Autenticación

**Objetivo:**  
Aprender paso a paso a:

1. Entender qué es Node.js y Express.
2. Crear una API REST básica.
3. Conectar la API a una base de datos SQLite.
4. Implementar autenticación de usuario sencilla (registro + login con tokens JWT).
5. Probar la API con un cliente como **Thunder Client** (o Postman).

---

## 0. Requisitos previos

- JavaScript básico (funciones, módulos, async/await).
- Git instalado (opcional pero recomendado).
- Node.js instalado (`node` y `npm`).  

Verifica:

```bash
node -v
npm -v
```

---

## 0.5. Estructura del proyecto

Antes de comenzar, aquí tienes la estructura de carpetas y archivos que we'll create:

```
api-auth-sqlite/
├── .env                    # Variables de entorno (puerto, secreto JWT)
├── package.json            # Configuración del proyecto y dependencias
├── database.sqlite         # Archivo de la base de datos SQLite (se crea automáticamente)
└── src/
    ├── server.js           # Punto de entrada de la aplicación Express
    ├── db/
    │   ├── sqlite.js       # Conexión a la base de datos SQLite
    │   └── init.js         # Script de inicialización (creación de tablas)
    ├── routes/
    │   ├── auth.routes.js  # Rutas de autenticación (registro/login)
    │   └── items.routes.js # Rutas protegidas para items
    └── middleware/
        └── auth.js         # Middleware para verificar tokens JWT
```

### Descripción de cada archivo:

| Archivo | Propósito |
|---------|-----------|
| `.env` | Almacena variables sensibles como el puerto del servidor y el secreto para firmar tokens JWT |
| `package.json` | Define el nombre, versión, dependencias y scripts del proyecto |
| `src/server.js` | Archivo principal que configura y levanta el servidor Express |
| `src/db/sqlite.js` | Establece la conexión con la base de datos SQLite y la exporta |
| `src/db/init.js` | Crea las tablas necesarias (users, items) si no existen |
| `src/routes/auth.routes.js` | Define endpoints para registrar y login de usuarios |
| `src/routes/items.routes.js` | Define endpoints protegidos para CRUD de items |
| `src/middleware/auth.js` | Función que verifica si el token JWT es válido antes de permitir acceso |

---

## 1. Crear el proyecto Node.js

### 1.1. Crear carpeta y entrar

```bash
mkdir api-auth-sqlite
cd api-auth-sqlite
```

### 1.2. Inicializar proyecto Node

```bash
npm init -y
```

Esto genera `package.json` con configuración básica.

---

## 2. Instalar dependencias

Usaremos:

- `express`: framework web minimalista y flexible para Node.js.
- `sqlite3`: driver para conectar y manipular bases de datos SQLite.
- `bcryptjs`: librería para hashear contraseñas de forma segura.
- `jsonwebtoken`: librería para generar y verificar tokens JWT.
- `dotenv`: carga variables de entorno desde un archivo `.env`.

```bash
npm install express sqlite3 bcryptjs jsonwebtoken dotenv
```

Para desarrollo:

- `nodemon`: herramienta que reinicia automáticamente el servidor cuando detecta cambios en los archivos.

```bash
npm install --save-dev nodemon
```

---

## 3. Configurar scripts en package.json

En `package.json`, agrega en `"scripts"`:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

Explicación de los scripts:
- `start`: Ejecuta el servidor con Node en modo producción.
- `dev`: Ejecuta el servidor con Nodemon, recargando automáticamente ante cambios.

Crea la estructura de carpetas:

```bash
mkdir src
mkdir src/db
mkdir src/routes
mkdir src/middleware
```

---

## 4. Crear servidor Express básico

Archivo: `src/server.js`

```javascript
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
// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemsRoutes);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

// app.listen(): Inicia el servidor HTTP en el puerto especificado
// El callback se ejecuta cuando el servidor está listo para recibir peticiones
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Ve a `http://localhost:3000/` en el navegador o Thunder Client y verifica que responde.

---

## 5. Configurar SQLite

### 5.1. Crear archivo de conexión

Archivo: `src/db/sqlite.js`

```javascript
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
```

Modificar `src/server.js` para ejecutar la inicialización:

```javascript
// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// INICIALIZACIÓN DE LA BASE DE DATOS
// ============================================================

// require("./db/init"): Ejecuta el script de inicialización
// Esto crea las tablas (users, items) si no existen
// Debe llamarse ANTES de definir las rutas que usen la BD
require("./db/init");

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(express.json());

// ============================================================
// RUTAS
// ============================================================

app.get("/", (req, res) => {
  res.json({ message: "API Node + Express + SQLite funcionando" });
});

// TODO: Descomenta después de crear las rutas
// const authRoutes = require("./routes/auth.routes");
// const itemsRoutes = require("./routes/items.routes");
// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemsRoutes);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

Reinicia el servidor:

```bash
npm run dev
```

Se creará el archivo `database.sqlite` en `src/db` y las tablas correspondientes.

---

## 6. Autenticación: registro y login

### 6.1. Crear rutas de autenticación

Archivo: `src/routes/auth.routes.js`

```javascript
// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

// express: Framework para crear rutas y manejar HTTP
const express = require("express");

// bcryptjs: Librería para hashear y comparar contraseñas
// Hasheo: Convertir texto legible en una cadena irreversible
const bcrypt = require("bcryptjs");

// jsonwebtoken: Librería para generar y verificar tokens JWT
// JWT: JSON Web Token, estándar para autenticación stateless
const jwt = require("jsonwebtoken");

// db: Instancia de la base de datos SQLite
const db = require("../db/sqlite");

// ============================================================
// CONFIGURACIÓN DEL ROUTER
// ============================================================

// express.Router(): Crea un router modular para agrupar rutas relacionadas
// Permite organizar las rutas en archivos separados
const router = express.Router();

// JWT_SECRET: Clave secreta para firmar los tokens JWT
// En producción, usar una clave larga y compleja del archivo .env
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_super_inseguro";

// ============================================================
// RUTA: REGISTRO DE USUARIO
// ============================================================

// POST /register: Crea un nuevo usuario en el sistema
router.post("/register", (req, res) => {
  // req.body: Objeto con los datos enviados en el cuerpo de la petición
  // Ejemplo: { "username": "juan", "password": "secreto123" }
  const { username, password } = req.body;

  // Validación: Verificar que username y password fueron proporcionados
  if (!username || !password) {
    // res.status(): Establece el código de estado HTTP
    // 400 = Bad Request (el cliente envió datos inválidos)
    return res.status(400).json({ error: "username y password son obligatorios" });
  }

  // Hasheo de contraseña:
  // bcrypt.hashSync(): Hashea la contraseña de forma síncrona
  // 10 = "salt rounds", número de iteraciones del algoritmo (más = más seguro pero más lento)
  const passwordHash = bcrypt.hashSync(password, 10);

  // Sentencia SQL para insertar el nuevo usuario
  // Usamos Prepared Statements (?) para prevenir SQL Injection
  const sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
  const params = [username, passwordHash];

  // db.run(): Ejecuta una sentencia SQL que no retorna filas (INSERT, UPDATE, DELETE)
  // function(err): Callback que recibe un posible error
  // this.lastID: En inserts, contiene el ID del registro recién creado
  db.run(sql, params, function (err) {
    if (err) {
      // Verificar si el error es por violación de restricción UNIQUE (usuario duplicado)
      if (err.message.includes("UNIQUE")) {
        // 409 = Conflict (recurso ya existe)
        return res.status(409).json({ error: "El usuario ya existe" });
      }
      // 500 = Internal Server Error (error inesperado del servidor)
      return res.status(500).json({ error: "Error al registrar usuario" });
    }

    // 201 = Created (recurso creado exitosamente)
    res.status(201).json({ message: "Usuario registrado", userId: this.lastID });
  });
});

// ============================================================
// RUTA: LOGIN DE USUARIO
// ============================================================

// POST /login: Autentica un usuario y retorna un token JWT
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validación: Verificar que username y password fueron proporcionados
  if (!username || !password) {
    return res.status(400).json({ error: "username y password son obligatorios" });
  }

  // Sentencia SQL para buscar un usuario por su username
  const sql = "SELECT * FROM users WHERE username = ?";
  const params = [username];

  // db.get(): Ejecuta una consulta que retorna UNA sola fila (SELECT con WHERE único)
  // (err, user): Si no se encuentra, user será undefined
  db.get(sql, params, (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Error al buscar usuario" });
    }

    // Verificar si el usuario existe
    if (!user) {
      // 401 = Unauthorized (credenciales inválidas)
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Comparar la contraseña proporcionada con el hash almacenado
    // bcrypt.compareSync(): Compara la contraseña plana con el hash
    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

    if (!passwordIsValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // === GENERACIÓN DEL TOKEN JWT ===
    // jwt.sign(): Crea un nuevo token JWT
    // Parámetros: payload (datos embebidos en el token), secreto, opciones
    const token = jwt.sign(
      { userId: user.id, username: user.username }, // Payload: datos del usuario
      JWT_SECRET,                                    // Secreto para firmar el token
      { expiresIn: "1h" }                           // El token expira en 1 hora
    );

    // 200 = OK (petición exitosa)
    res.json({ message: "Login correcto", token });
  });
});

// ============================================================
// EXPORTACIÓN
// ============================================================

module.exports = router;
```

### 6.2. Usar las rutas en server.js

```javascript
// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar base de datos (crear tablas)
require("./db/init");

// Importar las rutas de autenticación
const authRoutes = require("./routes/auth.routes");

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(express.json());

// ============================================================
// RUTAS
// ============================================================

app.get("/", (req, res) => {
  res.json({ message: "API Node + Express + SQLite funcionando" });
});

// Registrar las rutas de autenticación bajo el prefijo /api/auth
// Todas las rutas definidas en auth.routes.js estarán disponibles en:
// - POST /api/auth/register
// - POST /api/auth/login
app.use("/api/auth", authRoutes);

// TODO: Descomenta después de crear items.routes.js
// const itemsRoutes = require("./routes/items.routes");
// app.use("/api/items", itemsRoutes);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

Reinicia:

```bash
npm run dev
```

---

## 7. Middleware de autenticación (JWT)

Archivo: `src/middleware/auth.js`

```javascript
// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

// jsonwebtoken: Librería para verificar tokens JWT
const jwt = require("jsonwebtoken");

// JWT_SECRET: Mismo secreto usado en auth.routes.js para firmar tokens
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_super_inseguro";

// ============================================================
// DEFINICIÓN DEL MIDDLEWARE
// ============================================================

// Middleware: Función que se ejecuta antes de la ruta final
// Recibe: req (petición), res (respuesta), next (continuar a la siguiente función)
function authMiddleware(req, res, next) {
  // Obtener el header Authorization de la petición
  // Formato esperado: "Bearer <token>"
  const authHeader = req.headers.authorization;

  // Verificar que el header existe y comienza con "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Si no hay token, rechazar con 401 Unauthorized
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  // Extraer el token del header
  // "Bearer token123" -> split(" ") -> ["Bearer", "token123"]
  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify(): Verifica y decodifica el token
    // Si el token es inválido o expirado, lanza un error
    const decoded = jwt.verify(token, JWT_SECRET);

    // req.user: Guardamos la información decodificada del token
    // Estará disponible en las rutas protegidas
    // Estructura: { userId: number, username: string, iat: number, exp: number }
    req.user = decoded;

    // next(): Llama a la siguiente función (la ruta protegida)
    next();
  } catch (err) {
    // Si el token es inválido o expirado, rechazar con 401
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ============================================================
// EXPORTACIÓN
// ============================================================

module.exports = authMiddleware;
```

---

## 8. Recurso protegido: items

### 8.1. Rutas para items

Archivo: `src/routes/items.routes.js`

```javascript
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
```

### 8.2. Registrar rutas en server.js

```javascript
// ============================================================
// IMPORTACIÓN DE MÓDULOS
// ============================================================

require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

require("./db/init");

// Rutas de autenticación
const authRoutes = require("./routes/auth.routes");
// Rutas de items (protegidas)
const itemsRoutes = require("./routes/items.routes");

// ============================================================
// MIDDLEWARES
// ============================================================

app.use(express.json());

// ============================================================
// RUTAS
// ============================================================

app.get("/", (req, res) => {
  res.json({ message: "API Node + Express + SQLite funcionando" });
});

// Rutas de autenticación (públicas)
app.use("/api/auth", authRoutes);

// Rutas de items (protegidas por el middleware auth)
app.use("/api/items", itemsRoutes);

// ============================================================
// INICIO DEL SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
```

Reinicia:

```bash
npm run dev
```

---

## 9. Archivo .env (opcional pero recomendado)

Crea `.env` en la raíz del proyecto:

```text
# Puerto donde escuchará el servidor
PORT=3000

# Clave secreta para firmar tokens JWT
# IMPORTANTE: Usar una clave larga y compleja en producción
# Nunca compartir esta clave ni guardarla en el repositorio
JWT_SECRET=mi_clave_super_secreta_para_jwt
```

**Nota:** El archivo `.env` debe añadirse a `.gitignore` para no subirlo al repositorio.

---

## 10. Probar la API con Thunder Client (o Postman)

### 10.1. Endpoint raíz (sanidad)

- **Método:** GET
- **URL:** `http://localhost:3000/`

Respuesta esperada:

```json
{ "message": "API Node + Express + SQLite funcionando" }
```

### 10.2. Registro de usuario

- **Método:** POST
- **URL:** `http://localhost:3000/api/auth/register`

**Body (JSON):**

```json
{
  "username": "juan",
  "password": "secreto123"
}
```

Respuesta esperada (201):

```json
{
  "message": "Usuario registrado",
  "userId": 1
}
```

(En Thunder Client: pestaña Body → JSON → pega el JSON.)

### 10.3. Login de usuario

- **Método:** POST
- **URL:** `http://localhost:3000/api/auth/login`

**Body (JSON):**

```json
{
  "username": "juan",
  "password": "secreto123"
}
```

Respuesta esperada (200):

```json
{
  "message": "Login correcto",
  "token": "JWT_GENERADO_AQUÍ"
}
```

Copia el valor de `"token"`.

### 10.4. Crear item protegido

- **Método:** POST
- **URL:** `http://localhost:3000/api/items`

**Headers:**

```
Authorization: Bearer <TOKEN_COPIADO>
```

**Body (JSON):**

```json
{
  "name": "Libro Node.js",
  "description": "Guía práctica de Node + Express"
}
```

Respuesta esperada (201):

```json
{
  "id": 1,
  "name": "Libro Node.js",
  "description": "Guía práctica de Node + Express"
}
```

### 10.5. Listar items protegidos

- **Método:** GET
- **URL:** `http://localhost:3000/api/items`

**Headers:**

```
Authorization: Bearer <TOKEN_COPIADO>
```

Respuesta esperada (200):

```json
[
  {
    "id": 1,
    "name": "Libro Node.js",
    "description": "Guía práctica de Node + Express"
  }
]
```

---

## 11. Resumen de comandos de consola usados

```bash
# Crear proyecto
mkdir api-auth-sqlite
cd api-auth-sqlite
npm init -y

# Instalar dependencias
npm install express sqlite3 bcryptjs jsonwebtoken dotenv
npm install --save-dev nodemon

# Ejecutar servidor
npm run dev   # desarrollo (nodemon)
npm start     # producción (node)

# Comprobaciones varias
node -v
npm -v
```

---

## 12. Siguientes pasos sugeridos

- Agregar validaciones más robustas (verificar formato de email, longitud de contraseña).
- Implementar actualización y borrado de items (PUT /api/items/:id, DELETE /api/items/:id).
- Manejar paginación y filtros (GET /api/items?page=1&limit=10).
- Añadir manejo de roles (admin/usuario) para autorización granular.
- Escribir tests automatizados para la API con Jest o Mocha.
- Agregar manejo de errores centralizado.
- Implementar refresh tokens para renovar JWT sin hacer login nuevamente.
