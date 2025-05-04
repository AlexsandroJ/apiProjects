const express = require("express");
const dotenv = require('dotenv');
const swagger = require('./swagger/swagger');
// Importa as rotas
const clientRoutes = require('./routes/clientRoutes');
const productsRoutes = require('./routes/productsRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemsRoutes = require('./routes/itemsRoutes');
const cityRoutes = require('./routes/cityRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*', // Permite todas as origens
  }));
// Rotas
app.use('/api', authRoutes);

// Testadas
app.use('/api', userRoutes);
app.use('/api', profileRoutes);
app.use('/api', sessionRoutes);
app.use('/api', clientRoutes);
app.use('/api', productsRoutes);
app.use('/api', cityRoutes);
app.use('/api', categoryRoutes);
app.use('/api', itemsRoutes);

swagger(app);

module.exports = app;