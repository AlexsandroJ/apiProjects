// __tests__/tenantController.test.js
const request = require('supertest');
const express = require('express');
const { startTenantPod } = require('../controllers/tenantController');

describe('Tenant Controller - startTenantPod', () => {
    let mockAppsV1Api;

    beforeEach(() => {
        mockAppsV1Api = {
            createNamespacedDeployment: jest.fn().mockResolvedValue({ body: {} }),
        };
    });

    it('deve retornar erro se tenantId ou imageName estiverem ausentes', async () => {
        const req = { body: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await startTenantPod(req, res, null, mockAppsV1Api);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'tenantId e imageName são obrigatórios' });
    });

    it('deve criar um deployment corretamente', async () => {
        const req = {
            body: {
                tenantId: 'cliente1',
                imageName: 'nginx'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await startTenantPod(req, res, null, mockAppsV1Api);
        expect(mockAppsV1Api.createNamespacedDeployment).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Deployment criado',
            deploymentName: 'tenant-cliente1-deployment'
        });
    });

    it('deve retornar erro 500 se ocorrer falha no Kubernetes', async () => {
        const req = {
            body: {
                tenantId: 'cliente1',
                imageName: 'nginx'
            }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockAppsV1Api.createNamespacedDeployment.mockRejectedValue(new Error('Kubernetes error'));

        await startTenantPod(req, res, null, mockAppsV1Api);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Falha ao criar deployment' });
    });
});