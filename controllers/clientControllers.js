const createClientModel = require("../models/clientModels");
require("dotenv").config();
const ClientZap = createClientModel(process.env.COLLECTION_NAME_CLIENT_ZAP);

// Criar cliente
exports.createClient = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "clientControllers: O campo 'phone' é obrigatório" });
        }

        // Verifica se já existe um cliente com esse telefone
        const existingClient = await ClientZap.findOne({ phone: phone });

        if (existingClient) {
            return res.status(409).json({ error: "clientControllers: Cliente com este número de telefone já existe" });
        }

        // Se não existe, cria o novo cliente
        const newClient = new ClientZap({
            phone,
        });

        const savedClient = await newClient.save();
        return res.status(201).json(savedClient);

    } catch (error) {
        return res.status(500).json({ 
            error: "clientControllers: Erro ao criar cliente", 
            details: error.message 
        });
    }
};

// Listar todos os clientes
exports.getAllClients = async (req, res) => {
    try {
        const clients = await ClientZap.find();
        return res.status(200).json(clients);
    } catch (error) {
        console.error("clientControllers: Erro ao listar clientes:", error);
        return res.status(500).json({ error: "clientControllers: Erro ao listar clientes", details: error.message });
    }
};

// Obter cliente por ID
exports.getClientById = async (req, res) => {
    try {
        const { phone } = req.params;
        const client = await ClientZap.findOne( {phone: phone} );

        if (!client) {
            return res.status(404).json({ error: "clientControllers: cliente não encontrado" });
        }

        return res.status(200).json(client);
    } catch (error) {
        console.error("Erro ao obter cliente:", error);
        return res.status(500).json({ error: "clientControllers: Erro ao obter cliente", details: error.message });
    }
};

// Atualizar cliente
exports.updateClient = async (req, res) => {
    try {
        const { phone } = req.params;
        const updates = req.body;

        const updatedClient = await ClientZap.findOneAndUpdate({phone: phone }, updates, { new: true });

        if (!updatedClient) {
            return res.status(404).json({ error: "clientControllers: cliente não encontrado" });
        }

        return res.status(200).json(updatedClient);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        return res.status(500).json({ error: "clientControllers: Erro ao atualizar cliente", details: error.message });
    }
};

// Excluir cliente
exports.deleteClient = async (req, res) => {
    try {
        const { phone } = req.params;
        
        const deletedClient = await ClientZap.findOneAndDelete({phone: phone});

        if (!deletedClient) {
            return res.status(404).json({ error: "clientControllers: cliente não encontrado" });
        }
        return res.status(200).json({ message: "clientControllers: cliente excluído com sucesso" });
    } catch (error) {
        console.error("clientControllers: Erro ao excluir cliente:", error);
        return res.status(500).json({ error: "clientControllers: Erro ao excluir cliente", details: error.message });
    }
};

exports.addHistoryToClient = async (req, res) => {
    const { phone } = req.params; // Número do cliente na URL
    const { role, content } = req.body || {}; // Garante que req.body não seja undefined

    // Valida se o corpo da requisição foi enviado corretamente
    if (!req.body) {
        return res.status(400).json({ error: "clientControllers: Corpo da requisição ausente." });
    }

    // Valida número de telefone
    if (!phone) {
        return res.status(400).json({ error: "clientControllers: Número de telefone é obrigatório." });
    }

    // Valida campos 'role' e 'content'
    if (!role || !content || !['user', 'assistant'].includes(role)) {
        return res.status(400).json({
            error: "clientControllers: Campo 'role' e 'content' são obrigatórios. Role deve ser 'user' ou 'assistant'."
        });
    }

    try {
        // Busca o cliente pelo número de telefone
        const client = await ClientZap.findOne({ phone });

        if (!client) {
            return res.status(404).json({ error: "clientControllers: Cliente não encontrado." });
        }

        // Adiciona nova entrada ao histórico
        client.history.push({
            role,
            content,
            timestamp: new Date()
        });

        // Salva as alterações no cliente
        await client.save();

        return res.status(200).json({
            message: "clientControllers: Histórico atualizado com sucesso.",
            history: client.history
        });

    } catch (error) {
        console.error("clientControllers: Erro ao adicionar histórico:", error);

        // Tratamento específico para erros de validação do Mongoose ou outros erros conhecidos
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }

        // Erro ao salvar no banco
        if (error.code === 11000) {
            return res.status(400).json({ error: "clientControllers: Erro de duplicidade no banco de dados." });
        }

        // Outros erros internos
        return res.status(500).json({ error: "clientControllers: Erro interno ao processar a solicitação." });
    }
};

// Obter histórico de um cliente pelo número de telefone
exports.getHistoryByClientPhone = async (req, res) => {
    try {
        const { phone } = req.params;

        // Buscar cliente pelo telefone
        const client = await ClientZap.findOne({ phone: phone });

        if (!client) {
            return res.status(404).json({ error: "clientControllers: Cliente não encontrado." });
        }

        // Retorna apenas o histórico do cliente
        return res.status(200).json({
            phone: client.phone,
            history: client.history || []
        });

    } catch (error) {
        console.error("clientControllers: Erro ao obter histórico do cliente:", error);
        return res.status(500).json({ 
            error: "clientControllers: Erro ao obter histórico do cliente", 
            details: error.message 
        });
    }
};
