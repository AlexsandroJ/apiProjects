const Products = require("../models/productsModels");

// 1. Criar uma nova cidade (com ou sem bairros)
exports.createCity = async (req, res) => {
    try {
        const { userId } = req.params;

        const { name, neighborhoods } = req.body;

        // Verifica se o usuário existe
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Verifica se a cidade já existe
        const cityExists = product.locations.find(city => city.name.toLowerCase() === name.toLowerCase());
        if (cityExists) {
            return res.status(400).json({ message: "Cidade já existe." });
        }

        // Adiciona a nova cidade
        product.locations.push({ name, neighborhoods });
        await product.save();

        res.status(201).json({ message: "Cidade criada com sucesso.", city: { name, neighborhoods } });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar cidade.", error });
    }
};

// 2. Listar todas as cidades (e seus bairros)
exports.getAllCities = async (req, res) => {
    try {
        const { userId } = req.params;

        // Busca o usuário e suas cidades
        const product = await Products.findOne({  userId: userId }).select('locations');
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        res.status(200).json({ cities: product.locations });
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar cidades.", error });
    }
};

// 3. Buscar uma cidade específica pelo nome
exports.getCityByName = async (req, res) => {
    try {
        const { userId, cityName } = req.params;

        // Busca o usuário e sua cidade específica
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const city = product.locations.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (!city) {
            return res.status(404).json({ message: "Cidade não encontrada." });
        }

        res.status(200).json({ city });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar cidade.", error });
    }
};

// 4. Atualizar uma cidade (nome ou lista de bairros)
exports.updateCity = async (req, res) => {
    try {
        const { userId, cityName } = req.params;
        const { newName, neighborhoods } = req.body;

        // Busca o usuário
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Encontra a cidade específica
        const city = product.locations.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (!city) {
            return res.status(404).json({ message: "Cidade não encontrada." });
        }

        // Atualiza o nome da cidade, se fornecido
        if (newName) city.name = newName;

        // Atualiza os bairros, se fornecidos
        if (neighborhoods) city.neighborhoods = neighborhoods;

        await product.save();

        res.status(200).json({ message: "Cidade atualizada com sucesso.", city });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar cidade.", error });
    }
};

// 5. Excluir uma cidade
exports.deleteCity = async (req, res) => {
    try {
        const { userId, cityName } = req.params;

        // Busca o usuário
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Remove a cidade específica
        const cityIndex = product.locations.findIndex(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (cityIndex === -1) {
            return res.status(404).json({ message: "Cidade não encontrada." });
        }

        product.locations.splice(cityIndex, 1);
        await product.save();

        res.status(200).json({ message: "Cidade excluída com sucesso." });
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir cidade.", error });
    }
};

// 6. Adicionar um bairro a uma cidade existente
exports.addNeighborhood = async (req, res) => {
    try {
        const { userId, cityName } = req.params;
        const { neighborhoodName } = req.body;

        // Busca o usuário
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Encontra a cidade específica
        const city = product.locations.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (!city) {
            return res.status(404).json({ message: "Cidade não encontrada." });
        }

        // Verifica se o bairro já existe
        const neighborhoodExists = city.neighborhoods.find(nb => nb.name.toLowerCase() === neighborhoodName.toLowerCase());
        if (neighborhoodExists) {
            return res.status(400).json({ message: "Bairro já existe nesta cidade." });
        }

        // Adiciona o novo bairro
        city.neighborhoods.push({ name: neighborhoodName });
        await product.save();

        res.status(201).json({ message: "Bairro adicionado com sucesso.", city });
    } catch (error) {
        res.status(500).json({ message: "Erro ao adicionar bairro.", error });
    }
};

// 7. Remover um bairro de uma cidade existente
exports.removeNeighborhood = async (req, res) => {
    try {
        const { userId, cityName, neighborhoodName } = req.params;

        // Busca o usuário
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Encontra a cidade específica
        const city = product.locations.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (!city) {
            return res.status(404).json({ message: "Cidade não encontrada." });
        }

        // Remove o bairro específico
        const neighborhoodIndex = city.neighborhoods.findIndex(nb => nb.name.toLowerCase() === neighborhoodName.toLowerCase());
        if (neighborhoodIndex === -1) {
            return res.status(404).json({ message: "Bairro não encontrado." });
        }

        city.neighborhoods.splice(neighborhoodIndex, 1);
        await product.save();

        res.status(200).json({ message: "Bairro removido com sucesso.", city });
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover bairro.", error });
    }
};

// 8. Editar um bairro específico em uma cidade
exports.updateNeighborhood = async (req, res) => {
    try {
        const { userId, cityName, neighborhoodName } = req.params;
        const { newNeighborhoodName } = req.body;

        // Busca o usuário
        const product = await Products.findOne({  userId: userId });
        if (!product) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Encontra a cidade específica
        const city = product.locations.find(city => city.name.toLowerCase() === cityName.toLowerCase());
        if (!city) {
            return res.status(404).json({ message: "Cidade não encontrada." });
        }

        // Encontra o bairro específico
        const neighborhood = city.neighborhoods.find(nb => nb.name.toLowerCase() === neighborhoodName.toLowerCase());
        if (!neighborhood) {
            return res.status(404).json({ message: "Bairro não encontrado." });
        }

        // Atualiza o nome do bairro
        neighborhood.name = newNeighborhoodName;

        await product.save();

        res.status(200).json({ message: "Bairro atualizado com sucesso.", city });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar bairro.", error });
    }
};