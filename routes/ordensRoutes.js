const express = require('express');
const ordensControllers = require('../controllers/ordensController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ordens
 *   description: Operações relacionadas aos ordens
 */

/**
 * @swagger
 * /ordens:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [ordens]
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
router.post("/ordens", ordensControllers.createOrdens);

/**
 * @swagger
 * /ordens:
 *   get:
 *     summary: Lista todos os ordens
 *     tags: [ordens]
 *     responses:
 *       200:
 *         description: Lista de ordens retornada com sucesso
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
router.get("/ordens", ordensControllers.getAllOrdens);

/**
 * @swagger
 * /ordens/{id}:
 *   get:
 *     summary: Obtém um cliente pelo ID
 *     tags: [ordens]
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
router.get("/ordens/:phone", ordensControllers.getOrdensById);

/**
 * @swagger
 * /ordens/{id}:
 *   delete:
 *     summary: Exclui um cliente pelo ID
 *     tags: [ordens]
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
router.delete("/ordens/:phone", ordensControllers.deleteOrdens);


module.exports = router;