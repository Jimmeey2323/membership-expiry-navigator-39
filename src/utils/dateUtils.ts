
import { MembershipRecord, PeriodGrouping } from '@/types';

/**
 * Groups records by time period according to the specified grouping
 */
export const groupByPeriod = (
  records: MembershipRecord[],
  grouping: PeriodGrouping
): Record<string, MembershipRecord[]> => {
  const result: Record<string, MembershipRecord[]> = {};
  
  records.forEach(record => {
    if (!record.expiresAt) return;
    
    const date = new Date(record.expiresAt);
    let periodKey: string;
    
    switch (grouping) {
      case 'week':
        // Get week number and year
        periodKey = `W${getWeekNumber(date)}, ${date.getFullYear()}`;
        break;
        
      case 'month':
        // Month name and year
        periodKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        break;
        
      case 'quarter':
        // Quarter and year
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periodKey = `Q${quarter} ${date.getFullYear()}`;
        break;
        
      case 'year':
        // Just the year
        periodKey = date.getFullYear().toString();
        break;
        
      default:
        periodKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        break;
    }
    
    if (!result[periodKey]) {
      result[periodKey] = [];
    }
    
    result[periodKey].push(record);
  });
  
  return result;
};

/**
 * Gets the week number for a given date
 */
const getWeekNumber = (date: Date): number => {
  // Copy date to avoid modifying the original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Calculate full weeks to nearest Thursday
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  return weekNumber;
};

/**
 * Formats a date string in a consistent way
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

/**
 * Returns a human-readable string for days lapsed
 */
export const formatDaysLapsed = (days?: number): string => {
  if (days === undefined) return 'Unknown';
  
  if (days === 0) return 'Today';
  if (days < 0) return `In ${Math.abs(days)} days`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};
