const createClientModel = require("../models/clientModels");
require("dotenv").config();
const OrdensForProdution = createClientModel(process.env.COLLECTION_NAME_CLIENT_PEDIDOS);

// Criar Ordens
exports.createOrdens = async (req, res) => {
    try {
        const { phone } = req.body;
        const data = req.body;

        if (!phone) {
            return res.status(400).json({ error: "ordensControllers: O campo 'phone' é obrigatório" });
        }

        // Verifica se já existe um Ordens com esse telefone
        const existingClient = await OrdensForProdution.findOne({ phone: phone });

        if (existingClient) {
            return res.status(409).json({ error: `ordensControllers: Ordens com este número de telefone já existe:`, });
        }

        // Se não existe, cria o novo Ordens
        //const newClient = new OrdensForProdution({
        //    phone: data.phone
        //});

        
        const newClient = new OrdensForProdution({
            phone: data.phone,
            etapa: data.etapa,
            address: data.address,
            city: data.city,
            bairro: data.bairro,
            num: data.num,
            rua: data.rua,
            frete: data.frete,
            name: data.name,
            orders: data.orders,
            money: data.money,
        });
            

        const savedClient = await newClient.save();
        return res.status(201).json(savedClient);

    } catch (error) {
        return res.status(500).json({ 
            error: "ordensControllers: Erro ao criar Ordens", 
            details: error.message 
        });
    }
};

// Listar todos os clientes
exports.getAllOrdens = async (req, res) => {
    try {
        const clients = await OrdensForProdution.find();
        return res.status(200).json(clients);
    } catch (error) {
        console.error("ordensControllers: Erro ao listar clientes:", error);
        return res.status(500).json({ error: "ordensControllers: Erro ao listar clientes", details: error.message });
    }
};

// Obter Ordens por ID
exports.getOrdensById = async (req, res) => {
    try {
        const { phone } = req.params;
        const client = await OrdensForProdution.findOne( {phone: phone} );

        if (!client) {
            return res.status(404).json({ error: "ordensControllers: Ordens não encontrado" });
        }

        return res.status(200).json(client);
    } catch (error) {
        console.error("Erro ao obter Ordens:", error);
        return res.status(500).json({ error: "ordensControllers: Erro ao obter Ordens", details: error.message });
    }
};

// Excluir Orden
exports.deleteOrdens = async (req, res) => {
    try {
        const { phone } = req.params;
        
        const deletedClient = await OrdensForProdution.findOneAndDelete({phone: phone});

        if (!deletedClient) {
            return res.status(404).json({ error: "ordensControllers: Ordens não encontrado" });
        }
        return res.status(200).json({ message: "ordensControllers: Ordens excluído com sucesso" });
    } catch (error) {
        console.error("ordensControllers: Erro ao excluir Ordens:", error);
        return res.status(500).json({ error: "ordensControllers: Erro ao excluir Ordens", details: error.message });
    }
};

