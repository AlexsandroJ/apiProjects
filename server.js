
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
    const email = 'alex@example.com';
    const password = 'password321';
    const citys = [
        {
            name: "Recife",
            neighborhoods: [
                { name: "Boa Viagem" },
                { name: "Casa Forte" },
                { name: "Graças" },
                { name: "Santo Amaro" },
            ]
        },
        {
            name: "Jaboatão dos Guararapes",
            neighborhoods: [
                { name: "Cajueiro Seco" },
                { name: "Candeias" },
                { name: "Curado" },
                { name: "Prazeres" },
                { name: "Piedade" },
                { name: "Jordão" },
            ]
        }
    ];
    const response = await axios.post(`${uri}/api/users`, {
        name: 'Alex',
        email: email,
        password: password
        //phone: [client.info.wid.user]
    });
    const { userId } = response.data;
    const UserId = userId;
    console.log("_id:", userId);
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

    const session = await axios.post(`${uri}/api/sessions/login`, {
        email: email,
        password: password
    });

    for (const element of citys) {
        await axios.post(`${uri}/api/cities/${UserId}`, // URL
            { // Dados no corpo da requisição
                name: element.name,
                neighborhoods: element.neighborhoods
            },
            { // Configurações (headers, etc)
                headers: {
                    Authorization: `Bearer ${session.data.token}`
                }
            }).
            then(res => {
                //console.log('Resposta da API:', res.data);
            })
            .catch(err => {
                console.error('Erro na requisição:', err.response?.data || err.message);
            });
    }
    console.log("Produtos de Teste Inseridos");
    //console.log("Token: ", session.data.token);


    const resp = await axios.get(`${uri}/api/cities/${UserId}`, // URL
        { // Configurações (headers, etc)
            headers: {
                Authorization: `Bearer ${session.data.token}`
            }
        }).
        then(res => {
            //console.log('Resposta da API:', res.data.cities);
            
        })
        .catch(err => {
            console.error('Erro na requisição:', err.response?.data || err.message);
        });

        //console.log(resp.data.cities);
    
}