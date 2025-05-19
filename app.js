const express = require("express");
const dotenv = require('dotenv');
const swagger = require('./swagger/swagger');

const cors = require('cors');
const bodyParser = require('body-parser');

// Inicializa o app
const app = express();

// Configura middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Permite todas as origens
}));

// Cria o servidor HTTP após ter o app configurado
const http = require('http').createServer(app);
// Criação do servidor com Socket.IO
const io = require('socket.io')(http, {
  cors: {
    origin: '*', // ajuste conforme necessário
    methods: ['GET', 'POST'],
  },
});
// Importa as rotas depois que o io estiver pronto
const clientRoutes = require('./routes/clientRoutes');
const productsRoutes = require('./routes/productsRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const cityRoutes = require('./routes/cityRoutes');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const ordensRoutes = require('./routes/ordensRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Rotas
app.use('/api', authRoutes);
app.use('/api', ordensRoutes);
app.use('/api', webhookRoutes);

// Testadas
app.use('/api', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', sessionRoutes);
app.use('/api', clientRoutes);
app.use('/api', productsRoutes);
app.use('/api', cityRoutes);
app.use('/api', categoryRoutes);
app.use('/api', itemsRoutes);
app.use('/api', subscriptionRoutes);

// Swagger
swagger(app);

// Agora sim, injeção de dependência do socket.io
const webhookController = require('./controllers/webhookController');
webhookController.setSocketIO(io);

module.exports = { app, http, io };