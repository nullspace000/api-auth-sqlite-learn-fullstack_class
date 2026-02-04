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