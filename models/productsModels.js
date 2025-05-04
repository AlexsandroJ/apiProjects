const mongoose = require("mongoose");
//const { nanoid } = require('nanoid'); // Biblioteca para gerar IDs curtos e únicos

// Esquema para itens individuais
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Remove espaços em branco no início e no fim
        set: value => value.toLowerCase() // Converte o valor para minúsculas automaticamente
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0 // Garante que o preço não seja negativo
    },
    description: {
        type: String,
        default: '.......',
        trim: true
    },
    available: {
        type: Boolean,
        default: true
    },
    image: {
        type: String, // URL da imagem
        default: '', // Pode ser opcional
        /*validate: {
            validator: function (value) {
                return value === '' || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value);
            },
            message: props => `${props.value} não é uma URL de imagem válida!`
        }*/
    },
    stock: {
        type: Number,
        default: 0,
        min: 0 // Garante que o estoque não seja negativo
    },
    /*
    sku: {
        type: String,
        unique: true,
        trim: true,
        default: () => `SKU-${nanoid(6)}` // Gera um SKU aleatório com 6 caracteres
    },
    */
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Esquema para categorias
const CategorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    items: [ItemSchema] // Corrigido o nome "intens" para "items"
});
// Esquema para bairros
const NeighborhoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Outros campos opcionais relacionados ao bairro, se necessário
});

// Esquema para cidades
const CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Garante que o nome da cidade seja único
        trim: true
    },
    neighborhoods: [NeighborhoodSchema] // Array de bairros associados à cidade
});

// Esquema principal para produtos
const ProductsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referência ao modelo de usuário
        required: true
    },
    products: [CategorySchema], // Lista de categorias com seus respectivos itens
    locations: [CitySchema] // Array de cidades e seus bairros
}, { timestamps: true }); // Adiciona automaticamente os campos `createdAt` e `updatedAt`

// Exportando o modelo
module.exports = mongoose.model("Products", ProductsSchema);