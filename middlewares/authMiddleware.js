const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Extrai o token do header "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            error: 'authMiddleware: Acesso negado. Token não fornecido.' 
        });
    }

    try {
        // Verifica o token usando a chave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adiciona o ID do usuário ao objeto de requisição
        req.userId = decoded.userId; // 👈 Não use req.body! Use req.userId diretamente
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                error: 'authMiddleware: Token inválido.' 
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'authMiddleware: Token expirado.' 
            });
        }

        return res.status(403).json({ 
            error: 'authMiddleware: Erro na autenticação do token.' 
        });
    }
};

module.exports = authenticateToken;