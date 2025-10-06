
export class DateHelper {

  static formatDateForBackend(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Invalid date provided to formatDateForBackend');
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  static formatDateSafely(date: Date | null | undefined): string | undefined {
    if (!date) return undefined;
    
    try {
      return this.formatDateForBackend(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return undefined;
    }
  }
}
