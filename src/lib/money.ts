import Decimal from 'decimal.js';

// Type alias for Decimal instance to avoid TypeScript conflicts
type DecimalInstance = InstanceType<typeof Decimal>;

/**
 * Utility class for precise monetary calculations
 */
export class Money {
  private value: DecimalInstance;

  constructor(value: string | number | DecimalInstance) {
    // Create decimal for precise calculations
    this.value = new Decimal(value);
  }

  /**
   * Add another Money instance or number
   */
  add(other: Money | string | number): Money {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return new Money(this.value.plus(otherValue));
  }

  /**
   * Subtract another Money instance or number
   */
  subtract(other: Money | string | number): Money {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return new Money(this.value.minus(otherValue));
  }

  /**
   * Multiply by another Money instance, number, or string
   */
  multiply(other: Money | string | number): Money {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return new Money(this.value.times(otherValue));
  }

  /**
   * Divide by another Money instance, number, or string
   */
  divide(other: Money | string | number): Money {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return new Money(this.value.div(otherValue));
  }

  /**
   * Check if this Money instance equals another
   */
  equals(other: Money | string | number): boolean {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return this.value.eq(otherValue);
  }

  /**
   * Check if this Money instance is greater than another
   */
  greaterThan(other: Money | string | number): boolean {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return this.value.gt(otherValue);
  }

  /**
   * Check if this Money instance is less than another
   */
  lessThan(other: Money | string | number): boolean {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return this.value.lt(otherValue);
  }

  /**
   * Check if this Money instance is greater than or equal to another
   */
  greaterThanOrEqualTo(other: Money | string | number): boolean {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return this.value.gte(otherValue);
  }

  /**
   * Check if this Money instance is less than or equal to another
   */
  lessThanOrEqualTo(other: Money | string | number): boolean {
    const otherValue = other instanceof Money ? other.value : new Decimal(other);
    return this.value.lte(otherValue);
  }

  /**
   * Get the absolute value
   */
  abs(): Money {
    return new Money(this.value.abs());
  }

  /**
   * Round to specified decimal places (default 2 for currency)
   */
  round(decimalPlaces: number = 2): Money {
    return new Money(this.value.toDecimalPlaces(decimalPlaces));
  }

  /**
   * Convert to number (use carefully - may lose precision)
   */
  toNumber(): number {
    return this.value.toNumber();
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return this.value.toString();
  }

  /**
   * Convert to fixed decimal places string (for display)
   */
  toFixed(decimalPlaces: number = 2): string {
    return this.value.toFixed(decimalPlaces);
  }

  /**
   * Get the raw Decimal value (for advanced operations)
   */
  getDecimal(): DecimalInstance {
    return this.value;
  }

  /**
   * Static method to create Money from various inputs
   */
  static from(value: string | number | DecimalInstance): Money {
    return new Money(value);
  }

  /**
   * Static method to create Money representing zero
   */
  static zero(): Money {
    return new Money(0);
  }

  /**
   * Static method to sum multiple Money instances
   */
  static sum(values: Money[]): Money {
    return values.reduce((acc, curr) => acc.add(curr), Money.zero());
  }

  /**
   * Static method to find maximum Money value
   */
  static max(...values: Money[]): Money {
    if (values.length === 0) return Money.zero();
    return values.reduce((max, current) => 
      current.greaterThan(max) ? current : max
    );
  }

  /**
   * Static method to find minimum Money value
   */
  static min(...values: Money[]): Money {
    if (values.length === 0) return Money.zero();
    return values.reduce((min, current) => 
      current.lessThan(min) ? current : min
    );
  }
}

/**
 * Helper function to create Money instances
 */
export const money = (value: string | number | DecimalInstance): Money => {
  return Money.from(value);
};

/**
 * Helper function for currency formatting with precise values
 */
export const formatMoney = (value: Money, currency: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.toNumber());
};

export default Money;
