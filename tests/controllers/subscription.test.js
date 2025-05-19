const request = require('supertest');
const jwt = require('jsonwebtoken');
const {app} = require('../../app');
const mongoose = require('mongoose');
const Subscription = require('../../models/subscriptionModels');
const User = require('../../models/userModels');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

beforeEach(async () => {
    await Subscription.deleteMany({});
    await User.deleteMany({});
});

describe('Subscription Controller Tests', () => {

    let userId;

    beforeEach(async () => {
        // Cria um usuário fake para os testes
       const userResponse = await request(app)
            .post('/api/users')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            });

        userId = userResponse.body.userId;
        userToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    });

    describe('POST /api/subscriptions', () => {
        it('deve criar uma nova assinatura com sucesso', async () => {
            const res = await request(app)
                .post('/api/subscriptions')
                .send({
                    userId,
                    plan: 'basic',
                    endDate: new Date(Date.now() + 86400000).toISOString(),
                    status: 'active'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('subscriptionController: Assinatura criada com sucesso');
            expect(res.body.subscription.userId.toString()).toBe(userId.toString());
        });

        it('deve retornar erro se usuário não existir', async () => {
            const invalidUserId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .post('/api/subscriptions')
                .send({
                    userId: invalidUserId,
                    plan: 'basic'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('subscriptionController: Usuário não encontrado, ID invalido.');
        });
    });

    describe('POST /api/subscriptions/qr', () => {
        const mockFile = {
            fieldname: 'file',
            originalname: 'test-qr.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: fs.readFileSync(path.resolve(__dirname, './praia.png')),
        };

        it('deve salvar o QR Code com sucesso', async () => {
            const res = await request(app)
                .post('/api/subscriptions/qr')
                .field('userId', userId)
                .attach('file', mockFile.buffer, mockFile.originalname)
                .set('Content-Type', 'multipart/form-data');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('QR Code salvo com sucesso!');

            const updatedSub = await Subscription.findOne({ userId });
            expect(updatedSub.qrCode).toBeDefined();
            expect(updatedSub.qrCode).toEqual(expect.any(Buffer));
        });

        it('deve retornar erro se o arquivo não for PNG ou JPEG', async () => {
            const badFile = {
                ...mockFile,
                mimetype: 'image/gif',
                buffer: Buffer.from('fake gif content')
            };

            const res = await request(app)
                .post('/api/subscriptions/qr')
                .field('userId', userId)
                .attach('file', badFile.buffer, badFile.originalname)
                .set('Content-Type', 'multipart/form-data');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Apenas arquivos PNG ou JPEG são permitidos.');
        });

        it('deve retornar erro se userId ou arquivo estiverem faltando', async () => {
            const res = await request(app)
                .post('/api/subscriptions/qr')
                .set('Content-Type', 'multipart/form-data');

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('userId e arquivo são obrigatórios.');
        });
    });

    describe('GET /api/subscriptions/qr/:userId', () => {
        const qrBuffer = Buffer.from('fake-qr-image-content');

        beforeEach(async () => {
            await Subscription.create({
                userId,
                qrCode: qrBuffer
            });
        });

        it('deve retornar o QR Code como imagem PNG', async () => {
            const res = await request(app)
                .get(`/api/subscriptions/qr/${userId}`);

            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toBe('image/png');
            expect(res.body).toEqual(qrBuffer);
        });

        it('deve retornar erro se o QR Code não existir', async () => {
            const invalidUserId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/subscriptions/qr/${invalidUserId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe('QR Code não encontrado');
        });
    });

});