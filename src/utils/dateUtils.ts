/**
 * Utility functions for safe date handling
 */

/**
 * Safely converts a value to a Date object
 * @param value - The value to convert
 * @returns A Date object or null if conversion fails
 */
export function safeDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  
  if (typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

/**
 * Safely formats a date with fallback
 * @param date - The date to format
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatTime(date: unknown, fallback: string = 'Invalid date'): string {
  const parsedDate = safeDate(date);
  if (!parsedDate) {
    return fallback;
  }
  
  try {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return parsedDate.toLocaleDateString();
    }
  } catch (error) {
    console.warn('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Safely formats a date for display
 * @param date - The date to format
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(date: unknown, fallback: string = 'Invalid date'): string {
  const parsedDate = safeDate(date);
  if (!parsedDate) {
    return fallback;
  }
  
  try {
    return parsedDate.toLocaleDateString();
  } catch (error) {
    console.warn('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Checks if a value is a valid date
 * @param value - The value to check
 * @returns True if the value is a valid date
 */
export function isValidDate(value: unknown): boolean {
  return safeDate(value) !== null;
}
