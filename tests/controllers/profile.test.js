const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModels');
const Profile = require('../../models/profileModels');

describe('Testes das Rotas de Perfil', () => {
  let userId;

  // Setup inicial: cria um usuário antes dos testes
  beforeAll(async () => {
    await Profile.deleteMany({});
    const user = await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
    userId = user._id;
  });

  // =============================
  // 📝 Cadastro ou Atualização de Perfil
  // =============================
  describe('POST /api/profiles', () => {
    it('Deve criar ou atualizar um perfil com sucesso', async () => {
      const response = await request(app)
        .post('/api/profiles')
        .send({
          userId,
          bio: 'Desenvolvedor Fullstack',
          location: 'São Paulo'
        });

      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Desenvolvedor Fullstack');
      expect(response.body.location).toBe('São Paulo');
    });
  });

  // =============================
  // 🔍 Busca de Perfil
  // =============================
  describe('GET /api/profiles/:userId', () => {
    it('Deve obter um perfil por ID do usuário', async () => {
      const response = await request(app).get(`/api/profiles/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.bio).toBe('Desenvolvedor Fullstack');
      expect(response.body.location).toBe('São Paulo');
    });
  });

  // =============================
  // 🗑️ Exclusão de Perfil
  // =============================
  describe('DELETE /api/profiles/:userId', () => {
    it('Deve excluir um perfil por ID do usuário', async () => {
      const response = await request(app).delete(`/api/profiles/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Perfil excluído com sucesso.');

      const deletedProfile = await Profile.findOne({ userId });
      expect(deletedProfile).toBeNull();
    });
  });
});