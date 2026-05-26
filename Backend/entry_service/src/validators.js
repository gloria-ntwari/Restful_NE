const Joi = require('joi');

const entrySchema = Joi.object({
  plateNumber: Joi.string().max(20).required().messages({
    'any.required': 'Plate number is required',
  }),
  parkingId: Joi.string().uuid().required().messages({
    'any.required': 'Parking ID is required',
    'string.guid': 'Parking ID must be a valid UUID',
  }),
});

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

module.exports = { entrySchema, validate };
