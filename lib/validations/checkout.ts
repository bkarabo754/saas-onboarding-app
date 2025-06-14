import { z } from 'zod';

// Card number validation (Luhn algorithm)
const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, '').split('').map(Number);
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Expiry date validation
const validateExpiryDate = (expiryDate: string): boolean => {
  const [month, year] = expiryDate.split('/').map(Number);
  if (!month || !year) return false;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1;

  // Check if month is valid
  if (month < 1 || month > 12) return false;

  // Check if date is not in the past
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

// CVV validation based on card type
const validateCVV = (cvv: string, cardNumber: string): boolean => {
  const cleanCardNumber = cardNumber.replace(/\s/g, '');

  // American Express cards have 4-digit CVV
  if (cleanCardNumber.startsWith('34') || cleanCardNumber.startsWith('37')) {
    return /^\d{4}$/.test(cvv);
  }

  // Most other cards have 3-digit CVV
  return /^\d{3}$/.test(cvv);
};

export const checkoutFormSchema = z
  .object({
    // Personal Information
    cardholderName: z
      .string()
      .min(2, 'Cardholder name must be at least 2 characters')
      .max(50, 'Cardholder name must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Cardholder name can only contain letters, spaces, hyphens, and apostrophes'
      )
      .refine(
        (name) => name.trim().split(' ').length >= 2,
        'Please enter your full name (first and last name)'
      ),

    email: z
      .string()
      .email('Please enter a valid email address')
      .min(5, 'Email must be at least 5 characters')
      .max(100, 'Email must be less than 100 characters')
      .toLowerCase(),

    // Payment Information
    cardNumber: z
      .string()
      .min(1, 'Card number is required')
      .refine((cardNumber) => {
        const cleaned = cardNumber.replace(/\s/g, '');
        return /^\d{13,19}$/.test(cleaned);
      }, 'Card number must be 13-19 digits')
      .refine((cardNumber) => {
        const cleaned = cardNumber.replace(/\s/g, '');
        return validateCardNumber(cleaned);
      }, 'Please enter a valid card number'),

    expiryDate: z
      .string()
      .min(1, 'Expiry date is required')
      .regex(/^\d{2}\/\d{2}$/, 'Expiry date must be in MM/YY format')
      .refine(
        (expiryDate) => validateExpiryDate(expiryDate),
        'Card has expired or invalid date'
      ),

    cvv: z
      .string()
      .min(1, 'CVV is required')
      .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),

    // Billing Address
    billingAddress: z
      .string()
      .min(5, 'Billing address must be at least 5 characters')
      .max(100, 'Billing address must be less than 100 characters')
      .optional()
      .or(z.literal('')),

    city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be less than 50 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'City can only contain letters, spaces, hyphens, and apostrophes'
      )
      .optional()
      .or(z.literal('')),

    state: z
      .string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State must be less than 50 characters')
      .optional()
      .or(z.literal('')),

    zipCode: z
      .string()
      .min(4, 'ZIP code must be at least 4 characters')
      .max(10, 'ZIP code must be less than 10 characters')
      .regex(/^[0-9A-Za-z\s-]+$/, 'Invalid ZIP code format')
      .optional()
      .or(z.literal('')),

    country: z
      .string()
      .min(2, 'Please select a country')
      .max(2, 'Invalid country code'),
  })
  .refine(
    (data) => {
      // Cross-field validation for CVV based on card number
      return validateCVV(data.cvv, data.cardNumber);
    },
    {
      message: 'Invalid CVV for this card type',
      path: ['cvv'],
    }
  );

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Helper functions for formatting
export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

export const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\D/g, '');
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  return v;
};

export const formatCVV = (value: string): string => {
  return value.replace(/\D/g, '').substring(0, 4);
};

export const getCardType = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  //   if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6/.test(cleaned)) return 'Discover';

  return 'Unknown';
};
