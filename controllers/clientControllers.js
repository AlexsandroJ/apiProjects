const createClientModel = require("../models/clientModels");
require("dotenv").config();
const ClientZap = createClientModel(process.env.COLLECTION_NAME_CLIENT_PEDIDOS);

// Criar cliente
exports.createClient = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "O campo 'phone' é obrigatório" });
        }

        // Verifica se já existe um cliente com esse telefone
        const existingClient = await ClientZap.findOne({ phone: phone });

        if (existingClient) {
            return res.status(409).json({ error: "Cliente com este número de telefone já existe" });
        }

        // Se não existe, cria o novo cliente
        const newClient = new ClientZap({
            phone,
        });

        const savedClient = await newClient.save();
        return res.status(201).json(savedClient);

    } catch (error) {
        return res.status(500).json({ 
            error: "Erro ao criar cliente", 
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
        console.error("Erro ao listar clientes:", error);
        return res.status(500).json({ error: "Erro ao listar clientes", details: error.message });
    }
};

// Obter cliente por ID
exports.getClientById = async (req, res) => {
    try {
        const { phone } = req.params;
        const client = await ClientZap.findOne( {phone: phone} );

        if (!client) {
            return res.status(404).json({ error: "cliente não encontrado" });
        }

        return res.status(200).json(client);
    } catch (error) {
        console.error("Erro ao obter cliente:", error);
        return res.status(500).json({ error: "Erro ao obter cliente", details: error.message });
    }
};

// Atualizar cliente
exports.updateClient = async (req, res) => {
    try {
        const { phone } = req.params;
        const updates = req.body;

        const updatedClient = await ClientZap.findOneAndUpdate({phone: phone }, updates, { new: true });

        if (!updatedClient) {
            return res.status(404).json({ error: "cliente não encontrado" });
        }

        return res.status(200).json(updatedClient);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        return res.status(500).json({ error: "Erro ao atualizar cliente", details: error.message });
    }
};

// Excluir cliente
exports.deleteClient = async (req, res) => {
    try {
        const { phone } = req.params;
        
        const deletedClient = await ClientZap.findOneAndDelete({phone: phone});

        if (!deletedClient) {
            return res.status(404).json({ error: "cliente não encontrado" });
        }
        return res.status(200).json({ message: "cliente excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        return res.status(500).json({ error: "Erro ao excluir cliente", details: error.message });
    }
};

// Função para adicionar uma entrada ao histórico de um cliente
exports.addHistoryToClient = async (req, res) => {
    const { phone } = req.params; // Número do cliente na URL
    const { role, content } = req.body; // Dados da mensagem a ser adicionada

    // Validações básicas
    if (!phone) {
        return res.status(400).json({ error: "Número de telefone é obrigatório." });
    }

    if (!role || !content || !['user', 'assistant'].includes(role)) {
        return res.status(400).json({
            error: "Campo 'role' e 'content' são obrigatórios. Role deve ser 'user' ou 'assistant'."
        });
    }

    try {
        // Encontra o cliente pelo número de telefone
        const client = await ClientZap.findOne({ phone });

        if (!client) {
            return res.status(404).json({ error: "Cliente não encontrado." });
        }
        // Adiciona a nova entrada ao histórico
        client.history.push({
            role,
            content,
            timestamp: new Date()
        });

        // Salva as alterações
        await client.save();

        return res.status(200).json({
            message: "Histórico atualizado com sucesso.",
            history: client.history
        });

    } catch (error) {
        console.error("Erro ao adicionar histórico:", error);
        return res.status(500).json({ error: "Erro interno ao processar a solicitação." });
    }
};