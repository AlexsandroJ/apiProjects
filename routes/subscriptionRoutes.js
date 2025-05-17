const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');

// Middleware para upload de arquivos (QR Code)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // armazena em memória como Buffer

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Operações relacionadas às assinaturas
 */

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Cria uma nova assinatura
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: ['free', 'basic', 'premium', 'business']
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: ['active', 'expired', 'canceled']
 *             example:
 *               userId: "64f1234567890abcdef12345"
 *               plan: "basic"
 *               endDate: "2025-01-01T00:00:00Z"
 *               status: "active"
 *     responses:
 *       201:
 *         description: Assinatura criada com sucesso
 */
router.post('/subscriptions', subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscriptions/qr:
 *   post:
 *     summary: Salva um QR Code na assinatura do usuário
 *     tags: [Subscriptions]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: userId
 *         type: string
 *         required: true
 *         description: ID do usuário
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: Imagem PNG ou JPEG do QR Code
 *     responses:
 *       200:
 *         description: QR Code salvo com sucesso
 *       400:
 *         description: userId e arquivo são obrigatórios
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/subscriptions/qr', upload.single('file'), subscriptionController.saveQRCode);

/**
 * @swagger
 * /api/subscriptions/qr/{userId}:
 *   get:
 *     summary: Retorna o QR Code salvo como imagem
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Imagem do QR code
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: QR Code não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/subscriptions/qr/:userId', subscriptionController.getQRCode);

module.exports = router;