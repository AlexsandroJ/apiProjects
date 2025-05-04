const Joi = require('joi');
require('dotenv').config();
 let min = parseInt(process.env.MIN_SIZE_PASSWORD);

// Esquema para criação de usuário
const createUserSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'O campo "name" é obrigatório.',
    'string.empty': 'O campo "name" não pode estar vazio.'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'O campo "email" é obrigatório.',
    'string.email': 'O campo "email" deve ser um email válido.'
  }),
  password: Joi.string().min(min).required().messages({
    'any.required': 'O campo "password" é obrigatório.',
    'string.min': `A senha deve ter no mínimo ${min} caracteres.`
  })
});

// Esquema para atualização de usuário
const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(min).optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};