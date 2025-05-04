const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do header "Bearer <token>"
 
  if (!token) {
    return res.status(401).json({ error: 'authMiddleware: Acesso negado. Token não fornecido.' });
  }

  try {
    // Verifica o token usando a chave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona o ID do usuário ao objeto de requisição
    req.body.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'authMiddleware: Token inválido ou expirado.' });
  }
};

module.exports = authenticateToken;