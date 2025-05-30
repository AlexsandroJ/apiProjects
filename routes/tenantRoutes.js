const express = require('express');
const controller = require('../controllers/tenantController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Kubernetes
 *   description: Operações relacionadas ao cluster Kubernetes (Deployments, Pods, etc)
 */

/**
 * @swagger
 * /api/test-Conection:
 *   get:
 *     summary: Testa a conexão com o cluster Kubernetes
 *     tags: [Kubernetes]
 *     responses:
 *       200:
 *         description: Informações da versão do cluster Kubernetes
 */
router.get('/test-Conection', controller.tesConection);

/**
 * @swagger
 * /api/list-Pods:
 *   get:
 *     summary: Lista todos os pods no namespace especificado
 *     tags: [Kubernetes]
 *     responses:
 *       200:
 *         description: Lista de pods no namespace
 */
router.get('/list-Pods', controller.listPods);

/**
 * @swagger
 * /api/list-Deployments:
 *   get:
 *     summary: Lista todos os deployments no namespace especificado
 *     tags: [Kubernetes]
 *     responses:
 *       200:
 *         description: Lista de deployments no namespace
 */
router.get('/list-Deployments', controller.listDeployments);

/**
 * @swagger
 * /api/creat-Deployments:
 *   post:
 *     summary: Cria um novo deployment no cluster
 *     tags: [Kubernetes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               replicas:
 *                 type: integer
 *               image:
 *                 type: string
 *               containerPort:
 *                 type: integer
 *             example:
 *               name: nginx-deploy
 *               replicas: 2
 *               image: nginx:latest
 *               containerPort: 80
 *     responses:
 *       201:
 *         description: Deployment criado com sucesso
 */
router.post('/creat-Deployments', controller.createDeployment);

/**
 * @swagger
 * /api/update-Deployments/{name}:
 *   put:
 *     summary: Atualiza um deployment existente
 *     tags: [Kubernetes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
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
 *               replicas:
 *                 type: integer
 *               image:
 *                 type: string
 *               containerPort:
 *                 type: integer
 *             example:
 *               replicas: 3
 *               image: nginx:1.21
 *               containerPort: 80
 *     responses:
 *       200:
 *         description: Deployment atualizado com sucesso
 */
router.put('/update-Deployments/:name', controller.updateDeployment);

/**
 * @swagger
 * /k8s/nginx/service:
 *   post:
 *     summary: Exibe o serviço via NodePort
 *     tags: [Kubernetes]
 *     responses:
 *       201:
 *         description: Serviço criado
 */
router.post('/expose-Services', controller.exposeService);

/**
 * @swagger
 * /k8s/services:
 *   get:
 *     summary: Lista todos os serviços
 *     tags: [Kubernetes]
 *     responses:
 *       200:
 *         description: Lista de serviços
 */
router.get('/list-Services', controller.listServices);

router.delete('/del-Services/:name', controller.deleteServices);

/**
 * @swagger
 * /api/del-Deployments/{name}:
 *   delete:
 *     summary: Exclui um deployment pelo nome
 *     tags: [Kubernetes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deployment excluído com sucesso
 */
router.delete('/del-Deployments/:name', controller.deleteDeployment);

module.exports = router;