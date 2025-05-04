const express = require('express');
const cityController = require('../controllers/cityController');
const authenticateToken = require('../middlewares/authMiddleware'); // Middleware de autenticação
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: Operações relacionadas às cidades e bairros
 */

/**
 * @swagger
 * /api/cities/{userId}:
 *   post:
 *     summary: Cria uma nova cidade para um usuário
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               neighborhoods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *             example:
 *               name: São Paulo
 *               neighborhoods:
 *                 - name: Jardins
 *                 - name: Moema
 *     responses:
 *       201:
 *         description: Cidade criada com sucesso
 */
router.post('/cities/:userId', authenticateToken, cityController.createCity);

/**
 * @swagger
 * /api/cities/{userId}:
 *   get:
 *     summary: Lista todas as cidades de um usuário
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de cidades
 */
router.get('/cities/:userId', authenticateToken, cityController.getAllCities);

/**
 * @swagger
 * /api/cities/{userId}/{cityName}:
 *   get:
 *     summary: Obtém uma cidade específica pelo nome
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cidade encontrada
 */
router.get('/cities/:userId/:cityName', authenticateToken, cityController.getCityByName);

/**
 * @swagger
 * /api/cities/{userId}/{cityName}:
 *   put:
 *     summary: Atualiza uma cidade específica
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *               neighborhoods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *             example:
 *               newName: São Paulo Atualizada
 *               neighborhoods:
 *                 - name: Pinheiros
 *     responses:
 *       200:
 *         description: Cidade atualizada com sucesso
 */
router.put('/cities/:userId/:cityName', authenticateToken, cityController.updateCity);

/**
 * @swagger
 * /api/cities/{userId}/{cityName}:
 *   delete:
 *     summary: Exclui uma cidade específica
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cidade excluída com sucesso
 */
router.delete('/cities/:userId/:cityName', authenticateToken, cityController.deleteCity);

/**
 * @swagger
 * /api/cities/{userId}/{cityName}/neighborhoods:
 *   post:
 *     summary: Adiciona um novo bairro a uma cidade
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               neighborhoodName:
 *                 type: string
 *             example:
 *               neighborhoodName: Pinheiros
 *     responses:
 *       201:
 *         description: Bairro adicionado com sucesso
 */
router.post('/cities/:userId/:cityName/:neighborhoods', authenticateToken, cityController.addNeighborhood);

/**
 * @swagger
 * /api/cities/{userId}/{cityName}/neighborhoods/{neighborhoodName}:
 *   put:
 *     summary: Edita um bairro específico em uma cidade
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: neighborhoodName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newNeighborhoodName:
 *                 type: string
 *             example:
 *               newNeighborhoodName: Jardim Paulista
 *     responses:
 *       200:
 *         description: Bairro atualizado com sucesso
 */
router.put('/cities/:userId/:cityName/:neighborhoodName', authenticateToken, cityController.updateNeighborhood);

/**
 * @swagger
 * /api/cities/{userId}/{cityName}/neighborhoods/{neighborhoodName}:
 *   delete:
 *     summary: Remove um bairro específico de uma cidade
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cityName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: neighborhoodName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bairro removido com sucesso
 */
router.delete('/cities/:userId/:cityName/:neighborhoodName', authenticateToken, cityController.removeNeighborhood);

module.exports = router;