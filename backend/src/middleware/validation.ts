import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  console.log('=== VALIDATION CHECK ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('=== VALIDATION ERRORS ===');
    console.log('Number of errors:', errors.array().length);
    errors.array().forEach((error, index) => {
      console.log(`Error ${index + 1}:`, {
        field: (error as any).path || (error as any).param,
        message: error.msg,
        value: (error as any).value,
        location: (error as any).location
      });
    });
    console.log('========================');
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  console.log('Validation passed');
  next();
};

// User registration validation
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Disaster report validation
export const validateReport = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters'),
  body('disasterType')
    .isIn(['Flood', 'Cyclone', 'Tsunami', 'Oil Spill', 'Coastal Erosion', 'High Waves', 'Storm Surge', 'Water Pollution', 'Marine Debris', 'Other'])
    .withMessage('Invalid disaster type'),
  body('severity')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid severity level'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  // Also validate coordinates as separate fields for FormData
  body('coordinates[latitude]')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('coordinates[longitude]')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  // Custom validation for India boundaries
  body().custom((value, { req }) => {
    const lat = value.coordinates?.latitude || value['coordinates[latitude]'];
    const lng = value.coordinates?.longitude || value['coordinates[longitude]'];
    
    if (lat && lng) {
      // India's approximate boundaries: 6-37 N, 68-97 E
      if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
        throw new Error('Coordinates must be within India boundaries (6-37°N, 68-97°E)');
      }
    }
    return true;
  }),
  handleValidationErrors
];

// Comment validation
export const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  handleValidationErrors
];
