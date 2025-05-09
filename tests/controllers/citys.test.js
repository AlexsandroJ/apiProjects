const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app');

describe('Teste da Rota de Cidades com MongoDB em Memória', () => {
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
            .send({ userId });
    });

    afterAll(async () => {
        // Limpa o banco de dados após os testes
        await mongoose.connection.db.dropDatabase();
    });

    describe('POST /api/cities/:userId', () => {
        it('deve criar uma nova cidade com sucesso', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };
            const response = await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Cidade criada com sucesso.');
        });

        it('deve retornar 400 se a cidade já existir', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cidade já existe.');
        });
    });

    describe('GET /api/cities/:userId', () => {
        it('deve listar todas as cidades de um usuário', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .get(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.cities.length).toBe(1);
            expect(response.body.cities[0].name).toBe('São Paulo');
        });

        it('deve retornar 404 se o usuário não for encontrado', async () => {
            const invalidUserId = new mongoose.Types.ObjectId().toString(); // ID inválido

            const response = await request(app)
                .get(`/api/cities/${invalidUserId}`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Usuário não encontrado.');
        });
    });

    describe('GET /api/cities/:userId/:cityName', () => {
        it('deve obter uma cidade específica pelo nome', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .get(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.city.name).toBe('São Paulo');
        });

        it('deve retornar 404 se a cidade não for encontrada', async () => {
            const response = await request(app)
                .get(`/api/cities/${userId}/São`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cidade não encontrada.');
        });
    });

    describe('PUT /api/cities/:userId/:cityName', () => {
        it('deve atualizar uma cidade com sucesso', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .put(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newName: 'São Paulo Atualizada' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cidade atualizada com sucesso.');
        });

        it('deve retornar 404 se a cidade não for encontrada', async () => {
            const response = await request(app)
                .put(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newName: 'São Paulo Atualizada' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cidade não encontrada.');
        });
    });

    describe('DELETE /api/cities/:userId/:cityName', () => {
        it('deve excluir uma cidade com sucesso', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .delete(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Cidade excluída com sucesso.');
        });

        it('deve retornar 404 se a cidade não for encontrada', async () => {
            const response = await request(app)
                .delete(`/api/cities/${userId}/São Paulo`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Cidade não encontrada.');
        });
    });

    describe('POST /api/cities/:userId/:cityName/neighborhoods', () => {
        it('deve adicionar um bairro à cidade com sucesso', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .post(`/api/cities/${userId}/São Paulo/neighborhoods`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ neighborhoodName: 'Moema' });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Bairro adicionado com sucesso.');
        });

        it('deve retornar 400 se o bairro já existir', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .post(`/api/cities/${userId}/São Paulo/neighborhoods`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ neighborhoodName: 'Jardins' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Bairro já existe nesta cidade.');
        });
    });

    describe('PUT /api/cities/:userId/:cityName/:neighborhoodName', () => {
        it('deve atualizar um bairro com sucesso', async () => {
            const mockCityData = { name: 'São Paulo', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .put(`/api/cities/${userId}/São Paulo/Jardins`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newNeighborhoodName: 'Jardim Paulista' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Bairro atualizado com sucesso.');
        });

        it('deve retornar 404 se o bairro não for encontrado', async () => {
            const mockCityData = { name: 'São Carlos', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .put(`/api/cities/${userId}/São Carlos/Moema`)
                .set('Authorization', `Bearer ${Token}`)
                .send({ newNeighborhoodName: 'Jardim Paulista 2' });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Bairro não encontrado.');
        });
    });

    describe('DELETE /api/cities/:userId/:cityName/:neighborhoodName', () => {
        it('deve excluir um bairro com sucesso', async () => {
            const mockCityData = { name: 'São Judas', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .delete(`/api/cities/${userId}/São Judas/Jardins`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Bairro removido com sucesso.');
        });

        it('deve retornar 404 se o bairro não for encontrado', async () => {
            const mockCityData = { name: 'São Carlos', neighborhoods: [{ name: 'Jardins' }] };

            await request(app)
                .post(`/api/cities/${userId}`)
                .set('Authorization', `Bearer ${Token}`)
                .send(mockCityData);

            const response = await request(app)
                .delete(`/api/cities/${userId}/São Carlos/Moema`)
                .set('Authorization', `Bearer ${Token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Bairro não encontrado.');
        });
    });
});