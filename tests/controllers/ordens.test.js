const request = require("supertest");
const app = require("../../app");
const createClientModel = require("../../models/clientModels");

// Cria o modelo dinamicamente usando a variável de ambiente
const OrdensForProdution = createClientModel(process.env.COLLECTION_NAME_CLIENT_PEDIDOS);

// Limpa a coleção antes de cada teste
beforeEach(async () => {
    await OrdensForProdution.deleteMany({});
});

describe("Testes das Rotas de Ordens", () => {

    // =============================
    // 🧾 Cadastro de Ordens
    // =============================
    describe("POST /api/ordens", () => {
        it("Deve criar um novo Ordens com sucesso", async () => {
            const response = await request(app)
                .post("/api/ordens")
                .send({
                    phone: "5511987654321",
                    etapa: "9",
                    address: "rua do cajueiro",
                    city: "Recife",
                    bairro: "Cajueiro seco",
                    num: "666",
                    rua: "rua do futuro",
                    frete: "10.00",
                    name: "Alex",
                    orders: [],
                    money: "Pix",
                });

            expect(response.status).toBe(201);
            expect(response.body.phone).toBe("5511987654321");
        });

        it("Deve retornar 400 se o campo 'phone' não for enviado", async () => {
            const response = await request(app)
                .post("/api/ordens")
                .send({
                    name: "João",
                    address: "Rua A",
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("ordensControllers: O campo 'phone' é obrigatório");
        });

        it("Deve impedir cadastro de Ordens com número de telefone já existente", async () => {
            await request(app)
                .post("/api/ordens")
                .send({ phone: "5511987654321" });

            const response = await request(app)
                .post("/api/ordens")
                .send({ phone: "5511987654321" });

            expect(response.status).toBe(409); // Ou 409 se você tratar conflito
            expect(response.body.error).toContain("ordensControllers: Ordens com este número de telefone já existe");
        });
    });

    // =============================
    // 🔍 Listagem de Clientes
    // =============================
    describe("GET /api/ordens", () => {
        it("Deve retornar uma lista vazia quando não há clientes", async () => {
            const response = await request(app).get("/api/ordens");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("Deve retornar todos os clientes cadastrados", async () => {
            await OrdensForProdution.create({
                phone: "5511987654321",
                name: "João",
            });

            const response = await request(app).get("/api/ordens");

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].phone).toBe("5511987654321");
        });
    });

    // =============================
    // 🔍 Buscar Ordens por Telefone
    // =============================
    describe("GET /api/ordens/:phone", () => {
        it("Deve retornar um Ordens pelo número de telefone", async () => {
            const Ordens = await OrdensForProdution.create({
                phone: "5511987654321",
                name: "João"
            });

            const response = await request(app).get(`/api/ordens/${Ordens.phone}`);

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe(Ordens.phone);
            expect(response.body.name).toBe(Ordens.name);
        });

        it("Deve retornar 404 se o Ordens não for encontrado", async () => {
            const response = await request(app).get("/api/ordens/telefone-invalido");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("ordensControllers: Ordens não encontrado");
        });
    });

    // =============================
    // 🗑️ Excluir Ordens
    // =============================
    describe("DELETE /api/ordens/:phone", () => {
        it("Deve excluir um Ordens com sucesso", async () => {
            const Ordens = await OrdensForProdution.create({
                phone: "5511987654321",
                name: "João",
            });

            const response = await request(app).delete(`/api/ordens/${Ordens.phone}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("ordensControllers: Ordens excluído com sucesso");

            const clienteExcluido = await OrdensForProdution.findOne({ phone: Ordens.phone });
            expect(clienteExcluido).toBeNull();
        });

        it("Deve retornar 404 ao tentar excluir Ordens inexistente", async () => {
            const response = await request(app).delete("/api/ordens/telefone-invalido");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("ordensControllers: Ordens não encontrado");
        });
    });
});