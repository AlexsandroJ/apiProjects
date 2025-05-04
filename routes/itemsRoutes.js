const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');


/**
 * @swagger
 * tags:
 *   - name: Items
 *     description: Operações relacionadas aos itens de produtos
 */
/**
 * @swagger
 * /items/{userId}/{category}:
 *   post:
 *     summary: Cria um novo item em uma categoria específica
 *     tags: [Items]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               available:
 *                 type: boolean
 *               image:
 *                 type: string
 *               stock:
 *                 type: number
 *             example:
 *               name: "Camiseta Branca"
 *               type: "Roupa"
 *               price: 59.99
 *               description: "Camiseta de algodão branca"
 *               available: true
 *               image: "https://example.com/camiseta-branca.jpg"
 *               stock: 100
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *       400:
 *         description: Dados inválidos ou item já existe
 *       404:
 *         description: Usuário ou categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/items/:userId/:category", itemController.createItem);

/**
 * @swagger
 * /items/{userId}/{category}:
 *   get:
 *     summary: Obtém todos os itens de uma categoria específica
 *     tags: [Items]
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
 *         description: Lista de itens retornada com sucesso
 *       404:
 *         description: Usuário ou categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/items/:userId/:category", itemController.getItems);

/**
 * @swagger
 * /items/{userId}/{category}/{name}:
 *   put:
 *     summary: Atualiza um item específico
 *     tags: [Items]
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
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               available:
 *                 type: boolean
 *               image:
 *                 type: string
 *               stock:
 *                 type: number
 *             example:
 *               type: "Roupa Casual"
 *               price: 69.99
 *               description: "Camiseta casual de algodão"
 *               available: false
 *               stock: 50
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Usuário, categoria ou item não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put("/items/:userId/:category/:name", itemController.updateItem);

/**
 * @swagger
 * /items/{userId}/{category}/{name}:
 *   delete:
 *     summary: Exclui um item específico
 *     tags: [Items]
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
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do item
 *     responses:
 *       200:
 *         description: Item excluído com sucesso
 *       404:
 *         description: Usuário, categoria ou item não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete("/items/:userId/:category/:name", itemController.deleteItem);

module.exports = router;