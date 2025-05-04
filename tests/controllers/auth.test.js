// tests/unit/authController.test.js
const axios = require('axios');
const { redirectToGoogle, handleGoogleCallback } = require('../../controllers/authController');
const qs = require('querystring');

// Mock do axios
jest.mock('axios');

describe('authController', () => {
  describe('redirectToGoogle', () => {
    let req, res;

    beforeEach(() => {
      // Mock dos objetos req e res
      req = {};
      res = {
        redirect: jest.fn(),
      };

      // Configuração das variáveis de ambiente
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.REDIRECT_URI = 'http://localhost:3000/callback';
    });

    it('deve redirecionar para a URL de autenticação do Google', () => {
      redirectToGoogle(req, res);

      const expectedUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=test-client-id&` +
        `redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}`;

      expect(res.redirect).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('handleGoogleCallback', () => {
    let req, res;

    beforeEach(() => {
      // Configuração das variáveis de ambiente
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      process.env.REDIRECT_URI = 'http://localhost:3000/callback';
    });

    describe('Erro: Código de autorização ausente', () => {
      beforeEach(() => {
        req = { query: {} };
        res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        };
      });

      it('deve retornar erro 400 quando o código de autorização está ausente', async () => {
        await handleGoogleCallback(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Erro: Código de autorização ausente.');
      });
    });

    describe('Troca de código por token de acesso', () => {
      beforeEach(() => {
        req = { query: { code: 'authorization-code' } };
        res = {
          send: jest.fn(),
        };

        // Mock do axios.post
        axios.post.mockResolvedValue({
          data: {
            access_token: 'mock-access-token',
          },
        });

        // Mock do axios.get
        axios.get.mockResolvedValue({
          data: {
            name: 'Test User',
            email: 'test@example.com',
          },
        });
      });

      it('deve retornar informações do usuário após trocar o código por token', async () => {
        await handleGoogleCallback(req, res);

        expect(axios.post).toHaveBeenCalledWith(
          'https://oauth2.googleapis.com/token',
          qs.stringify({
            code: 'authorization-code',
            client_id: 'test-client-id',
            client_secret: 'test-client-secret',
            redirect_uri: 'http://localhost:3000/callback',
            grant_type: 'authorization_code',
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );

        expect(axios.get).toHaveBeenCalledWith('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: 'Bearer mock-access-token' },
        });

        expect(res.send).toHaveBeenCalledWith('Olá, Test User! Seu email é test@example.com.');
      });
    });

    describe('Erro na troca de código ou busca de dados', () => {
      beforeEach(() => {
        req = { query: { code: 'authorization-code' } };
        res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        };

        // Mock do axios.post para lançar um erro
        axios.post.mockRejectedValue(new Error('Erro simulado'));
      });

      it('deve retornar erro 500 em caso de falha na troca de código', async () => {
        await handleGoogleCallback(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Erro ao processar o login.');
      });
    });
  });
});