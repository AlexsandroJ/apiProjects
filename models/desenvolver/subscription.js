const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'expired', 'canceled'], default: 'active' }
  });

module.exports = mongoose.model('Subscription', subscriptionSchema);