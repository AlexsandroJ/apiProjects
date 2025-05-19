// src/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// POST /webhook
router.post('/webhook', webhookController.receberWebhook);

module.exports = router;