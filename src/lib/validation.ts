import * as yup from 'yup';

// Customer validation schema
export const customerSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  prePopulated: yup.boolean().required(),
  
  companyAddress: yup.object({
    line1: yup
      .string()
      .required('Address line 1 is required')
      .min(5, 'Address must be at least 5 characters')
      .max(100, 'Address line 1 cannot exceed 100 characters'),
    
    line2: yup
      .string()
      .max(100, 'Address line 2 cannot exceed 100 characters')
      .optional(),
    
    city: yup
      .string()
      .required('City is required')
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City cannot exceed 50 characters'),
    
    state: yup
      .string()
      .required('State is required')
      .length(2, 'State must be 2 characters'),
    
    zip: yup
      .string()
      .required('ZIP code is required')
      .matches(/^\\d{5}(-\\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
  }).when('prePopulated', {
    is: true,
    then: (schema) => schema.required('Address is required when pre-populated is checked'),
    otherwise: (schema) => schema.optional()
  })
});

// Product and plan validation schema
export const productPlanSchema = yup.object({
  product: yup
    .object({
      id: yup.string().required(),
      name: yup.string().required(),
      description: yup.string().optional(),
      plans: yup.array().required()
    })
    .required('Please select a product'),
  
  selectedPlan: yup
    .object({
      id: yup.string().required(),
      name: yup.string().required(),
      price: yup
        .number()
        .required('Price is required')
        .min(0, 'Price must be 0 or greater')
        .max(99999.99, 'Price cannot exceed $99,999.99')
    })
    .required('Please select a plan'),
  
  customPrice: yup
    .number()
    .optional()
    .min(0, 'Price must be 0 or greater')
    .max(99999.99, 'Price cannot exceed $99,999.99')
});

// Contract validation schema
export const contractSchema = yup.object({
  startDate: yup
    .date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  
  durationMonths: yup
    .number()
    .required('Duration is required')
    .min(1, 'Duration must be at least 1 month')
    .max(60, 'Duration cannot exceed 60 months')
    .integer('Duration must be a whole number'),
  
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date')
});

// Add-on validation schema
export const addOnSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  description: yup.string().required(),
  price: yup
    .number()
    .required()
    .min(0, 'Price must be 0 or greater'),
  quantity: yup
    .number()
    .required()
    .min(0, 'Quantity must be 0 or greater')
    .integer('Quantity must be a whole number'),
  included: yup.boolean().required()
});

// Complete order validation schema
export const orderSchema = yup.object({
  customer: customerSchema.required('Customer information is required'),
  product: yup.object().required('Product selection is required'),
  selectedPlan: yup.object().required('Plan selection is required'),
  contract: contractSchema.required('Contract details are required'),
  addOns: yup.array().of(addOnSchema).required(),
  total: yup.number().min(0).required()
});

// Step-specific validation schemas
export const step1Schema = yup.object({
  customer: customerSchema
});

export const step2Schema = yup.object({
  product: productPlanSchema.fields.product,
  selectedPlan: productPlanSchema.fields.selectedPlan
});

export const step3Schema = yup.object({
  contract: contractSchema
});

export const step4Schema = yup.object({
  addOns: yup.array().of(addOnSchema)
});

// Validation helper functions
export const validateStep = async (step: number, data: unknown) => {
  const schemas = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema
  };
  
  const schema = schemas[step as keyof typeof schemas];
  if (!schema) throw new Error(`Invalid step: ${step}`);
  
  try {
    await schema.validate(data, { abortEarly: false });
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach(err => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { valid: false, errors };
    }
    throw error;
  }
};

// Custom validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\\+]?[1-9]?[0-9]{7,15}$/;
  return phoneRegex.test(phone.replace(/[\\s\\-\\(\\)]/g, ''));
};

export const validateZip = (zip: string): boolean => {
  const zipRegex = /^\\d{5}(-\\d{4})?$/;
  return zipRegex.test(zip);
};

export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 99999.99 && Number.isFinite(price);
};

export const validateQuantity = (quantity: number): boolean => {
  return quantity >= 0 && Number.isInteger(quantity);
};
