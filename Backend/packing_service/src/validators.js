const Joi = require('joi');

const parkingSchema = Joi.object({
  code: Joi.string().max(50).required().messages({
    'any.required': 'Parking code is required',
    'string.max': 'Parking code must be at most 50 characters',
  }),
  name: Joi.string().max(255).required().messages({
    'any.required': 'Parking name is required',
  }),
  availableSpaces: Joi.number().integer().min(0).required().messages({
    'any.required': 'Number of available spaces is required',
    'number.min': 'Available spaces cannot be negative',
  }),
  location: Joi.string().max(500).required().messages({
    'any.required': 'Location is required',
  }),
  feePerHour: Joi.number().min(0).required().messages({
    'any.required': 'Fee per hour is required',
    'number.min': 'Fee per hour cannot be negative',
  }),
});

const updateParkingSchema = Joi.object({
  code: Joi.string().max(50),
  name: Joi.string().max(255),
  availableSpaces: Joi.number().integer().min(0),
  location: Joi.string().max(500),
  feePerHour: Joi.number().min(0),
}).min(1);

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    next();
  };
};

module.exports = { parkingSchema, updateParkingSchema, validate };
