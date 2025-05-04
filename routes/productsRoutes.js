const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Operações relacionadas aos produtos
 */
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto para um usuário
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *             example:
 *               userId: "64f8a1b2c3d4e5f6g7h8i9j0"
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Produto já existe para este usuário
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/products", productsController.createProduct);

/**
 * @swagger
 * /products/{userId}:
 *   get:
 *     summary: Obtém todos os produtos de um usuário
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/products/:userId", productsController.getProducts);

/**
 * @swagger
 * /products/{userId}:
 *   delete:
 *     summary: Exclui um produto específico
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/products/:userId", productsController.deleteProduct);

module.exports = router;