import { describe, it, expect } from '@jest/globals';
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatDate,
  formatDateRange,
  formatDuration,
  formatCustomerName,
  formatPerUnit
} from '../format';

describe('Formatting Utilities', () => {
  describe('Feature: Currency Formatting', () => {
    describe('Given different currency amounts', () => {
      it('should format currency with USD symbol and 2 decimal places', () => {
        expect(formatCurrency(0)).toBe('$0.00');
        expect(formatCurrency(99.99)).toBe('$99.99');
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
        expect(formatCurrency(0.001)).toBe('$0.00');
      });

      it('should format currency with custom precision', () => {
        expect(formatCurrencyPrecise(0.001, 3)).toBe('$0.001');
        expect(formatCurrencyPrecise(99.999, 3)).toBe('$99.999');
        expect(formatCurrencyPrecise(1234.56789, 4)).toBe('$1,234.5679');
      });

      it('should format per-unit pricing', () => {
        expect(formatPerUnit(0.001, 'API call')).toBe('$0.001 per API call');
        expect(formatPerUnit(0.10, 'GB')).toBe('$0.100 per GB');
        expect(formatPerUnit(150, 'hour')).toBe('$150.000 per hour');
      });
    });
  });

  describe('Feature: Date Formatting', () => {
    describe('Given different dates', () => {
      const testDate = new Date('2024-01-15');

      it('should format dates with default format', () => {
        expect(formatDate(testDate)).toBe('Jan 15, 2024');
      });

      it('should handle null dates', () => {
        expect(formatDate(null)).toBe('');
      });

      it('should format date ranges', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');
        expect(formatDateRange(startDate, endDate)).toBe('Jan 01, 2024 - Dec 31, 2024');
      });

      it('should handle null date ranges', () => {
        expect(formatDateRange(null, null)).toBe('');
        expect(formatDateRange(new Date('2024-01-01'), null)).toBe('');
      });
    });
  });

  describe('Feature: Duration Formatting', () => {
    describe('Given different duration periods', () => {
      it('should format single month', () => {
        expect(formatDuration(1)).toBe('1 month');
      });

      it('should format multiple months less than a year', () => {
        expect(formatDuration(6)).toBe('6 months');
        expect(formatDuration(11)).toBe('11 months');
      });

      it('should format exact years', () => {
        expect(formatDuration(12)).toBe('1 year');
        expect(formatDuration(24)).toBe('2 years');
      });

      it('should format years with remaining months', () => {
        expect(formatDuration(13)).toBe('1 year, 1 month');
        expect(formatDuration(14)).toBe('1 year, 2 months');
        expect(formatDuration(25)).toBe('2 years, 1 month');
      });
    });
  });

  describe('Feature: Customer Name Formatting', () => {
    describe('Given a single name field', () => {
      it('should return trimmed name', () => {
        expect(formatCustomerName('John')).toBe('John');
        expect(formatCustomerName('  Jane Doe  ')).toBe('Jane Doe');
      });

      it('should handle empty inputs gracefully', () => {
        expect(formatCustomerName('')).toBe('');
      });
    });
  });

  describe('Feature: Edge Cases and Error Handling', () => {
    describe('Given invalid or extreme inputs', () => {
      it('should handle very large currency amounts', () => {
        expect(formatCurrency(999999999.99)).toBe('$999,999,999.99');
      });

      it('should handle very long durations', () => {
        expect(formatDuration(120)).toBe('10 years');
        expect(formatDuration(125)).toBe('10 years, 5 months');
      });

      it('should handle zero duration', () => {
        expect(formatDuration(0)).toBe('0 months');
      });
    });
  });
});
