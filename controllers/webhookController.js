// src/controllers/webhookController.js

let io;
// Injeta a instância do socket.io
exports.setSocketIO = (socketIoInstance) => {
  io = socketIoInstance;
  //console.log('✅ Socket.IO injetado no controller');
};

// Função do webhook
exports.receberWebhook = (req, res) => {
  const evento = req.body;

  console.log('🚨 Webhook recebido:', evento.imageData);

  if (evento.type === 'pagamento_aprovado') {
    console.log('✅ Pagamento foi aprovado!');
  }
  if (io) {
    io.emit('atualizacao', evento);
  }

  return res.status(200).json({ status: 'Webhook recebido com sucesso!' });
};