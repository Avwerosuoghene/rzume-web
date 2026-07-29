import { ViewUtilities } from './view.util';

describe('ViewUtilities', () => {
  describe('checkItemForLongElegibility', () => {
    it('should return true for items that need a long table column', () => {
      expect(ViewUtilities.checkItemForLongElegibility('company')).toBe(true);
      expect(ViewUtilities.checkItemForLongElegibility('job_role')).toBe(true);
      expect(ViewUtilities.checkItemForLongElegibility('cv')).toBe(true);
    });

    it('should return false for items not in the long-width list', () => {
      expect(ViewUtilities.checkItemForLongElegibility('date')).toBe(false);
      expect(ViewUtilities.checkItemForLongElegibility('unknown')).toBe(false);
    });
  });

  describe('checkItemForShortElegibility', () => {
    it('should return true for items that need a short table column', () => {
      expect(ViewUtilities.checkItemForShortElegibility('date')).toBe(true);
      expect(ViewUtilities.checkItemForShortElegibility('status')).toBe(true);
      expect(ViewUtilities.checkItemForShortElegibility('action')).toBe(true);
    });

    it('should return false for items not in the short-width list', () => {
      expect(ViewUtilities.checkItemForShortElegibility('company')).toBe(false);
      expect(ViewUtilities.checkItemForShortElegibility('unknown')).toBe(false);
    });
  });
});
