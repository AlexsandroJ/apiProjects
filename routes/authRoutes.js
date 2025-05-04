// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Operações relacionadas à autenticação
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redireciona o usuário para a autenticação do Google
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirecionamento para o Google OAuth
 */
router.get('/auth/google', authController.redirectToGoogle);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Manipula o callback do Google após a autenticação
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida e retorno de token ou redirecionamento
 *       401:
 *         description: Falha na autenticação
 */
router.get('/auth/google/callback', authController.handleGoogleCallback);

module.exports = router;