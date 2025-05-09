const request = require("supertest");
const mongoose = require("mongoose");
const User = require('../../models/userModels');
const app = require("../../app");
const Products = require("../../models/productsModels");

describe("Testes das Rotas de Categoria", () => {
    let userId;

    // Setup inicial: cria um usuário com categorias antes dos testes
    beforeEach(async () => {
        await Products.deleteMany({});

        const product = await Products.create({
            userId: new mongoose.Types.ObjectId(),
            products: [
                { category: "Electronics", items: [] },
                { category: "Books", items: [] },
            ],
        });

        userId = product.userId;
    });

    // =============================
    // ➕ Criação de Categoria
    // =============================
    describe("POST /api/category/:userId", () => {
        it("deve criar uma nova categoria com sucesso", async () => {
            const response = await request(app)
                .post(`/api/category/${userId}`)
                .send({ userId, category: "Clothing" });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe("Categoria criada com sucesso");
            expect(response.body.category).toBe("Clothing");

            const updatedProduct = await Products.findOne({ userId });
            expect(updatedProduct.products.some(cat => cat.category === "Clothing")).toBe(true);
        });

        it("deve retornar 404 se o usuário não for encontrado", async () => {
            const invalidUserId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .post(`/api/category/${invalidUserId}`)
                .send({ userId: invalidUserId, category: "Clothing" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Usuário não encontrado");
        });

        it("deve retornar 400 se a categoria já existir", async () => {
            const response = await request(app)
                .post(`/api/category/${userId}`)
                .send({ userId, category: "Electronics" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Categoria já existe");
        });
    });

    // =============================
    // 🔍 Listagem de Categorias
    // =============================
    describe("GET /api/category/:userId", () => {
        it("deve retornar todas as categorias de um usuário", async () => {
            const response = await request(app).get(`/api/category/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body.categories).toHaveLength(2);
            expect(response.body.categories[0].category).toBe("Electronics");
            expect(response.body.categories[1].category).toBe("Books");
        });

        it("deve retornar 404 se o usuário não for encontrado", async () => {
            const invalidUserId = new mongoose.Types.ObjectId();
            const response = await request(app).get(`/api/category/${invalidUserId}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Usuário não encontrado");
        });
    });

    // =============================
    // ✏️ Atualização de Categoria
    // =============================
    describe("PUT /api/category/:userId", () => {
        it("deve editar uma categoria com sucesso", async () => {
            const response = await request(app)
                .put(`/api/category/${userId}`)
                .send({ userId, oldCategory: "Electronics", newCategory: "Gadgets" });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Categoria editada com sucesso");
            expect(response.body.updatedCategory).toBe("Gadgets");

            const updatedProduct = await Products.findOne({ userId });
            expect(updatedProduct.products.some(cat => cat.category === "Gadgets")).toBe(true);
        });

        it("deve retornar 404 se o usuário não for encontrado", async () => {
            const invalidUserId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/category/${invalidUserId}`)
                .send({ userId: invalidUserId, oldCategory: "Electronics", newCategory: "Gadgets" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Usuário não encontrado");
        });

        it("deve retornar 404 se a categoria antiga não for encontrada", async () => {
            const response = await request(app)
                .put(`/api/category/${userId}`)
                .send({ userId, oldCategory: "Toys", newCategory: "Gadgets" });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Categoria antiga não encontrada");
        });

        it("deve retornar 400 se a nova categoria já existir", async () => {
            const response = await request(app)
                .put(`/api/category/${userId}`)
                .send({ userId, oldCategory: "Electronics", newCategory: "Books" });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("A nova categoria já existe");
        });
    });

    // =============================
    // 🗑️ Exclusão de Categoria
    // =============================
    describe("DELETE /api/category/:userId/:category", () => {
        it("deve excluir uma categoria com sucesso", async () => {
            const response = await request(app).delete(`/api/category/${userId}/Electronics`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Categoria excluída com sucesso");

            const updatedProduct = await Products.findOne({ userId });
            expect(updatedProduct.products.some(cat => cat.category === "Electronics")).toBe(false);
        });

        it("deve retornar 404 se o usuário não for encontrado", async () => {
            const invalidUserId = new mongoose.Types.ObjectId();
            const response = await request(app).delete(`/api/category/${invalidUserId}/Electronics`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Usuário não encontrado");
        });

        it("deve retornar 404 se a categoria não for encontrada", async () => {
            const response = await request(app).delete(`/api/category/${userId}/Toys`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe("Categoria não encontrada");
        });
    });
});