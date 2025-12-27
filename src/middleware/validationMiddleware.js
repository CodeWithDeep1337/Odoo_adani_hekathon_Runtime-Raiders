/**
 * Validation Middleware
 * Validates request body/params against Joi schemas
 */

const { asyncHandler } = require('./errorHandler');

/**
 * Validate request data
 */
const validateRequest = (schema, dataSource = 'body') => {
  return asyncHandler(async (req, res, next) => {
    const data = req[dataSource];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: { errors: details },
      });
    }

    // Replace data with validated value
    req[dataSource] = value;
    next();
  });
};

/**
 * Validate body
 */
const validateBody = (schema) => validateRequest(schema, 'body');

/**
 * Validate query
 */
const validateQuery = (schema) => validateRequest(schema, 'query');

/**
 * Validate params
 */
const validateParams = (schema) => validateRequest(schema, 'params');

module.exports = {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
};
