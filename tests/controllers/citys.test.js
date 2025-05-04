const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Products = require('../../models/productsModels'); // Importe o modelo
const User = require('../../models/userModels'); // Importe o modelo de usuário (se necessário)

const app = require('../../app');

describe('City Router Tests with MongoDB in Memory', () => {
    let userId;
    let Token;

    beforeAll(async () => {
        // Cria um usuário no banco de dados em memória
        const response = await request(app)
              .post('/api/users')
              .send({
                name: 'Jane',
                email: 'janes@example.com',
                password: 'password321'
              });
        userId = response.body.userId;
        Token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await request(app)
            .post("/api/products")
            .send({ userId })
    });

    afterAll(async () => {
        // Limpa o banco de dados após os testes
        await mongoose.connection.db.dropDatabase();
    });

    describe('POST /api/cities/:userId', () => {
        it('should create a new city successfully', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };
           
            const response = await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);
            
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Cidade criada com sucesso.');
        });

        it('should return 400 if city already exists', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Primeira requisição para criar a cidade
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Segunda requisição para tentar criar a mesma cidade
            const response = await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cidade já existe.');
        });
    });
   
    describe('GET /api/cities/:userId', () => {
        it('should list all cities for a user', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Lista todas as cidades do usuário
            const response = await request(app)
                .get(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.cities.length).toBe(1);
            expect(response.body.cities[0].name).toBe('São Paulo');
        });

        it('should return 404 if user not found', async () => {
            const invalidUserId = new mongoose.Types.ObjectId().toString(); // ID inválido

            const response = await request(app)
                .get(`/api/cities/${invalidUserId}`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Usuário não encontrado.');
        });
    });

    describe('GET /api/cities/:userId/:cityName', () => {
        it('should get a specific city by name', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Busca a cidade pelo nome
            const response = await request(app)
                .get(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.city.name).toBe('São Paulo');
        });

        it('should return 404 if city not found', async () => {
            const response = await request(app)
                .get(`/api/cities/${userId}/São`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cidade não encontrada.');
        });
    });

    describe('PUT /api/cities/:userId/:cityName', () => {
        it('should update a city successfully', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Atualiza a cidade
            const response = await request(app)
                .put(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newName: 'São Paulo Atualizada' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cidade atualizada com sucesso.');
        });

        it('should return 404 if city not found', async () => {
            const response = await request(app)
                .put(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newName: 'São Paulo Atualizada' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cidade não encontrada.');
        });
    });

    describe('DELETE /api/cities/:userId/:cityName', () => {
        it('should delete a city successfully', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Exclui a cidade
            const response = await request(app)
                .delete(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cidade excluída com sucesso.');
        });

        it('should return 404 if city not found', async () => {
            const response = await request(app)
                .delete(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cidade não encontrada.');
        });
    });

    describe('POST /api/cities/:userId/:cityName/neighborhoods', () => {
        it('should add a neighborhood to a city successfully', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Adiciona um bairro à cidade
            const response = await request(app)
                .post(`/api/cities/${userId}/São Paulo/neighborhoods`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ neighborhoodName: 'Moema' });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Bairro adicionado com sucesso.');
        });

        it('should return 400 if neighborhood already exists', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Tenta adicionar o mesmo bairro novamente
            const response = await request(app)
                .post(`/api/cities/${userId}/São Paulo/neighborhoods`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ neighborhoodName: 'Jardins' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Bairro já existe nesta cidade.');
        });
    });

    describe('PUT /api/cities/:userId/:cityName/:neighborhoodName', () => {
        it('should update a neighborhood successfully', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Atualiza o bairro
            const response = await request(app)
                .put(`/api/cities/${userId}/São Paulo/Jardins`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newNeighborhoodName: 'Jardim Paulista' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Bairro atualizado com sucesso.');
        });

        it('should return 404 if neighborhood not found', async () => {
            const mockCityData = { name: 'São Carlos', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Tenta atualizar um bairro inexistente
            const response = await request(app)
                .put(`/api/cities/${userId}/São Carlos/Moema`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newNeighborhoodName: 'Jardim Paulista 2' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Bairro não encontrado.');
        });
    });

    describe('DELETE /api/cities/:userId/:cityName/:neighborhoodName', () => {
        it('should delete a neighborhood successfully', async () => {
            const mockCityData = { name: 'São judas', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Exclui o bairro
            const response = await request(app)
                .delete(`/api/cities/${userId}/São judas/Jardins`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Bairro removido com sucesso.');
        });

        it('should return 404 if neighborhood not found', async () => {
            const mockCityData = { name: 'São Carlos', neighborhoods: [{ name: 'Jardins' }] };

            // Cria uma cidade no banco de dados
            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            // Tenta excluir um bairro inexistente
            const response = await request(app)
                .delete(`/api/cities/${userId}/São Carlos/Moema`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Bairro não encontrado.');
        });
    });
    
});