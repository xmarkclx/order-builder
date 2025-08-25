import { AddOn, Order } from '@/types';
import { Money } from './money';

/**
 * Calculate total price for add-ons using precise Money arithmetic
 */
export const calculateAddOnsTotal = (addOns: AddOn[]): Money => {
  const includedAddOns = addOns.filter(addon => addon.included && addon.quantity > 0);
  const totals = includedAddOns.map(addon => 
    Money.from(addon.price).multiply(addon.quantity)
  );
  return Money.sum(totals);
};

/**
 * Legacy function for backward compatibility - returns number
 */
export const calculateAddOnsTotalLegacy = (addOns: AddOn[]): number => {
  return calculateAddOnsTotal(addOns).toNumber();
};

/**
 * Calculate total order price using precise Money arithmetic
 */
export const calculateOrderTotal = (order: Order): Money => {
  let total = Money.zero();
  
  // Base plan price
  if (order.selectedPlan) {
    total = total.add(order.selectedPlan.price);
  }
  
  // Add-ons
  total = total.add(calculateAddOnsTotal(order.addOns));
  
  return total;
};

/**
 * Legacy function for backward compatibility - returns number
 */
export const calculateOrderTotalLegacy = (order: Order): number => {
  return calculateOrderTotal(order).toNumber();
};

/**
 * Calculate monthly recurring revenue (MRR) using Money
 */
export const calculateMRR = (order: Order): Money => {
  const totalPrice = calculateOrderTotal(order);
  const durationMonths = order.contract.durationMonths;
  
  if (durationMonths <= 0) return Money.zero();
  
  return totalPrice.divide(durationMonths);
};

/**
 * Legacy MRR function for backward compatibility
 */
export const calculateMRRLegacy = (order: Order): number => {
  return calculateMRR(order).toNumber();
};

/**
 * Calculate add-on total for a specific add-on using Money
 */
export const calculateAddonItemTotal = (addon: AddOn): Money => {
  if (!addon.included || addon.quantity <= 0) return Money.zero();
  return Money.from(addon.price).multiply(addon.quantity);
};

/**
 * Legacy addon item total function for backward compatibility
 */
export const calculateAddonItemTotalLegacy = (addon: AddOn): number => {
  return calculateAddonItemTotal(addon).toNumber();
};

/**
 * Calculate discount percentage (if needed for future features)
 */
export const calculateDiscountPercentage = (originalPrice: Money | number, finalPrice: Money | number): number => {
  const original = originalPrice instanceof Money ? originalPrice : Money.from(originalPrice);
  const final = finalPrice instanceof Money ? finalPrice : Money.from(finalPrice);
  
  if (original.equals(0)) return 0;
  return original.subtract(final).divide(original).multiply(100).toNumber();
};

/**
 * Calculate tax amount using Money (if needed for future features)
 */
export const calculateTax = (subtotal: Money | number, taxRate: number = 0): Money => {
  const amount = subtotal instanceof Money ? subtotal : Money.from(subtotal);
  return amount.multiply(taxRate / 100);
};

/**
 * Legacy tax calculation function for backward compatibility
 */
export const calculateTaxLegacy = (subtotal: number, taxRate: number = 0): number => {
  return calculateTax(subtotal, taxRate).toNumber();
};

/**
 * Calculate order totals with breakdown using Money for precision
 */
export const calculateOrderBreakdown = (order: Order) => {
  const planTotal = Money.from(order.selectedPlan?.price || 0);
  const addOnsTotal = calculateAddOnsTotal(order.addOns);
  const subtotal = planTotal.add(addOnsTotal);
  const tax = calculateTax(subtotal, 0); // No tax for now
  const total = subtotal.add(tax);
  
  return {
    planTotal: planTotal.toNumber(),
    addOnsTotal: addOnsTotal.toNumber(), 
    subtotal: subtotal.toNumber(),
    tax: tax.toNumber(),
    total: total.toNumber(),
    mrr: calculateMRR(order).toNumber()
  };
};

/**
 * Validate price input
 */
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && Number.isFinite(price);
};

/**
 * Validate quantity input
 */
export const isValidQuantity = (quantity: number): boolean => {
  return quantity >= 0 && Number.isInteger(quantity);
};
