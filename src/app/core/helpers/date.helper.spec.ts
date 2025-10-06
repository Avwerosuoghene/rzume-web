import { DateHelper } from './date.helper';

describe('DateHelper', () => {
  describe('formatDateForBackend', () => {
    it('should format a date correctly to YYYY-MM-DD', () => {
      const date = new Date('2025-10-05T14:30:00');
      const result = DateHelper.formatDateForBackend(date);
      expect(result).toBe('2025-10-05');
    });

    it('should handle single-digit months with leading zero', () => {
      const date = new Date('2025-01-15T10:00:00');
      const result = DateHelper.formatDateForBackend(date);
      expect(result).toBe('2025-01-15');
    });

    it('should handle single-digit days with leading zero', () => {
      const date = new Date('2025-12-05T10:00:00');
      const result = DateHelper.formatDateForBackend(date);
      expect(result).toBe('2025-12-05');
    });

    it('should preserve the local date regardless of timezone', () => {
      // Creating a date at midnight local time
      const date = new Date('2025-10-05T00:00:00');
      const result = DateHelper.formatDateForBackend(date);
      // Should return 05, not shift to 04
      expect(result).toBe('2025-10-05');
    });

    it('should throw error for invalid date', () => {
      const invalidDate = new Date('invalid');
      expect(() => DateHelper.formatDateForBackend(invalidDate))
        .toThrowError('Invalid date provided to formatDateForBackend');
    });

    it('should throw error for null date', () => {
      expect(() => DateHelper.formatDateForBackend(null as any))
        .toThrowError('Invalid date provided to formatDateForBackend');
    });

    it('should throw error for undefined date', () => {
      expect(() => DateHelper.formatDateForBackend(undefined as any))
        .toThrowError('Invalid date provided to formatDateForBackend');
    });
  });

  describe('formatDateSafely', () => {
    it('should format a valid date', () => {
      const date = new Date('2025-10-05T14:30:00');
      const result = DateHelper.formatDateSafely(date);
      expect(result).toBe('2025-10-05');
    });

    it('should return undefined for null date', () => {
      const result = DateHelper.formatDateSafely(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined date', () => {
      const result = DateHelper.formatDateSafely(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid date and log error', () => {
      spyOn(console, 'error');
      const invalidDate = new Date('invalid');
      const result = DateHelper.formatDateSafely(invalidDate);
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle date at end of month', () => {
      const date = new Date('2025-10-31T23:59:59');
      const result = DateHelper.formatDateSafely(date);
      expect(result).toBe('2025-10-31');
    });

    it('should handle date at beginning of year', () => {
      const date = new Date('2025-01-01T00:00:01');
      const result = DateHelper.formatDateSafely(date);
      expect(result).toBe('2025-01-01');
    });
  });
});
