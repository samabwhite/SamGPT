import Joi from 'joi';

const username = Joi.string().alphanum().min(3).max(30).required();

const email = Joi.string().email().required();

const password = Joi.string()
  .min(6)
  .max(16)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must be at most 16 characters long'
  });

export const register = Joi.object().keys({
    username,
    email,
    password
});

export const signIn = Joi.object().keys({
    email,
    password
});