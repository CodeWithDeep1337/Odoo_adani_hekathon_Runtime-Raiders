// Request stages
const MAINTENANCE_STAGES = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  REPAIRED: 'Repaired',
  SCRAP: 'Scrap'
};

// Request types
const REQUEST_TYPES = {
  CORRECTIVE: 'Corrective',
  PREVENTIVE: 'Preventive'
};

// Equipment categories
const EQUIPMENT_CATEGORIES = {
  MACHINERY: 'Machinery',
  ELECTRICAL: 'Electrical',
  PNEUMATIC: 'Pneumatic',
  HYDRAULIC: 'Hydraulic',
  TOOLS: 'Tools',
  SAFETY: 'Safety Equipment',
  OTHER: 'Other'
};

// HTTP Status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  UNPROCESSABLE_ENTITY: 422
};

module.exports = {
  MAINTENANCE_STAGES,
  REQUEST_TYPES,
  EQUIPMENT_CATEGORIES,
  HTTP_STATUS
};
