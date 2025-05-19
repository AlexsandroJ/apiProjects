const { receberWebhook } = require('../../controllers/webhookController');

describe('Webhook Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('deve retornar 200 e mensagem de sucesso', () => {
    req.body = { type: 'pagamento_aprovado', valor: 150.00 };

    // Mock do console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    receberWebhook(req, res);

    expect(consoleSpy).toHaveBeenCalledWith('🚨 Webhook recebido:', req.body);
    expect(consoleSpy).toHaveBeenCalledWith('✅ Pagamento foi aprovado!');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'Webhook recebido com sucesso!' });

    consoleSpy.mockRestore();
  });

  test('não deve executar ação específica se tipo não for reconhecido', () => {
    req.body = { type: 'evento_desconhecido' };

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    receberWebhook(req, res);

    expect(consoleSpy).toHaveBeenCalledWith('🚨 Webhook recebido:', req.body);
    expect(consoleSpy).not.toHaveBeenCalledWith('✅ Pagamento foi aprovado!');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'Webhook recebido com sucesso!' });

    consoleSpy.mockRestore();
  });
});