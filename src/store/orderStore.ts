import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMonths } from 'date-fns';
import { OrderState, AddOn } from '@/types';
import { createDefaultOrder } from '@/lib/data';

// Initial state factory
const createInitialState = (): Omit<OrderState, 'update' | 'reset' | 'calculateTotal'> => ({
  ...createDefaultOrder(),
  currentStep: 1
});

// Store implementation
export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      
      // Update store with partial state
      update: (partial: Partial<OrderState>) => {
        const currentState = get();
        const newState = { ...currentState, ...partial };
        
        // Auto-calculate end date when start date or duration changes
        if (partial.contract?.startDate || partial.contract?.durationMonths) {
          const contract = { ...currentState.contract, ...partial.contract };
          if (contract.startDate && contract.durationMonths > 0) {
            contract.endDate = addMonths(contract.startDate, contract.durationMonths);
          }
          newState.contract = contract;
        }
        
        set(newState);
        
        // Auto-calculate total after state update
        setTimeout(() => get().calculateTotal(), 0);
      },
      
      // Reset store to initial state
      reset: () => {
        set(createInitialState());
      },
      
      // Calculate total order amount
      calculateTotal: () => {
        const state = get();
        let total = 0;
        
        // Add base plan price
        if (state.selectedPlan) {
          total += state.selectedPlan.price;
        }
        
        // Add included add-ons
        state.addOns
          .filter(addon => addon.included && addon.quantity > 0)
          .forEach(addon => {
            total += addon.price * addon.quantity;
          });
        
        set({ total });
      }
    }),
    {
      name: 'order-builder-storage',
      // Only persist certain fields
      partialize: (state) => ({
        customer: state.customer,
        product: state.product,
        selectedPlan: state.selectedPlan,
        contract: {
          ...state.contract,
          startDate: (state.contract.startDate instanceof Date)
            ? state.contract.startDate.toISOString()
            : (typeof state.contract.startDate === 'string' ? state.contract.startDate : null),
          endDate: (state.contract.endDate instanceof Date)
            ? state.contract.endDate.toISOString()
            : (typeof state.contract.endDate === 'string' ? state.contract.endDate : null)
        },
        addOns: state.addOns,
        total: state.total,
        currentStep: state.currentStep
      })
    }
  )
);

// Selector hooks for better performance
export const useCustomer = () => useOrderStore(state => state.customer);
export const useProduct = () => useOrderStore(state => state.product);
export const useSelectedPlan = () => useOrderStore(state => state.selectedPlan);
export const useContract = () => useOrderStore(state => state.contract);
export const useAddOns = () => useOrderStore(state => state.addOns);
export const useTotal = () => useOrderStore(state => state.total);
export const useCurrentStep = () => useOrderStore(state => state.currentStep);

// Action hooks - memoize the selector to prevent infinite loops
export const useOrderActions = () => {
  const update = useOrderStore(state => state.update);
  const reset = useOrderStore(state => state.reset);
  const calculateTotal = useOrderStore(state => state.calculateTotal);
  
  return { update, reset, calculateTotal };
};

// Helper functions
export const updateCustomer = (customer: Partial<OrderState['customer']>) => {
  useOrderStore.getState().update({ customer: { ...useOrderStore.getState().customer, ...customer } });
};

export const updateContract = (contract: Partial<OrderState['contract']>) => {
  useOrderStore.getState().update({ contract: { ...useOrderStore.getState().contract, ...contract } });
};

export const updateAddOn = (addOnId: string, updates: Partial<AddOn>) => {
  const currentAddOns = useOrderStore.getState().addOns;
  const updatedAddOns = currentAddOns.map(addon => 
    addon.id === addOnId ? { ...addon, ...updates } : addon
  );
  useOrderStore.getState().update({ addOns: updatedAddOns });
};

export const toggleAddOn = (addOnId: string) => {
  const currentAddOns = useOrderStore.getState().addOns;
  const updatedAddOns = currentAddOns.map(addon => 
    addon.id === addOnId ? { ...addon, included: !addon.included } : addon
  );
  useOrderStore.getState().update({ addOns: updatedAddOns });
};

export const setAddOnQuantity = (addOnId: string, quantity: number) => {
  updateAddOn(addOnId, { quantity: Math.max(0, quantity) });
};

export const goToStep = (step: number) => {
  useOrderStore.getState().update({ currentStep: step });
};

export const nextStep = () => {
  const currentStep = useOrderStore.getState().currentStep;
  if (currentStep < 4) {
    goToStep(currentStep + 1);
  }
};

export const prevStep = () => {
  const currentStep = useOrderStore.getState().currentStep;
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
};
