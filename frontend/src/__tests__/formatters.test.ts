import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  CATEGORY_LABELS,
  getCategoriesForType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '@/utils/formatters';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toBe('$1,234.56');
  });

  it('should format EUR correctly', () => {
    const result = formatCurrency(1000, 'EUR');
    expect(result).toContain('1,000');
  });

  it('should handle zero', () => {
    const result = formatCurrency(0, 'USD');
    expect(result).toBe('$0.00');
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1_000_000, 'USD');
    expect(result).toBe('$1,000,000.00');
  });

  it('should handle negative amounts', () => {
    const result = formatCurrency(-500, 'USD');
    expect(result).toContain('500');
  });
});

describe('formatDate', () => {
  it('should format a date string correctly', () => {
    const result = formatDate('2024-01-15T00:00:00.000Z', 'MMM dd, yyyy');
    expect(result).toContain('Jan');
    expect(result).toContain('2024');
  });

  it('should return Invalid date for invalid input', () => {
    const result = formatDate('not-a-date');
    expect(result).toBe('Invalid date');
  });

  it('should format a Date object correctly', () => {
    const date = new Date('2024-06-15');
    const result = formatDate(date, 'yyyy-MM-dd');
    expect(result).toContain('2024');
  });
});

describe('formatNumber', () => {
  it('should format numbers below 1000 as-is', () => {
    expect(formatNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1500)).toBe('1.5K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });

  it('should handle exact 1000', () => {
    expect(formatNumber(1000)).toBe('1.0K');
  });
});

describe('CATEGORY_LABELS', () => {
  it('should have label for salary', () => {
    expect(CATEGORY_LABELS.salary).toBe('Salary');
  });

  it('should have label for food', () => {
    expect(CATEGORY_LABELS.food).toBe('Food & Dining');
  });

  it('should have labels for all income categories', () => {
    INCOME_CATEGORIES.forEach((cat) => {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof CATEGORY_LABELS[cat]).toBe('string');
    });
  });

  it('should have labels for all expense categories', () => {
    EXPENSE_CATEGORIES.forEach((cat) => {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof CATEGORY_LABELS[cat]).toBe('string');
    });
  });
});

describe('getCategoriesForType', () => {
  it('should return income categories for income type', () => {
    const categories = getCategoriesForType('income');
    expect(categories).toContain('salary');
    expect(categories).toContain('freelance');
    expect(categories).not.toContain('food');
  });

  it('should return expense categories for expense type', () => {
    const categories = getCategoriesForType('expense');
    expect(categories).toContain('food');
    expect(categories).toContain('transport');
    expect(categories).not.toContain('salary');
  });
});
