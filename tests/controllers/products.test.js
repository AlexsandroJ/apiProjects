const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app"); // Importe sua aplicação Express
const Products = require("../../models/productsModels");

// Limpar o banco de dados após cada teste
afterEach(async () => {
    await Products.deleteMany({});
});

describe("Testes das Rotas de Produtos", () => {
    let userId;

    beforeEach(() => {
        userId = new mongoose.Types.ObjectId(); // Gera um ID válido para o usuário antes de cada teste relevante
    });

    // =============================
    // 📦 Cadastro de Produto
    // =============================
    describe("POST /api/products", () => {
        it("Deve criar um novo produto para um usuário", async () => {
            const response = await request(app)
                .post("/api/products")
                .send({ userId })
                .expect(201);

            expect(response.body.message).toBe("Produto criado com sucesso");
            expect(response.body.product.userId).toEqual(userId.toString());
            expect(response.body.product.products).toHaveLength(0);
        });

        it("Não deve criar um produto se já existir para o mesmo usuário", async () => {
            // Cria um produto inicialmente
            await Products.create({ userId, products: [] });

            const response = await request(app)
                .post("/api/products")
                .send({ userId })
                .expect(400);

            expect(response.body.message).toBe("Produto já existe para este usuário");
        });
    });

    // =============================
    // 🔍 Busca de Produtos
    // =============================
    describe("GET /api/products/:userId", () => {
        it("Deve retornar os produtos de um usuário", async () => {
            await Products.create({ userId, products: [] });

            const response = await request(app)
                .get(`/api/products/${userId}`)
                .expect(200);

            expect(response.body.products).toHaveLength(0);
        });

        it("Deve retornar 404 se o usuário não for encontrado", async () => {
            const response = await request(app)
                .get(`/api/products/${userId}`)
                .expect(404);

            expect(response.body.message).toBe("Usuário não encontrado");
        });
    });

    // =============================
    // 🗑️ Exclusão de Produto
    // =============================
    describe("DELETE /api/products/:userId", () => {
        it("Deve excluir um produto de um usuário", async () => {
            await Products.create({ userId, products: [] });

            const response = await request(app)
                .delete(`/api/products/${userId}`)
                .expect(200);

            expect(response.body.message).toBe("Produto excluído com sucesso");

            // Verifica se o produto foi removido do banco de dados
            const deletedProduct = await Products.findOne({ userId });
            expect(deletedProduct).toBeNull();
        });

        it("Deve retornar 404 se o usuário não for encontrado", async () => {
            const response = await request(app)
                .delete(`/api/products/${userId}`)
                .expect(404);

            expect(response.body.message).toBe("Usuário não encontrado");
        });
    });
});