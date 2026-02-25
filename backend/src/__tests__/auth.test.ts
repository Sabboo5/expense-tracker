import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';

// ─── JWT Utils Tests ──────────────────────────────────────────────────────────
describe('JWT Utils', () => {
  const payload = { id: 'user123', email: 'test@example.com', name: 'Test User' };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token and return payload', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.name).toBe(payload.name);
    });

    it('should throw an error for an invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow();
    });

    it('should throw an error for a refresh token used as access token', () => {
      const refreshToken = generateRefreshToken(payload);
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw for an access token used as refresh token', () => {
      const accessToken = generateAccessToken(payload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});

// ─── Validation Schemas Tests ─────────────────────────────────────────────────
import { registerSchema, loginSchema } from '../schemas/authSchemas';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a valid registration payload', async () => {
      const validData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password1',
          currency: 'USD',
        },
      };
      await expect(registerSchema.parseAsync(validData)).resolves.toBeDefined();
    });

    it('should reject an invalid email', async () => {
      const invalidData = {
        body: { name: 'John', email: 'not-an-email', password: 'Password1' },
      };
      await expect(registerSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject a weak password', async () => {
      const invalidData = {
        body: { name: 'John', email: 'john@example.com', password: 'weak' },
      };
      await expect(registerSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject a password without uppercase', async () => {
      const invalidData = {
        body: { name: 'John', email: 'john@example.com', password: 'password1' },
      };
      await expect(registerSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject a name that is too short', async () => {
      const invalidData = {
        body: { name: 'J', email: 'john@example.com', password: 'Password1' },
      };
      await expect(registerSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should default currency to USD when not provided', async () => {
      const validData = {
        body: { name: 'John Doe', email: 'john@example.com', password: 'Password1' },
      };
      const result = await registerSchema.parseAsync(validData);
      expect(result.body.currency).toBe('USD');
    });
  });

  describe('loginSchema', () => {
    it('should validate a valid login payload', async () => {
      const validData = {
        body: { email: 'john@example.com', password: 'anypassword' },
      };
      await expect(loginSchema.parseAsync(validData)).resolves.toBeDefined();
    });

    it('should reject missing password', async () => {
      const invalidData = { body: { email: 'john@example.com', password: '' } };
      await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject invalid email format', async () => {
      const invalidData = { body: { email: 'bad', password: 'pass' } };
      await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });
});

// ─── Transaction Schemas Tests ────────────────────────────────────────────────
import { createTransactionSchema } from '../schemas/transactionSchemas';

describe('Transaction Schemas', () => {
  describe('createTransactionSchema', () => {
    it('should validate a valid income transaction', async () => {
      const validData = {
        body: {
          type: 'income',
          category: 'salary',
          amount: 5000,
          description: 'Monthly salary',
          date: new Date().toISOString(),
        },
      };
      await expect(createTransactionSchema.parseAsync(validData)).resolves.toBeDefined();
    });

    it('should validate a valid expense transaction', async () => {
      const validData = {
        body: {
          type: 'expense',
          category: 'food',
          amount: 50.99,
          description: 'Grocery shopping',
          date: new Date().toISOString(),
        },
      };
      await expect(createTransactionSchema.parseAsync(validData)).resolves.toBeDefined();
    });

    it('should reject a negative amount', async () => {
      const invalidData = {
        body: {
          type: 'expense',
          category: 'food',
          amount: -100,
          description: 'Test',
          date: new Date().toISOString(),
        },
      };
      await expect(createTransactionSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject zero amount', async () => {
      const invalidData = {
        body: {
          type: 'expense',
          category: 'food',
          amount: 0,
          description: 'Test',
          date: new Date().toISOString(),
        },
      };
      await expect(createTransactionSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject invalid transaction type', async () => {
      const invalidData = {
        body: {
          type: 'invalid',
          category: 'food',
          amount: 50,
          description: 'Test',
          date: new Date().toISOString(),
        },
      };
      await expect(createTransactionSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject missing description', async () => {
      const invalidData = {
        body: {
          type: 'expense',
          category: 'food',
          amount: 50,
          description: '',
          date: new Date().toISOString(),
        },
      };
      await expect(createTransactionSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should default tags to empty array when not provided', async () => {
      const validData = {
        body: {
          type: 'income',
          category: 'salary',
          amount: 1000,
          description: 'Test',
          date: new Date().toISOString(),
        },
      };
      const result = await createTransactionSchema.parseAsync(validData);
      expect(result.body.tags).toEqual([]);
    });
  });
});
