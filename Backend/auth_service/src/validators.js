const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must be at most 100 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name must be at most 100 characters',
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must be at most 128 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('admin', 'parking_attendant').default('parking_attendant'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('admin', 'parking_attendant'),
  password: Joi.string().min(6).max(128),
}).min(1);

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    next();
  };
};

module.exports = { registerSchema, loginSchema, updateUserSchema, validate };
