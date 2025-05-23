const axios = require('axios');
const { connectDB, disconnectDB } = require('./database/db');
const dataTest = require('./util/productsTest');
const { app, http, io } = require('./app'); // app e http já têm o io injetado

const PORT = process.env.PORT || 3001;
const uri = `${process.env.API_URL}`;



// 💡 Aqui vai o seu código de conexão do socket
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado: ',socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });

  // Você pode escutar eventos personalizados aqui também
  socket.on('atualizacao', (data) => {
    console.log('📩 Mensagem do cliente:', data.type);
    io.emit('atualizacao', data);
  });
});

connectDB()
  .then(() => {
    http.listen(PORT, () => {
      console.log(`🟢 Servidor rodando na porta ${PORT}`);
      addData();
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao iniciar o servidor:', err);
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
    let response;
    let token;
    let userId;

    await axios.post(`${uri}/api/users`,
        {
            name: 'Alexsandro Jose da Silva',
            email: email,
            password: password,
            phone: ["81984182588", "81999999999"],
        }).
        then(res => {
            response = res;
            userId = res.data.userId
            //console.log('Resposta /users:', res.data);
        })
        .catch(err => {
            console.error('Erro na requisição users:', err.response?.data || err.message);
        });

    await axios.post(`${uri}/api/sessions/login`,
        {
            email: email,
            password: password
        }).
        then(res => {
            token = res.data.token;
            //console.log('Resposta /sessions/login:', res.data);
        })
        .catch(err => {
            console.error('Erro na requisição sessions:', err.response?.data || err.message);
        });

    await axios.post(`${uri}/api/profiles`,
        {
            userId: userId,
            bio: 'Desenvolvedor Fullstack',
            avatarUrl: 'https://static.vecteezy.com/system/resources/previews/019/900/322/non_2x/happy-young-cute-illustration-face-profile-png.png',
            location: 'Recife',
            age: '25'
        },
        { // Configurações (headers, etc)
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).
        then(res => {
            //console.log('Resposta /profiles:', res.data);
        })
        .catch(err => {
            console.error('Erro na requisição profile:', err.response?.data || err.message);
        });

    await axios.post(`${uri}/api/subscriptions`,
        {
            userId: userId,
            plan: 'basic',
            endDate: new Date(Date.now() + 86400000).toISOString(),
            status: 'active'
        },
        { // Configurações (headers, etc)
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).
        then(res => {
            //console.log('Resposta /profiles:', res.data);
        })
        .catch(err => {
            console.error('Erro na requisição subscriptions:', err.response?.data || err.message);
        });

    let category;
    await axios.post(`${uri}/api/products`, { userId })

    // Iteração sobre os produtos e suas categorias
    for (const element of dataTest.products) {
        category = element.category;
        await axios.post(`${uri}/api/category/${userId}`, { userId, category })
        // Iteração sobre os itens dentro de cada categoria
        for (const item of element.item) {
            try {
                // Faz a requisição POST para cada item
                await axios.post(`${uri}/api/items/${userId}/${category}`
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

    for (const element of citys) {
        await axios.post(`${uri}/api/cities/${userId}`, // URL
            { // Dados no corpo da requisição
                name: element.name,
                neighborhoods: element.neighborhoods
            },
            { // Configurações (headers, etc)
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).
            then(res => {
                //console.log('Resposta da API:', res.data);
            })
            .catch(err => {
                console.error('Erro na requisição:', err.response?.data || err.message);
            });
    }
    console.log(`📊​ Dados de teste Inseridos`);
    console.log(`🆔 ID:`,userId);
}