const request = require('supertest');
const {app} = require('../../app');
const User = require('../../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// =============================
// 🧪 Testes das Rotas de Sessão
// =============================
describe('Testes das Rotas de Sessão', () => {
    let user;

    beforeEach(async () => {
        await User.deleteMany({});
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword
        });
    });

    // -------------------------------
    // 🔑 Login
    // -------------------------------
    describe('Login', () => {
        it('Deve fazer login com credenciais válidas e retornar um token JWT', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('Deve retornar erro 401 para credenciais inválidas (senha incorreta)', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'john@example.com',
                    password: 'senhaerrada'
                });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('sessionController: Credenciais inválidas.');
        });

        it('Deve retornar erro 401 para email inexistente', async () => {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'inexistente@example.com',
                    password: 'password123'
                });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('sessionController: Credenciais inválidas.');
        });
    });

    // -------------------------------
    // 🔚 Logout
    // -------------------------------
    describe('Logout', () => {
        it('Deve encerrar a sessão com sucesso ao fazer logout', async () => {
            const loginResponse = await request(app)
                .post('/api/sessions/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });
            const token = loginResponse.body.token;

            const response = await request(app)
                .post('/api/sessions/logout')
                .set('Authorization', `Bearer ${token}`)
                .send({ token });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('sessionController: Logout realizado com sucesso.');
        });

        it('Deve retornar erro 403 para logout com token inválido', async () => {
            const response = await request(app)
                .post('/api/sessions/logout')
                .set('Authorization', `Bearer ${'tokeninvalido'}`)
                .send({ token: 'tokeninvalido' });

            expect(response.status).toBe(403);
            expect(response.body.error).toBeDefined();
        });
    });

    // -------------------------------
    // ⏳ Token Expirado
    // -------------------------------
    describe('Token Expirado', () => {
        it('Deve retornar erro 401 para token expirado', async () => {
            const expiredToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '-1h' });
            const response = await request(app)
                .put(`/api/users/${user._id}`)
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('authMiddleware: Token expirado.');
        });
    });
});

// =============================
// 🧪 Teste da Rota /check-token
// =============================
describe('POST /api/sessions/check-token', () => {
    let userId;
    let token;

    beforeAll(async () => {
        await User.deleteMany({});
        const response = await request(app)
            .post('/api/users')
            .send({
                name: 'Jane',
                email: 'joh@example.com',
                password: 'password123'
            });
        expect(response.status).toBe(201);
        userId = response.body.userId;

        const resp = await request(app)
            .post('/api/sessions/login')
            .send({
                email: 'joh@example.com',
                password: 'password123'
            });
        expect(resp.status).toBe(200);
        expect(resp.body).toHaveProperty('token');
        token = resp.body.token;
    });

    it('Deve retornar 200 e informações do usuário para um token válido', async () => {
        const response = await request(app)
            .post('/api/sessions/check-token')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(userId);
        expect(response.body.message).toBe('sessionController: Token válido.');
    });

    it('Deve retornar 403 para um token inválido', async () => {
        const invalidToken = jwt.sign({ userId }, 'invalid-secret', { expiresIn: '1h' });
        const response = await request(app)
            .post('/api/sessions/check-token')
            .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty('error', 'authMiddleware: Token inválido.');
    });

    it('Deve retornar 401 para um token expirado', async () => {
        const expiredToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '-1h' });
        const response = await request(app)
            .post('/api/sessions/check-token')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('authMiddleware: Token expirado.');
    });

    it('Deve retornar 401 se o token não for fornecido', async () => {
        const response = await request(app).post('/api/sessions/check-token');
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'authMiddleware: Acesso negado. Token não fornecido.');
    });
});