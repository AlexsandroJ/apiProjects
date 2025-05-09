const mongoose = require("mongoose");

// Definindo o Schema
const clientSchema = new mongoose.Schema({
    etapa: {
        type: Number,
        default: 1, // Valor padrão é 1
    },
    phone: {
        type: String,
        required: true, // O número de telefone é obrigatório
        unique: true,   // Garante que cada número de telefone seja único
    },
    address: {
        type: String,
        default: "", // Valor padrão é uma string vazia
    },
    city: {
        type: String,
        default: "", // Valor padrão é uma string vazia
    },
    bairro: {
        type: String,
        default: "", // Valor padrão é uma string vazia
    },
    num: {
        type: String,
        default: "", // Valor padrão é -1
    },
    rua: {
        type: String,
        default: "", // Valor padrão é uma string vazia
    },
    frete: {
        type: Number,
        default: -1, // Valor padrão é -1
    },
    name: {
        type: String,
        default: "", // Valor padrão é uma string vazia
    },
    orders: {
        type: [Object], // Array de objetos (pode ser ajustado conforme necessário)
        default: [],    // Valor padrão é um array vazio
    },
    money: {
        type: String,
        default: '', // Valor padrão é -1
    },
    qrcode: {
        type: String,
        default: "", // Valor padrão é uma string vazia (ou null, se preferir)
    },
    // Campo novo: histórico de conversas com o assistente
    history: [
        {
            role: {
                type: String,
                enum: ["user", "assistant"],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            }
        }
    ],
}, { timestamps: true }); // Adiciona campos createdAt e updatedAt automaticamente

// Função para gerar um modelo com uma coleção personalizada
function createClientModel(collectionName) {
    return mongoose.model(`Client_${collectionName}`, clientSchema, collectionName);
}
module.exports = createClientModel;