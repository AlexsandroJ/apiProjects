const Joi = require('joi');

// Esquema para criação/atualização de perfil
const profileSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'O campo "userId" é obrigatório.',
    'string.empty': 'O campo "userId" não pode estar vazio.'
  }),
  bio: Joi.string().optional().allow('').messages({
    'string.base': 'O campo "bio" deve ser uma string.'
  }),
  avatarUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'O campo "avatarUrl" deve ser uma URL válida.'
  }),
  location: Joi.string().optional().allow('').messages({
    'string.base': 'O campo "location" deve ser uma string.'
  })
});

module.exports = {
  profileSchema
};