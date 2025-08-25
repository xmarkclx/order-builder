import { Product, AddOn, Customer, Contract, Order, WizardStep } from '@/types';

// Sample Products with Plans
export const sampleProducts: Product[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway Pro',
    description: 'Enterprise-grade API management and gateway solution',
    plans: [
      {
        id: 'gateway-starter',
        name: 'Starter Plan',
        price: 99.00
      },
      {
        id: 'gateway-professional',
        name: 'Professional Plan', 
        price: 299.00
      },
      {
        id: 'gateway-enterprise',
        name: 'Enterprise Plan',
        price: 799.00
      }
    ]
  },
  {
    id: 'analytics-suite',
    name: 'Analytics Suite',
    description: 'Advanced analytics and reporting platform',
    plans: [
      {
        id: 'analytics-basic',
        name: 'Basic Analytics',
        price: 149.00
      },
      {
        id: 'analytics-pro',
        name: 'Pro Analytics',
        price: 399.00
      },
      {
        id: 'analytics-enterprise',
        name: 'Enterprise Analytics',
        price: 999.00
      }
    ]
  },
  {
    id: 'data-processing',
    name: 'Data Processing Engine',
    description: 'High-performance data processing and transformation',
    plans: [
      {
        id: 'processing-lite',
        name: 'Lite Processing',
        price: 199.00
      },
      {
        id: 'processing-standard',
        name: 'Standard Processing',
        price: 499.00
      },
      {
        id: 'processing-premium',
        name: 'Premium Processing',
        price: 1299.00
      }
    ]
  }
];

// Sample Add-ons
export const sampleAddOns: AddOn[] = [
  {
    id: 'api-calls',
    name: 'Additional API Calls',
    description: 'Extra API call quota beyond base plan',
    price: 0.001, // $0.001 per unit
    quantity: 0,
    included: false
  },
  {
    id: 'storage-gb',
    name: 'Extra Storage',
    description: 'Additional storage capacity',
    price: 0.10, // $0.10 per GB
    quantity: 0,
    included: false
  },
  {
    id: 'bandwidth-gb',
    name: 'Extra Bandwidth',
    description: 'Additional monthly bandwidth',
    price: 0.05, // $0.05 per GB
    quantity: 0,
    included: false
  },
  {
    id: 'support-hours',
    name: 'Premium Support Hours',
    description: 'Additional premium support hours',
    price: 150.00, // $150 per hour
    quantity: 0,
    included: false
  },
  {
    id: 'custom-integration',
    name: 'Custom Integration',
    description: 'Custom API integration setup',
    price: 500.00, // $500 per integration
    quantity: 0,
    included: false
  },
  {
    id: 'priority-processing',
    name: 'Priority Processing',
    description: 'High-priority queue access',
    price: 99.00, // $99 per month
    quantity: 0,
    included: false
  }
];

// Wizard Steps Configuration
export const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: 'Customer Information',
    description: 'Enter customer details and address',
    path: '/step-1',
    completed: false
  },
  {
    id: 2,
    title: 'Product & Plan',
    description: 'Select product and pricing plan',
    path: '/step-2',
    completed: false
  },
  {
    id: 3,
    title: 'Contract Details',
    description: 'Set contract dates and duration',
    path: '/step-3',
    completed: false
  },
  {
    id: 4,
    title: 'Review & Finalize',
    description: 'Review order and configure add-ons',
    path: '/step-4',
    completed: false
  }
];

// Default empty customer
export const createDefaultCustomer = (): Customer => ({
  firstName: '',
  middleName: '',
  lastName: '',
  prePopulated: false,
  companyAddress: undefined
});

// Default empty contract
export const createDefaultContract = (): Contract => ({
  startDate: null,
  durationMonths: 12, // Default to 12 months
  endDate: null
});

// Factory for creating a default empty order
export const createDefaultOrder = (): Order => ({
  customer: createDefaultCustomer(),
  product: null,
  selectedPlan: null,
  contract: createDefaultContract(),
  addOns: sampleAddOns.map(addon => ({ ...addon, quantity: 0, included: false })),
  total: 0
});

// US States for address form
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

// Contract duration options
export const DURATION_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 24, label: '24 months' },
  { value: 36, label: '36 months' },
  { value: -1, label: 'Custom duration' }
];
