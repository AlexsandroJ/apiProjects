const express = require('express');
const profileController = require('../controllers/profileController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Operações relacionadas a perfis de usuários
 */

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Cria ou atualiza um perfil
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               location:
 *                 type: string
 *             example:
 *               userId: "65b8f..."
 *               bio: "Desenvolvedor Fullstack"
 *               location: "São Paulo"
 *     responses:
 *       200:
 *         description: Perfil criado ou atualizado com sucesso
 */
router.post('/profiles', profileController.createOrUpdateProfile);

/**
 * @swagger
 * /api/profiles/{userId}:
 *   get:
 *     summary: Obtém um perfil por ID do usuário
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil encontrado
 */
router.get('/profiles/:userId', profileController.getProfileByUserId);

/**
 * @swagger
 * /api/profiles/{userId}:
 *   delete:
 *     summary: Exclui um perfil por ID do usuário
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil excluído com sucesso
 */
router.delete('/profiles/:userId', profileController.deleteProfileByUserId);

module.exports = router;