export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface Customer {
  name: string;
  prePopulated: boolean;
  companyAddress?: Address;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // USD
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  plans: Plan[];
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number; // USD per unit
  quantity: number;
  included: boolean;
}

export interface Contract {
  startDate: Date | null;
  durationMonths: number;
  endDate: Date | null;
}

export interface Order {
  customer: Customer;
  product: Product | null;
  selectedPlan: Plan | null;
  contract: Contract;
  addOns: AddOn[];
  total: number;
}

export interface OrderState extends Order {
  currentStep: number;
  update: (partial: Partial<OrderState>) => void;
  reset: () => void;
  calculateTotal: () => void;
}

// Validation states
export interface ValidationErrors {
  [key: string]: string | undefined;
}

// Step navigation
export interface WizardStep {
  id: number;
  title: string;
  description: string;
  path: string;
  completed: boolean;
}
