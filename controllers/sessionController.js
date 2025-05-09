const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');
const Session = require('../models/sessionModels');
const crypto = require('crypto');
//const nodemailer = require('nodemailer');
require('dotenv').config();

// Função para gerar um token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se o usuário existe
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: 'sessionController: Credenciais inválidas.' });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'sessionController: Credenciais inválidas.' });
    }

    // Gera o token JWT
    const token = generateToken(user._id);

    // Calcula a data de expiração (1 hora a partir de agora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora em milissegundos

    // Registra a sessão no banco de dados
    await Session.create({ userId: user._id, token, expiresAt });

    // Retorna o token ao cliente
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout de usuário
exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    const session = await Session.findOne({ token: token });

    if (!session) {
      return res.status(401).json({ error: 'sessionController: Sessão inválida.' });
    }

    // Remove a sessão do banco de dados
    await Session.deleteOne({ token });

    res.status(200).json({ message: 'sessionController: Logout realizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verificação de Token
exports.checkToken = async (req, res) => {
  try {
    const { userId } = req; // O middleware `authenticateToken` injeta o usuário no request
    
    res.status(200).json({ userId : userId, message: 'sessionController: Token válido.' });
  } catch (error) {
    res.status(401).json({ error: 'sessionController: Token inválido ou expirado.' });
  }
};

// Listagem de Sessões Ativas
exports.listActiveSessions = async (req, res) => {
  try {
    const { userId } = req.params; // Obtém o ID do usuário autenticado
    const user = await User.findById({ userId });
    
    if (!user.role == 'admin') {
      return res.status(401).json({ error: 'sessionController: Credenciais inválidas.' });
    }
    const sessions = await Session.find({ userId, expiresAt: { $gt: Date.now() } });

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/*
// Solicitação de Recuperação de Senha
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Gera um token de recuperação de senha
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Expira em 1 hora
    await user.save();

    // Envia o email com o token
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Recuperação de Senha',
      text: `Você está recebendo este email porque solicitou a recuperação de senha. 
             Para redefinir sua senha, clique no link abaixo:\n\n
             http://${req.headers.host}/reset-password/${resetToken}\n\n
             Este link expira em 1 hora.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email de recuperação enviado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alteração de Senha usando Token de Recuperação
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado.' });
    }

    // Atualiza a senha
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
*/