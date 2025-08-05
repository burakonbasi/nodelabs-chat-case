import { REGEX_PATTERNS, MESSAGE_MAX_LENGTH, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Basic validators
export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return value.trim().length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return pattern.test(value);
    },
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return REGEX_PATTERNS.EMAIL.test(value);
    },
    message,
  }),

  phone: (message = 'Please enter a valid phone number'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return REGEX_PATTERNS.PHONE.test(value);
    },
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'string') return false;
      return REGEX_PATTERNS.URL.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'number') return false;
      return value >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'number') return false;
      return value <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  between: (min: number, max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (typeof value !== 'number') return false;
      return value >= min && value <= max;
    },
    message: message || `Must be between ${min} and ${max}`,
  }),

  oneOf: <T>(options: T[], message?: string): ValidationRule => ({
    validate: (value) => options.includes(value),
    message: message || `Must be one of: ${options.join(', ')}`,
  }),

  custom: (validate: (value: any) => boolean, message: string): ValidationRule => ({
    validate,
    message,
  }),
};

// Composite validators for specific use cases
export const authValidators = {
  username: [
    validators.required('Username is required'),
    validators.minLength(3, 'Username must be at least 3 characters'),
    validators.maxLength(20, 'Username must be no more than 20 characters'),
    validators.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  ],

  email: [
    validators.required('Email is required'),
    validators.email(),
  ],

  password: [
    validators.required('Password is required'),
    validators.minLength(8, 'Password must be at least 8 characters'),
    validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  ],

  confirmPassword: (password: string) => [
    validators.required('Please confirm your password'),
    validators.custom(
      (value) => value === password,
      'Passwords do not match'
    ),
  ],
};

export const profileValidators = {
  fullName: [
    validators.maxLength(50, 'Name must be no more than 50 characters'),
    validators.pattern(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  ],

  bio: [
    validators.maxLength(150, 'Bio must be no more than 150 characters'),
  ],

  phone: [
    validators.phone(),
  ],

  website: [
    validators.url(),
  ],
};

export const messageValidators = {
  content: [
    validators.required('Message cannot be empty'),
    validators.maxLength(MESSAGE_MAX_LENGTH),
  ],

  groupName: [
    validators.required('Group name is required'),
    validators.minLength(3, 'Group name must be at least 3 characters'),
    validators.maxLength(50, 'Group name must be no more than 50 characters'),
  ],

  groupDescription: [
    validators.maxLength(200, 'Description must be no more than 200 characters'),
  ],
};

// File validation
export const fileValidators = {
  size: (type: keyof typeof MAX_FILE_SIZE): ValidationRule => ({
    validate: (file: File) => file.size <= MAX_FILE_SIZE[type],
    message: `File size must not exceed ${MAX_FILE_SIZE[type] / (1024 * 1024)}MB`,
  }),

  type: (type: keyof typeof ALLOWED_FILE_TYPES): ValidationRule => ({
    validate: (file: File) => ALLOWED_FILE_TYPES[type].includes(file.type),
    message: `File type not supported. Allowed types: ${ALLOWED_FILE_TYPES[type].join(', ')}`,
  }),

  image: (file: File): ValidationResult => {
    return validate(file, [
      fileValidators.size('IMAGE'),
      fileValidators.type('IMAGE'),
    ]);
  },

  video: (file: File): ValidationResult => {
    return validate(file, [
      fileValidators.size('VIDEO'),
      fileValidators.type('VIDEO'),
    ]);
  },

  audio: (file: File): ValidationResult => {
    return validate(file, [
      fileValidators.size('AUDIO'),
      fileValidators.type('AUDIO'),
    ]);
  },

  document: (file: File): ValidationResult => {
    return validate(file, [
      fileValidators.size('DOCUMENT'),
      fileValidators.type('DOCUMENT'),
    ]);
  },
};

// Validation runner
export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Form validation helper
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, ValidationRule[]>>
): Record<keyof T, string[]> {
  const errors: Record<string, string[]> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    if (fieldRules) {
      const result = validate(values[field], fieldRules);
      if (!result.isValid) {
        errors[field] = result.errors;
      }
    }
  }

  return errors as Record<keyof T, string[]>;
}

// Async validators
export const asyncValidators = {
  uniqueUsername: async (username: string): Promise<ValidationResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This would be replaced with actual API call
    const taken = ['admin', 'user', 'test'].includes(username.toLowerCase());
    
    return {
      isValid: !taken,
      errors: taken ? ['Username is already taken'] : [],
    };
  },

  uniqueEmail: async (email: string): Promise<ValidationResult> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This would be replaced with actual API call
    const taken = email === 'taken@example.com';
    
    return {
      isValid: !taken,
      errors: taken ? ['Email is already registered'] : [],
    };
  },
};

// Password strength calculator
export function calculatePasswordStrength(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length < 8) suggestions.push('Use at least 8 characters');

  // Character types
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Suggestions
  if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) suggestions.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Add special characters');

  // Common patterns (negative score)
  if (/^[a-zA-Z]+$/.test(password)) score -= 1;
  if (/^[0-9]+$/.test(password)) score -= 1;
  if (/(.)\1{2,}/.test(password)) score -= 1;

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'fair';
  else if (score <= 5) strength = 'good';
  else strength = 'strong';

  return { score: Math.max(0, score), strength, suggestions };
}

// Export all validators
export default {
  ...validators,
  auth: authValidators,
  profile: profileValidators,
  message: messageValidators,
  file: fileValidators,
  async: asyncValidators,
  validate,
  validateForm,
  calculatePasswordStrength,
};