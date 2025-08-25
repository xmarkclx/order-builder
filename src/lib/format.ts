import { format } from 'date-fns';
import { Money, formatMoney } from './money';

/**
 * Format currency amount in USD using precise Money class
 */
export const formatCurrency = (amount: number | Money): string => {
  const money = amount instanceof Money ? amount : Money.from(amount);
  return formatMoney(money, 'USD', 'en-US');
};

/**
 * Format currency with custom precision using Money class
 */
export const formatCurrencyPrecise = (amount: number | Money, precision: number = 2): string => {
  const money = amount instanceof Money ? amount : Money.from(amount);
  const rounded = money.round(precision);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(rounded.toNumber());
};

/**
 * Format currency for display in inputs (no currency symbol)
 */
export const formatCurrencyInput = (amount: number | Money): string => {
  const money = amount instanceof Money ? amount : Money.from(amount);
  return money.toFixed(2);
};

/**
 * Parse currency input string to Money instance
 */
export const parseCurrencyInput = (input: string): Money => {
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return Money.from(isNaN(parsed) ? 0 : parsed);
};

/**
 * Legacy function - parse currency input to number (deprecated, use parseCurrencyInput)
 */
export const parseCurrencyInputToNumber = (input: string): number => {
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | null, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  return format(date, formatStr);
};

/**
 * Format date for input fields
 */
export const formatDateInput = (date: Date | null): string => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Format date range
 */
export const formatDateRange = (startDate: Date | null, endDate: Date | null): string => {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Format duration in months
 */
export const formatDuration = (months: number): string => {
  if (months === 0) return '0 months';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }
  
  const yearPart = years === 1 ? '1 year' : `${years} years`;
  const monthPart = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
  
  return `${yearPart}, ${monthPart}`;
};

/**
 * Format quantity
 */
export const formatQuantity = (quantity: number): string => {
  return new Intl.NumberFormat('en-US').format(quantity);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, precision: number = 1): string => {
  return `${value.toFixed(precision)}%`;
};

/**
 * Format file size (for future use)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Format per-unit pricing display
 */
export const formatPerUnit = (price: number, unit: string = 'unit'): string => {
  return `${formatCurrencyPrecise(price, 3)} per ${unit}`;
};

/**
 * Truncate long text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Format customer name (single field)
 */
export const formatCustomerName = (name: string): string => {
  return (name || '').trim();
};
