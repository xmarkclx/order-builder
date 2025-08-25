import { describe, it, expect } from '@jest/globals';
import { 
  calculateAddOnsTotal, 
  calculateOrderTotal,
  calculateMRR,
  calculateAddonItemTotal,
  calculateOrderBreakdown,
  isValidPrice,
  isValidQuantity
} from '../calculations';
import { Order, AddOn } from '@/types';
import { createDefaultOrder } from '@/lib/data';

describe('Calculations', () => {
  describe('Feature: Calculate Add-ons Total', () => {
    describe('Given a list of add-ons', () => {
      const addOns: AddOn[] = [
        { id: '1', name: 'API Calls', description: 'Extra API calls', price: 0.001, quantity: 1000, included: true },
        { id: '2', name: 'Storage', description: 'Extra storage', price: 0.10, quantity: 50, included: true },
        { id: '3', name: 'Support', description: 'Premium support', price: 150, quantity: 2, included: false },
        { id: '4', name: 'Integration', description: 'Custom integration', price: 500, quantity: 0, included: true }
      ];

      it('should calculate total for included add-ons with quantity > 0', () => {
        const result = calculateAddOnsTotal(addOns);
        // API Calls: 0.001 * 1000 = 1.00
        // Storage: 0.10 * 50 = 5.00
        // Support: excluded (not included)
        // Integration: excluded (quantity = 0)
        expect(result.toNumber()).toBe(6.00);
      });

      it('should return 0 when no add-ons are included', () => {
        const excludedAddOns = addOns.map(addon => ({ ...addon, included: false }));
        const result = calculateAddOnsTotal(excludedAddOns);
        expect(result.toNumber()).toBe(0);
      });

      it('should return 0 when add-ons have zero quantity', () => {
        const zeroQuantityAddOns = addOns.map(addon => ({ ...addon, quantity: 0 }));
        const result = calculateAddOnsTotal(zeroQuantityAddOns);
        expect(result.toNumber()).toBe(0);
      });
    });
  });

  describe('Feature: Calculate Order Total', () => {
    describe('Given an order with selected plan and add-ons', () => {
      const order: Order = {
        ...createDefaultOrder(),
        selectedPlan: { id: 'plan-1', name: 'Pro Plan', price: 299 },
        addOns: [
          { id: '1', name: 'API Calls', description: 'Extra API calls', price: 0.001, quantity: 1000, included: true },
          { id: '2', name: 'Storage', description: 'Extra storage', price: 0.10, quantity: 50, included: true }
        ]
      };

      it('should calculate total including plan and add-ons', () => {
        const result = calculateOrderTotal(order);
        // Plan: 299.00
        // Add-ons: 1.00 + 5.00 = 6.00
        // Total: 305.00
        expect(result.toNumber()).toBe(305.00);
      });

      it('should return only add-ons total when no plan is selected', () => {
        const orderWithoutPlan = { ...order, selectedPlan: null };
        const result = calculateOrderTotal(orderWithoutPlan);
        expect(result.toNumber()).toBe(6.00);
      });
    });
  });

  describe('Feature: Calculate Monthly Recurring Revenue (MRR)', () => {
    describe('Given an order with contract duration', () => {
      const order: Order = {
        ...createDefaultOrder(),
        selectedPlan: { id: 'plan-1', name: 'Pro Plan', price: 1200 },
        contract: {
          startDate: new Date('2024-01-01'),
          durationMonths: 12,
          endDate: new Date('2024-12-31')
        }
      };

      it('should calculate MRR correctly for 12-month contract', () => {
        const result = calculateMRR(order);
        expect(result.toNumber()).toBe(100); // 1200 / 12 = 100
      });

      it('should return 0 for zero duration', () => {
        const orderWithZeroDuration = {
          ...order,
          contract: { ...order.contract, durationMonths: 0 }
        };
        const result = calculateMRR(orderWithZeroDuration);
        expect(result.toNumber()).toBe(0);
      });
    });
  });

  describe('Feature: Calculate Order Breakdown', () => {
    describe('Given a complete order', () => {
      const order: Order = {
        ...createDefaultOrder(),
        selectedPlan: { id: 'plan-1', name: 'Pro Plan', price: 299 },
        addOns: [
          { id: '1', name: 'API Calls', description: 'Extra API calls', price: 0.001, quantity: 1000, included: true }
        ],
        contract: {
          startDate: new Date('2024-01-01'),
          durationMonths: 12,
          endDate: new Date('2024-12-31')
        }
      };

      it('should provide complete breakdown', () => {
        const result = calculateOrderBreakdown(order);
        
        expect(result).toEqual({
          planTotal: 299,
          addOnsTotal: 1,
          subtotal: 300,
          tax: 0,
          total: 300,
          mrr: 25 // 300 / 12
        });
      });
    });
  });

  describe('Feature: Input Validation', () => {
    describe('Given price inputs', () => {
      it('should validate positive prices', () => {
        expect(isValidPrice(0)).toBe(true);
        expect(isValidPrice(99.99)).toBe(true);
        expect(isValidPrice(0.001)).toBe(true);
      });

      it('should reject negative prices', () => {
        expect(isValidPrice(-1)).toBe(false);
        expect(isValidPrice(-0.01)).toBe(false);
      });

      it('should reject invalid numbers', () => {
        expect(isValidPrice(Infinity)).toBe(false);
        expect(isValidPrice(NaN)).toBe(false);
      });
    });

    describe('Given quantity inputs', () => {
      it('should validate non-negative integers', () => {
        expect(isValidQuantity(0)).toBe(true);
        expect(isValidQuantity(1)).toBe(true);
        expect(isValidQuantity(100)).toBe(true);
      });

      it('should reject negative quantities', () => {
        expect(isValidQuantity(-1)).toBe(false);
      });

      it('should reject non-integer quantities', () => {
        expect(isValidQuantity(1.5)).toBe(false);
        expect(isValidQuantity(0.1)).toBe(false);
      });
    });
  });
});
