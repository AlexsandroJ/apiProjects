const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

describe('Testes das Rotas de Usuário', () => {
  let userId;
  let token;

  // Insere um usuário no banco de dados antes de cada teste
  beforeEach(async () => {
    // Limpeza
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword
    });

    // Gera um token JWT para o usuário
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    userId = user._id;
  });

  // Teste: Criar um usuário com dados válidos
  it('Deve criar um novo usuário com dados válidos', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'Jane',
        email: 'janes@example.com',
        password: 'password321'
      });

    expect(response.status).toBe(201);
  });

  // Teste: Atualizar um usuário por ID (com autenticação)
  it('Deve atualizar um usuário por ID com autenticação', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`) // Adiciona o token JWT ao cabeçalho
      .send({ name: 'John Updated' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John Updated');
  });

  // Teste: Atualizar um usuário sem autenticação
  it('Deve retornar erro 401 ao tentar atualizar um usuário sem autenticação', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({ name: 'John Updated' }); // Sem token JWT

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Acesso negado. Token não fornecido.');
  });

  // Teste: Excluir um usuário por ID (com autenticação)
  it('Deve excluir um usuário por ID com autenticação', async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`); // Adiciona o token JWT ao cabeçalho

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Usuário excluído com sucesso.');

    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });

  // Teste: Excluir um usuário sem autenticação
  it('Deve retornar erro 401 ao tentar excluir um usuário sem autenticação', async () => {
    const response = await request(app)
      .delete(`/api/users/${userId}`); // Sem token JWT

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Acesso negado. Token não fornecido.');
  });

  // Teste: Criar um usuário com dados inválidos
  it('Deve retornar erro 400 ao tentar criar um usuário com dados inválidos', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: '', // Nome vazio
        email: 'invalid-email', // Email inválido
        password: 'short' // Senha curta
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  // Teste: Criar um usuário com email duplicado
  it('Deve retornar erro 400 ao tentar criar um usuário com email duplicado', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com', // Email já registrado
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email já registrado.');
  });

  // Teste: Criar um usuário com email duplicado
  it('Deve retornar erro 400 ao tentar criar um usuário com email duplicado', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com', // Email já registrado
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email já registrado.');
  });

  // Teste: Atualizar senha de um usuário
  it('Deve atualizar a senha de um usuário com autenticação', async () => {
    const newPassword = 'newPassword456';
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`) // Adiciona o token JWT ao cabeçalho
      .send({ password: newPassword });

    expect(response.status).toBe(200);

    // Verifica se a senha foi atualizada no banco de dados
    const updatedUser = await User.findById(userId);
    const isPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
    expect(isPasswordValid).toBe(true);
  });

  // Teste: Atualizar usuário com dados inválidos
  it('Deve retornar erro 400 ao tentar atualizar um usuário com dados inválidos', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' }); // Nome vazio

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  // Teste: Excluir um usuário inexistente
  it('Deve retornar erro 404 ao tentar excluir um usuário inexistente', async () => {
    const invalidUserId = '64b8f5c5e5d8b5f8e5d8b5f8'; // ID inexistente
    const response = await request(app)
      .delete(`/api/users/${invalidUserId}`)
      .set('Authorization', `Bearer ${token}`); // Adiciona o token JWT ao cabeçalho

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Usuário não encontrado.');
  });
});