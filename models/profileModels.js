const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String },
    avatarUrl: { type: String },
    location: { type: String },
    age: { type: String }
  });

module.exports = mongoose.model('Profile', profileSchema);