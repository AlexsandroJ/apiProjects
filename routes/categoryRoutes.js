const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middlewares/authMiddleware');


/**
 * @swagger
 * tags:
 *  
 *   - name: Categories
 *     description: Operações relacionadas às categorias de produtos
 */

/**
 * @swagger
 * /categories/{userId}:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *             example:
 *               category: "Roupas"
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Categoria já existe
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/category/:userId", categoryController.createCategory);

/**
 * @swagger
 * /categories/{userId}:
 *   get:
 *     summary: Obtém todas as categorias de um usuário
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de categorias retornada com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/category/:userId", categoryController.getCategories);

/**
 * @swagger
 * /categories/{userId}:
 *   put:
 *     summary: Edita uma categoria existente
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldCategory:
 *                 type: string
 *               newCategory:
 *                 type: string
 *             example:
 *               oldCategory: "Roupas"
 *               newCategory: "Vestuário"
 *     responses:
 *       200:
 *         description: Categoria editada com sucesso
 *       400:
 *         description: Nova categoria já existe
 *       404:
 *         description: Usuário ou categoria antiga não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/category/:userId", categoryController.editCategory);

/**
 * @swagger
 * /categories/{userId}/{category}:
 *   delete:
 *     summary: Exclui uma categoria específica
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da categoria
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso
 *       404:
 *         description: Usuário ou categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/category/:userId/:category", categoryController.deleteCategory);

module.exports = router;