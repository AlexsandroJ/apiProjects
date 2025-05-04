
const axios = require('axios');
const { connectDB, disconnectDB } = require('./database/db');
const dataTest = require('./util/productsTest');
const app = require('./app');

const PORT = process.env.PORT;
const uri = `${process.env.API_URL}:${process.env.PORT}`;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            addData();
            
        });
    })
    .catch((err) => {
        console.error('Erro ao iniciar o servidor:', err);
    });

async function addData() {
    const response = await axios.post(`${uri}/api/users`, {
        name: 'Alex',
        email: 'alex@example.com',
        password: 'password321'
        //phone: [client.info.wid.user]
    });
    const { userId, email } = response.data;
    const UserId = userId;
    console.log("_id:",userId);
    let category;
    await axios.post(`${uri}/api/products`, { userId: UserId })

    // Iteração sobre os produtos e suas categorias
    for (const element of dataTest.products) {
        category = element.category;
        await axios.post(`${uri}/api/category/${UserId}`, { userId: UserId, category })
        // Iteração sobre os itens dentro de cada categoria
        for (const item of element.item) {
            try {
                // Faz a requisição POST para cada item
                await axios.post(`${uri}/api/items/${UserId}/${category}`
                    , {
                        name: item.type,
                        type: category,
                        price: item.value,
                        description: item.description,
                        available: item.available,
                        image: item.image,
                    });
            } catch (error) {
                // Trata erros, caso ocorram
                console.error(`Erro ao criar item ${item.type}:`, error.message);
            }
        }
    }
    console.log("Produtos de Teste Inseridos");
}