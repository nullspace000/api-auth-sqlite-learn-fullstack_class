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