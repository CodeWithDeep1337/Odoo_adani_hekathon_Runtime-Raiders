/**
 * Validation Schemas
 * Joi schemas for request validation
 */

const Joi = require('joi');

// Common schemas
const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Must be a valid email',
  'any.required': 'Email is required',
});

const passwordSchema = Joi.string()
  .min(6)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  });

const strongPasswordSchema = Joi.string()
  .min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  });

// Authentication Schemas
const signUpSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: emailSchema,
  password: passwordSchema,
  role: Joi.string()
    .valid('ADMIN', 'MANAGER', 'TECHNICIAN', 'USER')
    .default('USER')
    .messages({
      'any.only': 'Role must be ADMIN, MANAGER, TECHNICIAN, or USER',
    }),
});

const signInSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const otpVerificationSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.pattern.base': 'OTP must be 6 digits',
    'string.length': 'OTP must be exactly 6 characters',
    'any.required': 'OTP is required',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

const resetPasswordSchema = Joi.object({
  email: emailSchema,
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: strongPasswordSchema,
});

// Equipment Schemas
const equipmentSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Equipment name cannot be empty',
    'any.required': 'Equipment name is required',
  }),
  serialNumber: Joi.string().required().messages({
    'string.empty': 'Serial number cannot be empty',
    'any.required': 'Serial number is required',
  }),
  department: Joi.string().max(100).required().messages({
    'any.required': 'Department is required',
  }),
  assignedEmployee: Joi.string().max(100).allow(null, ''),
  maintenanceTeam: Joi.string().allow(null, ''),
  purchaseDate: Joi.date().required().messages({
    'any.required': 'Purchase date is required',
  }),
  warrantyEndDate: Joi.date().required().messages({
    'any.required': 'Warranty end date is required',
  }),
  location: Joi.string().max(200).required().messages({
    'any.required': 'Location is required',
  }),
});

const equipmentUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  serialNumber: Joi.string(),
  department: Joi.string().max(100),
  assignedEmployee: Joi.string().max(100).allow(null, ''),
  maintenanceTeam: Joi.string().allow(null, ''),
  purchaseDate: Joi.date(),
  warrantyEndDate: Joi.date(),
  location: Joi.string().max(200),
  isScrapped: Joi.boolean(),
});

// Maintenance Team Schemas
const teamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Team name cannot be empty',
    'any.required': 'Team name is required',
  }),
  lead: Joi.string().max(100).required().messages({
    'any.required': 'Team lead is required',
  }),
  members: Joi.array().items(Joi.string()),
});

const teamUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  lead: Joi.string().max(100),
  members: Joi.array().items(Joi.string()),
});

// Maintenance Request Schemas
const maintenanceRequestSchema = Joi.object({
  subject: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Subject cannot be empty',
    'string.min': 'Subject must be at least 5 characters',
    'any.required': 'Subject is required',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters',
    'any.required': 'Description is required',
  }),
  type: Joi.string()
    .valid('CORRECTIVE', 'PREVENTIVE')
    .required()
    .messages({
      'any.only': 'Type must be CORRECTIVE or PREVENTIVE',
      'any.required': 'Type is required',
    }),
  priority: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    .default('MEDIUM'),
  equipmentId: Joi.string().required().messages({
    'any.required': 'Equipment ID is required',
  }),
  teamId: Joi.string().allow(null, ''),
  scheduledDate: Joi.date().min('now').allow(null),
  notes: Joi.string().max(1000).allow(null, ''),
});

const maintenanceRequestUpdateSchema = Joi.object({
  subject: Joi.string().min(5).max(200),
  description: Joi.string().min(10).max(1000),
  type: Joi.string().valid('CORRECTIVE', 'PREVENTIVE'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
  equipmentId: Joi.string(),
  teamId: Joi.string().allow(null, ''),
  scheduledDate: Joi.date().min('now').allow(null),
  notes: Joi.string().max(1000).allow(null, ''),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP')
    .required()
    .messages({
      'any.only': 'Status must be NEW, IN_PROGRESS, REPAIRED, or SCRAP',
      'any.required': 'Status is required',
    }),
});

// Calendar Schemas
const calendarSchema = Joi.object({
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().min(2020).required(),
});

module.exports = {
  // Auth
  signUpSchema,
  signInSchema,
  otpVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // Equipment
  equipmentSchema,
  equipmentUpdateSchema,

  // Team
  teamSchema,
  teamUpdateSchema,

  // Maintenance Request
  maintenanceRequestSchema,
  maintenanceRequestUpdateSchema,
  statusUpdateSchema,

  // Calendar
  calendarSchema,
};
