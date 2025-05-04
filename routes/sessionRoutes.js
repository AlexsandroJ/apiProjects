const express = require('express');
const { login, logout, checkToken, listActiveSessions } = require('../controllers/sessionController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Operações relacionadas à autenticação de usuários
 */

/**
 * @swagger
 * /sessions/login:
 *   post:
 *     summary: Realiza o login do usuário
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "usuario@example.com"
 *               password: "senha123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso. Retorna um token de autenticação.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *               example:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciais inválidas ou erro no login
 */
router.post('/sessions/login', login);

/**
 * @swagger
 * /sessions/logout:
 *   post:
 *     summary: Realiza o logout do usuário
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.post('/sessions/logout', authenticateToken, logout);

/**
 * @swagger
 * /sessions/check-token:
 *   post:
 *     summary: Verifica se o token JWT é válido
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido. Retorna informações do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "652f8f8f8f8f8f8f8f8f8f8f"
 *                 message:
 *                   type: string
 *                   example: "Token válido."
 *       401:
 *         description: Token inválido ou expirado
 */
router.post('/sessions/check-token', authenticateToken, checkToken);

/**
 * @swagger
 * /sessions/active-sessions:
 *   get:
 *     summary: Lista todas as sessões ativas do usuário
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sessões ativas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Token inválido ou não fornecido
 */
router.get('/sessions/active-sessions/:userId',authenticateToken, listActiveSessions);

module.exports = router;