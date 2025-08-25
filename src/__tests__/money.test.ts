import { Money, money, formatMoney } from '@/lib/money';

describe('Money class', () => {
  describe('Construction and basic operations', () => {
    test('should create Money from various inputs', () => {
      expect(Money.from(10).toNumber()).toBe(10);
      expect(Money.from('10.99').toNumber()).toBe(10.99);
      expect(Money.from(0).toNumber()).toBe(0);
    });

    test('should create zero Money', () => {
      expect(Money.zero().toNumber()).toBe(0);
    });

    test('should handle helper function', () => {
      expect(money(15.50).toNumber()).toBe(15.50);
    });
  });

  describe('Arithmetic precision', () => {
    test('should handle floating point precision issues', () => {
      const result = money(0.1).add(0.2);
      expect(result.toFixed(2)).toBe('0.30');
      expect(result.toNumber()).toBeCloseTo(0.3);
      
      // Standard JavaScript would fail this:
      // expect(0.1 + 0.2).toBe(0.3); // This fails!
    });

    test('should perform precise addition', () => {
      const a = money(10.50);
      const b = money(5.25);
      expect(a.add(b).toNumber()).toBe(15.75);
      
      const c = money(0.6);
      const d = money(0.3);
      expect(c.add(d).toFixed(2)).toBe('0.90');
    });

    test('should perform precise subtraction', () => {
      const a = money(10.50);
      const b = money(3.25);
      expect(a.subtract(b).toNumber()).toBe(7.25);
    });

    test('should perform precise multiplication', () => {
      const price = money(9.99);
      const quantity = 3;
      expect(price.multiply(quantity).toFixed(2)).toBe('29.97');
    });

    test('should perform precise division', () => {
      const total = money(100);
      const parts = 3;
      expect(total.divide(parts).toFixed(2)).toBe('33.33');
    });
  });

  describe('Comparison operations', () => {
    test('should compare Money instances correctly', () => {
      const a = money(10.50);
      const b = money(10.50);
      const c = money(11.00);

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
      expect(a.lessThan(c)).toBe(true);
      expect(c.greaterThan(a)).toBe(true);
      expect(a.lessThanOrEqualTo(b)).toBe(true);
      expect(a.greaterThanOrEqualTo(b)).toBe(true);
    });

    test('should compare with numbers', () => {
      const a = money(10.50);

      expect(a.equals(10.50)).toBe(true);
      expect(a.greaterThan(10)).toBe(true);
      expect(a.lessThan(11)).toBe(true);
    });
  });

  describe('Rounding and formatting', () => {
    test('should round to specified decimal places', () => {
      const value = money(10.999);
      expect(value.round(2).toFixed(2)).toBe('11.00');
      
      const value2 = money(10.994);
      expect(value2.round(2).toFixed(2)).toBe('10.99');
    });

    test('should format to fixed decimal places', () => {
      const value = money(10.5);
      expect(value.toFixed(2)).toBe('10.50');
      expect(value.toFixed(0)).toBe('11'); // Rounds
    });

    test('should convert to string', () => {
      const value = money(10.50);
      expect(value.toString()).toBe('10.5');
    });
  });

  describe('Static utility methods', () => {
    test('should sum multiple Money instances', () => {
      const values = [money(10), money(20.50), money(5.25)];
      const sum = Money.sum(values);
      expect(sum.toFixed(2)).toBe('35.75');
    });

    test('should find maximum value', () => {
      const max = Money.max(money(10), money(20.50), money(5.25));
      expect(max.toNumber()).toBe(20.50);
    });

    test('should find minimum value', () => {
      const min = Money.min(money(10), money(20.50), money(5.25));
      expect(min.toNumber()).toBe(5.25);
    });

    test('should handle empty arrays', () => {
      expect(Money.sum([]).toNumber()).toBe(0);
      expect(Money.max().toNumber()).toBe(0);
      expect(Money.min().toNumber()).toBe(0);
    });
  });

  describe('Currency formatting', () => {
    test('should format currency correctly', () => {
      const value = money(1234.56);
      const formatted = formatMoney(value);
      expect(formatted).toBe('$1,234.56');
    });

    test('should format with different currency', () => {
      const value = money(1234.56);
      const formatted = formatMoney(value, 'EUR', 'de-DE');
      expect(formatted).toMatch(/1\.234,56\s*€/);
    });
  });

  describe('Edge cases', () => {
    test('should handle zero values', () => {
      const zero = Money.zero();
      expect(zero.add(10).toNumber()).toBe(10);
      expect(zero.multiply(1000).toNumber()).toBe(0);
    });

    test('should handle negative values', () => {
      const negative = money(-10.50);
      expect(negative.abs().toNumber()).toBe(10.50);
      expect(negative.add(5).toNumber()).toBe(-5.50);
    });

    test('should handle large numbers', () => {
      const large = money(999999999.99);
      expect(large.add(0.01).toFixed(2)).toBe('1000000000.00');
    });

    test('should handle very small numbers', () => {
      const small = money(0.001);
      expect(small.multiply(1000).toNumber()).toBe(1);
    });
  });

  describe('Real-world monetary scenarios', () => {
    test('should calculate order totals correctly', () => {
      // Simulate an order calculation
      const basePrice = money(29.99);
      const addon1 = money(9.99);
      const addon2 = money(4.99);
      const quantity = 2;

      const total = basePrice
        .add(addon1.multiply(quantity))
        .add(addon2);

      expect(total.toFixed(2)).toBe('54.96'); // 29.99 + (9.99 * 2) + 4.99 = 54.96
    });

    test('should handle tax calculations', () => {
      const subtotal = money(100);
      const taxRate = 8.25; // 8.25%
      const tax = subtotal.multiply(taxRate / 100);
      const total = subtotal.add(tax);

      expect(tax.toFixed(2)).toBe('8.25');
      expect(total.toFixed(2)).toBe('108.25');
    });

    test('should handle discount calculations', () => {
      const originalPrice = money(99.99);
      const discountPercent = 15; // 15%
      const discount = originalPrice.multiply(discountPercent / 100);
      const finalPrice = originalPrice.subtract(discount);

      expect(discount.toFixed(2)).toBe('15.00');
      expect(finalPrice.toFixed(2)).toBe('84.99');
    });

    test('should split bills evenly', () => {
      const totalBill = money(123.45);
      const people = 4;
      const perPerson = totalBill.divide(people);

      expect(perPerson.toFixed(2)).toBe('30.86'); // 30.8625 rounds to 30.86 for display
      
      // Verify the split maintains precision (no information loss with decimal.js)
      const reconstructed = perPerson.multiply(people);
      expect(reconstructed.toFixed(2)).toBe('123.45'); // 30.8625 * 4 = 123.45 exactly
      
      // Test with exact division
      const evenBill = money(120);
      const evenPerPerson = evenBill.divide(4);
      expect(evenPerPerson.toFixed(2)).toBe('30.00');
      expect(evenPerPerson.multiply(4).toFixed(2)).toBe('120.00');
    });
  });
});
