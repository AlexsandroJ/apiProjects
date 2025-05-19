const request = require("supertest");
const {app} = require("../../app");
const createClientModel = require("../../models/clientModels");

// Cria o modelo dinamicamente usando a variável de ambiente
const ClientZap = createClientModel(process.env.COLLECTION_NAME_CLIENT_PEDIDOS);

// Limpa a coleção antes de cada teste
beforeEach(async () => {
    await ClientZap.deleteMany({});
});

describe("Testes das Rotas de Cliente", () => {

    // =============================
    // 🧾 Cadastro de Cliente
    // =============================
    describe("POST /api/client", () => {
        it("Deve criar um novo cliente com sucesso", async () => {
            const response = await request(app)
                .post("/api/client")
                .send({
                    phone: "5511987654321"
                });

            expect(response.status).toBe(201);
            expect(response.body.phone).toBe("5511987654321");
        });

        it("Deve retornar 400 se o campo 'phone' não for enviado", async () => {
            const response = await request(app)
                .post("/api/client")
                .send({
                    name: "João",
                    address: "Rua A",
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("O campo 'phone' é obrigatório");
        });

        it("Deve impedir cadastro de cliente com número de telefone já existente", async () => {
            await request(app)
                .post("/api/client")
                .send({ phone: "5511987654321" });

            const response = await request(app)
                .post("/api/client")
                .send({ phone: "5511987654321" });

            expect(response.status).toBe(409); // Ou 409 se você tratar conflito
            expect(response.body.error).toContain("Cliente com este número de telefone já existe");
        });
    });

    // =============================
    // 🔍 Listagem de Clientes
    // =============================
    describe("GET /api/client", () => {
        it("Deve retornar uma lista vazia quando não há clientes", async () => {
            const response = await request(app).get("/api/client");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("Deve retornar todos os clientes cadastrados", async () => {
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

    // =============================
    // 🔍 Buscar Cliente por Telefone
    // =============================
    describe("GET /api/client/:phone", () => {
        it("Deve retornar um cliente pelo número de telefone", async () => {
            const cliente = await ClientZap.create({
                phone: "5511987654321",
                name: "João"
            });

            const response = await request(app).get(`/api/client/${cliente.phone}`);

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe(cliente.phone);
            expect(response.body.name).toBe(cliente.name);
        });

        it("Deve retornar 404 se o cliente não for encontrado", async () => {
            const response = await request(app).get("/api/client/telefone-invalido");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("cliente não encontrado");
        });
    });

    // =============================
    // 🛠️ Atualizar Cliente
    // =============================
    describe("PUT /api/client/:phone", () => {
        it("Deve atualizar as informações do cliente", async () => {
            const cliente = await ClientZap.create({
                phone: "5511987654321",
                name: "João",
            });

            const response = await request(app)
                .put(`/api/client/${cliente.phone}`)
                .send({ name: "Maria" });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Maria");
        });

        it("Deve permitir atualizar múltiplos campos do cliente", async () => {
            const cliente = await ClientZap.create({
                phone: "5511987654321",
                name: "João",
                address: "Rua Antiga"
            });

            const response = await request(app)
                .put(`/api/client/${cliente.phone}`)
                .send({
                    name: "Maria",
                    address: "Nova Rua, 123"
                });

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Maria");
            expect(response.body.address).toBe("Nova Rua, 123");
        });

        it("Deve retornar 404 ao tentar atualizar cliente inexistente", async () => {
            const response = await request(app)
                .put("/api/client/telefone-invalido")
                .send({ name: "Maria" });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("cliente não encontrado");
        });
    });

    // =============================
    // 🗑️ Excluir Cliente
    // =============================
    describe("DELETE /api/client/:phone", () => {
        it("Deve excluir um cliente com sucesso", async () => {
            const cliente = await ClientZap.create({
                phone: "5511987654321",
                name: "João",
            });

            const response = await request(app).delete(`/api/client/${cliente.phone}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("cliente excluído com sucesso");

            const clienteExcluido = await ClientZap.findOne({ phone: cliente.phone });
            expect(clienteExcluido).toBeNull();
        });

        it("Deve retornar 404 ao tentar excluir cliente inexistente", async () => {
            const response = await request(app).delete("/api/client/telefone-invalido");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("cliente não encontrado");
        });
    });

    // =============================
    // 📜 Histórico do Cliente
    // =============================
    describe("POST /api/client/history/:phone", () => {
        it("Deve adicionar uma entrada ao histórico do cliente", async () => {
            // Primeiro cria o cliente
            const clienteResposta = await request(app)
                .post("/api/client")
                .send({
                    phone: "987654321",
                    name: "Maria Souza",
                    address: "Rua B, 456"
                });

            expect(clienteResposta.status).toBe(201);

            // Adiciona uma entrada no histórico
            const historicoResposta = await request(app)
                .post("/api/client/history/987654321")
                .send({
                    role: "assistant",
                    content: "Olá Maria! Como posso ajudar?"
                });

            expect(historicoResposta.status).toBe(200);
            expect(historicoResposta.body.history).toHaveLength(1);
            expect(historicoResposta.body.history[0].role).toBe("assistant");
            expect(historicoResposta.body.history[0].content).toBe("Olá Maria! Como posso ajudar?");
        });

        it("Deve retornar 404 se tentar adicionar histórico para cliente inexistente", async () => {
            const resposta = await request(app)
                .post("/api/client/history/000000000")
                .send({
                    role: "user",
                    content: "Cliente inexistente"
                });

            expect(resposta.status).toBe(404);
            expect(resposta.body.error).toBe("Cliente não encontrado.");
        });

        it("Deve retornar 400 se 'role' for inválido ou faltar", async () => {
            // Cria cliente primeiro
            await request(app)
                .post("/api/client")
                .send({ phone: "123456789" });

            const response = await request(app)
                .post("/api/client/history/123456789")
                .send({
                    role: "invalid_role", // Role inválido
                    content: "Conteúdo qualquer"
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Role deve ser 'user' ou 'assistant'");
        });

        it("Deve retornar 400 se 'content' estiver vazio", async () => {
            await request(app)
                .post("/api/client")
                .send({ phone: "111222333" });

            const response = await request(app)
                .post("/api/client/history/111222333")
                .send({
                    role: "user",
                    content: "" // Conteúdo vazio
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Campo 'role' e 'content' são obrigatórios. Role deve ser 'user' ou 'assistant'.");
        });

        it("Deve retornar 400 se o corpo da requisição estiver vazio", async () => {
            await request(app)
                .post("/api/client")
                .send({ phone: "999888777" });

            const response = await request(app)
                .post("/api/client/history/999888777")
                .send(); // Sem corpo

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Campo 'role' e 'content' são obrigatórios. Role deve ser 'user' ou 'assistant'.");
        });
    });

    // =============================
    // 📖 Obter Histórico do Cliente
    // =============================
    describe("GET /api/client/history/:phone", () => {
        it("Deve retornar o histórico de um cliente pelo número de telefone", async () => {
            // Cria cliente com histórico pré-existente
            const cliente = await ClientZap.create({
                phone: "987654321",
                name: "Carlos Almeida",
                history: [
                    {
                        role: "user",
                        content: "Olá, tudo bem?",
                        timestamp: new Date()
                    },
                    {
                        role: "assistant",
                        content: "Tudo sim! Como posso ajudar?",
                        timestamp: new Date()
                    }
                ]
            });

            const response = await request(app).get(`/api/client/history/${cliente.phone}`);

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe(cliente.phone);
            expect(response.body.history).toHaveLength(2);
            expect(response.body.history[0].role).toBe("user");
            expect(response.body.history[0].content).toBe("Olá, tudo bem?");
            expect(response.body.history[1].role).toBe("assistant");
            expect(response.body.history[1].content).toBe("Tudo sim! Como posso ajudar?");
        });

        it("Deve retornar histórico vazio se o cliente não tiver histórico", async () => {
            const cliente = await ClientZap.create({
                phone: "123456789",
                name: "Ana Silva"
            });

            const response = await request(app).get(`/api/client/history/${cliente.phone}`);

            expect(response.status).toBe(200);
            expect(response.body.phone).toBe(cliente.phone);
            expect(response.body.history).toEqual([]);
        });

        it("Deve retornar 404 se o cliente não existir", async () => {
            const response = await request(app).get("/api/client/history/000000000");

            expect(response.status).toBe(404);
            expect(response.body.error).toBe("Cliente não encontrado.");
        });

        it("Deve retornar 404 com mensagem formatada quando cliente não existe", async () => {
            const response = await request(app).get("/api/client/history/000000000");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: "Cliente não encontrado." });
        });
    });
});