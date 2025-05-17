
const Subscription = require('../models/subscriptionModels');
const User = require('../models/userModels');

// Cria uma nova assinatura
exports.createSubscription = async (req, res) => {
    const { userId, plan, endDate, status } = req.body;

    const user = await User.findById(userId).select('name email phone');
    if (!user) {
        return res.status(404).json({ error: 'subscriptionController: Usuário não encontrado, ID invalido.' });
    }

    try {
        const subscription = new Subscription({
            userId,
            plan,
            endDate,
            status
        });

        await subscription.save();
        res.status(201).json({ message: 'subscriptionController: Assinatura criada com sucesso', subscription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * @desc  Salva um QR Code (PNG) na assinatura de um usuário
 * @route POST /api/subscriptions/qr
 */
exports.saveQRCode = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId || !req.file) {
            return res.status(400).json({ error: 'userId e arquivo são obrigatórios.' });
        }

        // Verifica se é PNG ou JPEG
        const allowedMimeTypes = ['image/png', 'image/jpeg'];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ error: 'Apenas arquivos PNG ou JPEG são permitidos.' });
        }

        let subscription = await Subscription.findOne({ userId });

        if (!subscription) {
            subscription = new Subscription({
                userId,
                plan: 'free', // plano padrão
                qrCode: req.file.buffer
            });
        } else {
            subscription.qrCode = req.file.buffer;
        }

        await subscription.save();

        res.status(200).json({ message: 'QR Code salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar QR Code:', error);
        res.status(500).json({ error: 'Erro interno ao salvar QR Code' });
    }
};

/**
 * @desc  Retorna o QR Code salvo como imagem PNG
 * @route GET /api/subscriptions/qr/:userId
 */
exports.getQRCode = async (req, res) => {
    try {
        const { userId } = req.params;

        const subscription = await Subscription.findOne({ userId });

        if (!subscription || !subscription.qrCode) {
            return res.status(404).json({ error: 'QR Code não encontrado' });
        }

        res.setHeader('Content-Type', 'image/png');
        res.send(subscription.qrCode);
    } catch (error) {
        console.error('Erro ao buscar QR Code:', error);
        res.status(500).json({ error: 'Erro interno ao carregar QR Code' });
    }
};