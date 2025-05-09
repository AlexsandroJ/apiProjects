const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

describe('Testes das Rotas de Usuário', () => {
    let userId;
    let token;

    // Limpa o banco e cria usuário antes de cada teste
    beforeEach(async () => {
        await User.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword
        });
        userId = user._id.toString();;
        token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
    });
  
    // =============================
    // 🧾 Cadastro de Usuário
    // =============================
    describe('Cadastro de Usuário', () => {
        it('Deve criar um novo usuário com dados válidos', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'Jane',
                    email: 'jane@example.com',
                    password: 'password321'
                });

            expect(response.status).toBe(201);
        });

        it('Deve retornar erro 400 ao tentar criar usuário com dados inválidos', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: '',
                    email: 'invalid-email',
                    password: 'short'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        it('Deve retornar erro 400 ao tentar criar usuário com email duplicado', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email já registrado.');
        });
    });
  
    // =============================
    // 🔐 Autenticação (JWT)
    // =============================
    describe('Autenticação (JWT)', () => {
        it('Deve impedir atualização sem token', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ name: 'John Updated' });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('authMiddleware: Acesso negado. Token não fornecido.');
        });

        it('Deve impedir exclusão sem token', async () => {
            const response = await request(app)
                .delete(`/api/users/${userId}`);

            expect(response.status).toBe(401);
            expect(response.body.error).toBe('authMiddleware: Acesso negado. Token não fornecido.');
        });
    });

    // =============================
    // 📝 Atualização de Usuário
    // =============================
    describe('Atualização de Usuário', () => {
        it('Deve atualizar um usuário por ID com autenticação', async () => {


           const res = await request(app).get(`/api/users/${userId}`)
                

            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'John Updated' });

            

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('John Updated');
        });

        it('Deve atualizar a senha de um usuário com autenticação', async () => {
            const newPassword = 'newPassword456';
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ password: newPassword });
          
            expect(response.status).toBe(200);

            const updatedUser = await User.findById(userId);
            const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
            expect(isPasswordValid).toBe(true);
        });

        it('Deve retornar erro 400 ao tentar atualizar com dados inválidos', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: '' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });
    });
    
    // =============================
    // 🗑️ Exclusão de Usuário
    // =============================
    describe('Exclusão de Usuário', () => {
        it('Deve excluir um usuário por ID com autenticação', async () => {
            const response = await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Usuário excluído com sucesso.');

            const deletedUser = await User.findById(userId);
            expect(deletedUser).toBeNull();
        });

        it('Deve retornar erro 404 ao tentar excluir um usuário inexistente', async () => {
            const invalidUserId = '64b8f5c5e5d8b5f8e5d8b5f8';
            const response = await request(app)
                .delete(`/api/users/${invalidUserId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Usuário não encontrado.');
        });
    });
});