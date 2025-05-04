const request = require("supertest");
const app = require("../../app");
const ClientZap = require('../../models/clientModels');

// Limpar o banco de dados antes de cada teste
beforeEach(async () => {
    await ClientZap.deleteMany({});
});

describe("POST /api/client", () => {

    it("Criando novo cliente do zap", async () => {
        const response = await request(app)
            .post("/api/client")
            .send({
                phone: "5511987654321"
            });
        expect(response.status).toBe(201);
        expect(response.body.phone).toBe("5511987654321");
    });

    it("Deve retornar 400 sem phone", async () => {
        const response = await request(app)
            .post("/api/client")
            .send({
                name: "João",
                address: "Rua A",
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("O campo 'phone' é obrigatório");
    });
});

// Teste: Listar todos os usuários
describe("GET /api/client", () => {
    it("should return an empty array if no clientZaps exist", async () => {
        const response = await request(app).get("/api/client");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should return all clientZaps", async () => {
        await ClientZap.create({
            phone: "5511987654321",
            name: "João",
        });

        const response = await request(app).get("/api/client");

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].phone).toBe("5511987654321");
    });
});

// Teste: Obter usuário por ID
describe("GET /api/client/:id", () => {
    it("should return a clientZap by ID", async () => {
        const clientZap = await ClientZap.create({

            phone: "5511987654321",
            name: "João",
        });

        const response = await request(app).get(`/api/client/${clientZap.phone}`);

        expect(response.status).toBe(200);
        expect(response.body.phone).toBe("5511987654321");
    });

    it("should return 404 if clientZap is not found", async () => {
        const response = await request(app).get("/api/client/invalid-id");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("cliente não encontrado");
    });
});

// Teste: Atualizar usuário
describe("PUT /api/client/:id", () => {
    it("should update a clientZap", async () => {
        const clientZap = await ClientZap.create({

            phone: "5511987654321",
            name: "João",
        });

        const response = await request(app)
            .put(`/api/client/${clientZap.phone}`)
            .send({ name: "Maria" });

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Maria");
    });

    it("should return 404 if clientZap is not found", async () => {
        const response = await request(app)
            .put("/api/client/invalid-id")
            .send({ name: "Maria" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("cliente não encontrado");
    });
});

// Teste: Excluir usuário
describe("DELETE /api/client/:id", () => {
    it("should delete a clientZap", async () => {
        const clientZap = await ClientZap.create({

            phone: "5511987654321",
            name: "João",
        });

        const response = await request(app).delete(`/api/client/${clientZap.phone}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("cliente excluído com sucesso");

        const deletedclientZap = await ClientZap.findOneAndDelete(clientZap.phone);
        expect(deletedclientZap).toBeNull();
    });

    it("should return 404 if clientZap is not found", async () => {
        const response = await request(app).delete("/api/client/invalid-id");

        expect(response.status).toBe(404);
        expect(response.body.error).toBe("cliente não encontrado");
    });

});
