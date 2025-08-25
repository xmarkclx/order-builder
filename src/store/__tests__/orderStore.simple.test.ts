import { describe, it, expect } from '@jest/globals';
import { 
  useOrderStore,
  updateCustomer,
  updateContract,
  updateAddOn,
  toggleAddOn,
  setAddOnQuantity,
  goToStep,
  nextStep,
  prevStep
} from '../orderStore';

describe('Order Store (Simple Tests)', () => {
  
  describe('Feature: Store Initialization', () => {
    it('should initialize with correct default values', () => {
      // Get fresh store state
      useOrderStore.getState().reset();
      const state = useOrderStore.getState();
      
      expect(state.customer.firstName).toBe('');
      expect(state.customer.lastName).toBe('');
      expect(state.customer.prePopulated).toBe(false);
      expect(state.currentStep).toBe(1);
      expect(state.total).toBe(0);
      expect(state.addOns).toHaveLength(6);
    });
  });

  describe('Feature: Customer Management', () => {
    it('should update customer information', () => {
      useOrderStore.getState().reset();
      
      updateCustomer({
        firstName: 'John',
        lastName: 'Doe'
      });
      
      const customer = useOrderStore.getState().customer;
      expect(customer.firstName).toBe('John');
      expect(customer.lastName).toBe('Doe');
      expect(customer.prePopulated).toBe(false); // Should preserve other fields
    });

    it('should update customer with address', () => {
      useOrderStore.getState().reset();
      
      const newCustomer = {
        firstName: 'Jane',
        lastName: 'Smith',
        prePopulated: true,
        companyAddress: {
          line1: '123 Main St',
          line2: 'Suite 100',
          city: 'Anytown',
          state: 'CA',
          zip: '12345'
        }
      };

      useOrderStore.getState().update({ customer: newCustomer });
      
      const customer = useOrderStore.getState().customer;
      expect(customer).toEqual(newCustomer);
    });
  });

  describe('Feature: Product and Plan Selection', () => {
    it('should store product and plan selection', () => {
      useOrderStore.getState().reset();
      
      const testProduct = {
        id: 'test-product',
        name: 'Test Product',
        description: 'A test product',
        plans: [
          { id: 'plan-1', name: 'Basic Plan', price: 99 },
          { id: 'plan-2', name: 'Pro Plan', price: 199 }
        ]
      };

      const selectedPlan = { id: 'plan-1', name: 'Basic Plan', price: 99 };

      useOrderStore.getState().update({
        product: testProduct,
        selectedPlan: selectedPlan
      });

      const state = useOrderStore.getState();
      expect(state.product).toEqual(testProduct);
      expect(state.selectedPlan).toEqual(selectedPlan);
    });

    it('should calculate total when plan is selected', () => {
      useOrderStore.getState().reset();
      
      const selectedPlan = { id: 'plan-1', name: 'Basic Plan', price: 99 };
      
      useOrderStore.getState().update({ selectedPlan });
      useOrderStore.getState().calculateTotal();
      
      expect(useOrderStore.getState().total).toBe(99);
    });
  });

  describe('Feature: Contract Management', () => {
    it('should auto-calculate end date', () => {
      useOrderStore.getState().reset();
      
      const startDate = new Date('2024-01-01');
      const durationMonths = 12;

      useOrderStore.getState().update({
        contract: {
          startDate,
          durationMonths,
          endDate: null
        }
      });

      const contract = useOrderStore.getState().contract;
      expect(contract.startDate).toEqual(startDate);
      expect(contract.durationMonths).toBe(12);
      expect(contract.endDate).toEqual(new Date('2025-01-01'));
    });

    it('should update contract via helper', () => {
      useOrderStore.getState().reset();
      
      updateContract({ durationMonths: 24 });
      
      expect(useOrderStore.getState().contract.durationMonths).toBe(24);
    });
  });

  describe('Feature: Add-ons Management', () => {
    it('should toggle add-on inclusion', () => {
      useOrderStore.getState().reset();
      
      const firstAddonId = useOrderStore.getState().addOns[0]?.id;
      expect(firstAddonId).toBeTruthy();

      // Toggle on
      toggleAddOn(firstAddonId);
      expect(useOrderStore.getState().addOns[0]?.included).toBe(true);

      // Toggle off
      toggleAddOn(firstAddonId);
      expect(useOrderStore.getState().addOns[0]?.included).toBe(false);
    });

    it('should update add-on quantity', () => {
      useOrderStore.getState().reset();
      
      const firstAddonId = useOrderStore.getState().addOns[0]?.id;
      
      setAddOnQuantity(firstAddonId, 100);
      expect(useOrderStore.getState().addOns[0]?.quantity).toBe(100);
    });

    it('should prevent negative quantities', () => {
      useOrderStore.getState().reset();
      
      const firstAddonId = useOrderStore.getState().addOns[0]?.id;
      
      setAddOnQuantity(firstAddonId, -10);
      expect(useOrderStore.getState().addOns[0]?.quantity).toBe(0);
    });

    it('should calculate total with add-ons', () => {
      useOrderStore.getState().reset();
      
      const selectedPlan = { id: 'plan-1', name: 'Pro Plan', price: 299 };
      useOrderStore.getState().update({ selectedPlan });
      
      // Include API calls addon (0.001 per unit)
      updateAddOn('api-calls', { included: true, quantity: 1000 });
      // Include storage addon (0.10 per GB)
      updateAddOn('storage-gb', { included: true, quantity: 50 });
      
      useOrderStore.getState().calculateTotal();
      
      // Plan: 299, API: 1, Storage: 5 = Total: 305
      expect(useOrderStore.getState().total).toBe(305);
    });
  });

  describe('Feature: Step Navigation', () => {
    it('should navigate to specific steps', () => {
      useOrderStore.getState().reset();
      
      goToStep(3);
      expect(useOrderStore.getState().currentStep).toBe(3);
    });

    it('should navigate forward and backward', () => {
      useOrderStore.getState().reset();
      
      expect(useOrderStore.getState().currentStep).toBe(1);
      
      nextStep();
      expect(useOrderStore.getState().currentStep).toBe(2);
      
      nextStep();
      expect(useOrderStore.getState().currentStep).toBe(3);
      
      prevStep();
      expect(useOrderStore.getState().currentStep).toBe(2);
    });

    it('should not go beyond step limits', () => {
      useOrderStore.getState().reset();
      
      // Try to go beyond step 4
      goToStep(4);
      nextStep();
      expect(useOrderStore.getState().currentStep).toBe(4);
      
      // Try to go before step 1
      goToStep(1);
      prevStep();
      expect(useOrderStore.getState().currentStep).toBe(1);
    });
  });

  describe('Feature: Store Reset', () => {
    it('should reset all values to defaults', () => {
      // Populate the store first
      useOrderStore.getState().update({
        customer: { firstName: 'John', lastName: 'Doe', prePopulated: false },
        currentStep: 3,
        total: 500
      });
      
      // Verify populated
      let state = useOrderStore.getState();
      expect(state.customer.firstName).toBe('John');
      expect(state.currentStep).toBe(3);
      expect(state.total).toBe(500);
      
      // Reset
      useOrderStore.getState().reset();
      
      // Verify reset
      state = useOrderStore.getState();
      expect(state.customer.firstName).toBe('');
      expect(state.currentStep).toBe(1);
      expect(state.total).toBe(0);
    });
  });
});
