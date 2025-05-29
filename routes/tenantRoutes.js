// routes/tenantRoutes.js
const express = require('express');
const controller = require('../controllers/tenantController');

const router = express.Router();

router.get('/test-conection', controller.testK8sConnection);
router.get('/namespaces', controller.listNamespaces);
router.post('/start-pod', controller.startTenantPod);
router.post('/scale-pod', controller.scaleTenantPod);
router.post('/remove-pod', controller.removeTenantPod);
router.get('/pods/:tenantId', controller.getTenantPods);

module.exports = router;