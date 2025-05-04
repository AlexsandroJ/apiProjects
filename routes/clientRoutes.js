const express = require('express');
const clientControllers = require('../controllers/clientControllers');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Operações relacionadas aos clientes
 */

/**
 * @swagger
 * /client:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *             example:
 *               name: "João Silva"
 *               email: "joao.silva@example.com"
 *               phone: "123456789"
 *               address: "Rua A, 123"
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Dados inválidos ou erro na criação do cliente
 */
router.post("/client", clientControllers.createClient);

/**
 * @swagger
 * /client:
 *   get:
 *     summary: Lista todos os clientes
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *                 example:
 *                   id: "65b8f..."
 *                   name: "João Silva"
 *                   email: "joao.silva@example.com"
 *                   phone: "123456789"
 *                   address: "Rua A, 123"
 *       404:
 *         description: Nenhum cliente encontrado
 */
router.get("/client", clientControllers.getAllClients);

/**
 * @swagger
 * /client/{id}:
 *   get:
 *     summary: Obtém um cliente pelo ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do cliente a ser buscado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *               example:
 *                 id: "65b8f..."
 *                 name: "João Silva"
 *                 email: "joao.silva@example.com"
 *                 phone: "123456789"
 *                 address: "Rua A, 123"
 *       404:
 *         description: Cliente não encontrado
 */
router.get("/client/:id", clientControllers.getClientById);

/**
 * @swagger
 * /client/{id}:
 *   put:
 *     summary: Atualiza um cliente existente
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do cliente a ser atualizado
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *             example:
 *               name: "João Silva Jr."
 *               email: "joao.silva.jr@example.com"
 *               phone: "987654321"
 *               address: "Rua B, 456"
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou erro na atualização
 *       404:
 *         description: Cliente não encontrado
 */
router.put("/client/:id", clientControllers.updateClient);

/**
 * @swagger
 * /client/{id}:
 *   delete:
 *     summary: Exclui um cliente pelo ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do cliente a ser excluído
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.delete("/client/:id", clientControllers.deleteClient);

module.exports = router;