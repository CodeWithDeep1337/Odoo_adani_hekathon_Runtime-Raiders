/**
 * Request validation middleware
 */

const { REQUEST_TYPES } = require('../config/constants');
const { sanitizeData } = require('../utils/validators');

/**
 * Validate JSON body middleware
 */
const validateJsonBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: 400,
      message: 'Request body is required'
    });
  }
  next();
};

/**
 * Sanitize request body
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }
  next();
};

/**
 * Validate request type (Corrective/Preventive)
 */
const validateRequestType = (req, res, next) => {
  const type = req.body.requestType || req.params.type;
  
  if (type && !Object.values(REQUEST_TYPES).includes(type)) {
    return res.status(400).json({
      status: 400,
      message: `Invalid request type. Must be one of: ${Object.values(REQUEST_TYPES).join(', ')}`
    });
  }
  
  next();
};

/**
 * Validate ID format
 */
const validateIdFormat = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({
        status: 400,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

module.exports = {
  validateJsonBody,
  sanitizeBody,
  validateRequestType,
  validateIdFormat
};
