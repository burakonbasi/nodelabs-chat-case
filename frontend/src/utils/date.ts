// src/utils/date.ts
import {
    addDays,
    addHours,
    addMinutes,
    addMonths,
    addWeeks,
    addYears,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    differenceInMonths,
    differenceInSeconds,
    differenceInWeeks,
    differenceInYears,
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    formatDistanceToNow,
    formatDuration as formatDurationFns,
    formatRelative,
    getDay,
    getDaysInMonth,
    getHours,
    getMinutes,
    getMonth,
    getYear,
    isAfter,
    isBefore,
    isEqual,
    isFuture,
    isPast,
    isSameDay,
    isSameMonth,
    isSameWeek,
    isSameYear,
    isToday,
    isTomorrow,
    isValid,
    isWeekend,
    isWithinInterval,
    isYesterday,
    parseISO,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays,
    subHours,
    subMinutes,
    subMonths,
    subWeeks,
    subYears,
  } from 'date-fns';
  
  // Date parsing utilities
  export const parsing = {
    // Parse various date formats
    parse(dateString: string): Date | null {
      // Try ISO format first
      try {
        const date = parseISO(dateString);
        if (isValid(date)) return date;
      } catch {}
      
      // Try other common formats
      const formats = [
        'MM/dd/yyyy',
        'dd/MM/yyyy',
        'yyyy-MM-dd',
        'MM-dd-yyyy',
        'dd-MM-yyyy',
        'MMM dd, yyyy',
        'dd MMM yyyy',
      ];
      
      for (const fmt of formats) {
        try {
          const date = new Date(dateString);
          if (isValid(date)) return date;
        } catch {}
      }
      
      return null;
    },
  
    // Parse time string (HH:mm or h:mm a)
    parseTime(timeString: string, baseDate = new Date()): Date | null {
      const time24Match = timeString.match(/^(\d{1,2}):(\d{2})$/);
      if (time24Match) {
        const [, hours, minutes] = time24Match;
        const date = new Date(baseDate);
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return date;
      }
      
      const time12Match = timeString.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
      if (time12Match) {
        const [, hours, minutes, period] = time12Match;
        let hour = parseInt(hours);
        
        if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
        
        const date = new Date(baseDate);
        date.setHours(hour, parseInt(minutes), 0, 0);
        return date;
      }
      
      return null;
    },
  
    // Parse duration string (e.g., "2h 30m", "1d 2h")
    parseDuration(durationString: string): number {
      let totalSeconds = 0;
      
      const patterns = [
        { regex: /(\d+)\s*d/i, multiplier: 86400 }, // days
        { regex: /(\d+)\s*h/i, multiplier: 3600 },  // hours
        { regex: /(\d+)\s*m/i, multiplier: 60 },    // minutes
        { regex: /(\d+)\s*s/i, multiplier: 1 },     // seconds
      ];
      
      patterns.forEach(({ regex, multiplier }) => {
        const match = durationString.match(regex);
        if (match) {
          totalSeconds += parseInt(match[1]) * multiplier;
        }
      });
      
      return totalSeconds;
    },
  };
  
  // Date comparison utilities
  export const comparison = {
    // Check if date is between two dates
    isBetween(date: Date, start: Date, end: Date, inclusive = true): boolean {
      return isWithinInterval(date, { start, end });
    },
  
    // Get the earlier date
    min(...dates: Date[]): Date {
      return dates.reduce((earliest, date) => 
        isBefore(date, earliest) ? date : earliest
      );
    },
  
    // Get the later date
    max(...dates: Date[]): Date {
      return dates.reduce((latest, date) => 
        isAfter(date, latest) ? date : latest
      );
    },
  
    // Sort dates
    sort(dates: Date[], ascending = true): Date[] {
      return [...dates].sort((a, b) => {
        const diff = a.getTime() - b.getTime();
        return ascending ? diff : -diff;
      });
    },
  
    // Group dates by period
    groupBy(
      dates: Date[],
      period: 'day' | 'week' | 'month' | 'year'
    ): Map<string, Date[]> {
      const groups = new Map<string, Date[]>();
      
      dates.forEach(date => {
        let key: string;
        
        switch (period) {
          case 'day':
            key = format(date, 'yyyy-MM-dd');
            break;
          case 'week':
            key = format(startOfWeek(date), 'yyyy-MM-dd');
            break;
          case 'month':
            key = format(date, 'yyyy-MM');
            break;
          case 'year':
            key = format(date, 'yyyy');
            break;
        }
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(date);
      });
      
      return groups;
    },
  };
  
  // Date manipulation utilities
  export const manipulation = {
    // Add business days
    addBusinessDays(date: Date, days: number): Date {
      let currentDate = new Date(date);
      let daysAdded = 0;
      
      while (daysAdded < days) {
        currentDate = addDays(currentDate, 1);
        if (!isWeekend(currentDate)) {
          daysAdded++;
        }
      }
      
      return currentDate;
    },
  
    // Get next occurrence of a specific day
    getNextDay(dayOfWeek: number, fromDate = new Date()): Date {
      const currentDay = getDay(fromDate);
      const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
      return addDays(fromDate, daysUntil);
    },
  
    // Get all dates in a range
    getDatesInRange(start: Date, end: Date): Date[] {
      const dates: Date[] = [];
      let currentDate = new Date(start);
      
      while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
      
      return dates;
    },
  
    // Round to nearest interval
    roundToNearest(
      date: Date,
      interval: number,
      unit: 'minutes' | 'hours' = 'minutes'
    ): Date {
      const ms = date.getTime();
      const intervalMs = interval * (unit === 'hours' ? 3600000 : 60000);
      return new Date(Math.round(ms / intervalMs) * intervalMs);
    },
  
    // Set time on date
    setTime(date: Date, hours: number, minutes = 0, seconds = 0): Date {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, seconds, 0);
      return newDate;
    },
  };
  
  // Date calculation utilities
  export const calculation = {
    // Calculate age
    calculateAge(birthDate: Date): number {
      return differenceInYears(new Date(), birthDate);
    },
  
    // Calculate working days between dates
    calculateWorkingDays(start: Date, end: Date): number {
      let count = 0;
      let currentDate = new Date(start);
      
      while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
        if (!isWeekend(currentDate)) {
          count++;
        }
        currentDate = addDays(currentDate, 1);
      }
      
      return count;
    },
  
    // Get time until next occurrence
    getTimeUntil(targetDate: Date): {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      total: number;
    } {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }
      
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        total: diff,
      };
    },
  
    // Get calendar weeks in month
    getCalendarWeeks(date: Date): Date[][] {
      const start = startOfWeek(startOfMonth(date));
      const end = endOfWeek(endOfMonth(date));
      const weeks: Date[][] = [];
      
      let currentWeek: Date[] = [];
      let currentDate = new Date(start);
      
      while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
        currentWeek.push(new Date(currentDate));
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
        
        currentDate = addDays(currentDate, 1);
      }
      
      return weeks;
    },
  };
  
  // Date formatting utilities
  export const formatting = {
    // Format as relative time with custom messages
    formatRelativeCustom(date: Date): string {
      const now = new Date();
      
      if (isToday(date)) {
        return `Today at ${format(date, 'h:mm a')}`;
      }
      
      if (isYesterday(date)) {
        return `Yesterday at ${format(date, 'h:mm a')}`;
      }
      
      if (isTomorrow(date)) {
        return `Tomorrow at ${format(date, 'h:mm a')}`;
      }
      
      if (isSameWeek(date, now)) {
        return format(date, 'EEEE \'at\' h:mm a');
      }
      
      if (isSameYear(date, now)) {
        return format(date, 'MMM d \'at\' h:mm a');
      }
      
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    },
  
    // Format duration in human readable format
    formatDurationCustom(seconds: number): string {
      const parts: string[] = [];
      
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
      
      return parts.join(' ');
    },
  
    // Format time range
    formatTimeRange(start: Date, end: Date): string {
      if (isSameDay(start, end)) {
        return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
      }
      
      if (isSameMonth(start, end)) {
        return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'd, h:mm a')}`;
      }
      
      return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'MMM d, h:mm a')}`;
    },
  
    // Format date range
    formatDateRange(start: Date, end: Date): string {
      if (isSameDay(start, end)) {
        return format(start, 'MMMM d, yyyy');
      }
      
      if (isSameMonth(start, end)) {
        return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
      }
      
      if (isSameYear(start, end)) {
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      }
      
      return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
    },
  };
  
  // Date validation utilities
  export const validation = {
    // Check if string is valid date
    isValidDate(dateString: string): boolean {
      const date = parsing.parse(dateString);
      return date !== null && isValid(date);
    },
  
    // Check if date is business day
    isBusinessDay(date: Date): boolean {
      return !isWeekend(date);
    },
  
    // Check if date is holiday (simplified - would need holiday data)
    isHoliday(date: Date, holidays: Date[] = []): boolean {
      return holidays.some(holiday => isSameDay(date, holiday));
    },
  
    // Validate date range
    validateRange(start: Date, end: Date): {
      valid: boolean;
      error?: string;
    } {
      if (!isValid(start)) {
        return { valid: false, error: 'Invalid start date' };
      }
      
      if (!isValid(end)) {
        return { valid: false, error: 'Invalid end date' };
      }
      
      if (isAfter(start, end)) {
        return { valid: false, error: 'Start date must be before end date' };
      }
      
      return { valid: true };
    },
  };
  
  // Export all date utilities
  export default {
    parsing,
    comparison,
    manipulation,
    calculation,
    formatting,
    validation,
    // Re-export commonly used date-fns functions
    format,
    parseISO,
    isToday,
    isYesterday,
    isTomorrow,
    isSameDay,
    isSameWeek,
    isSameMonth,
    isSameYear,
    isValid,
    isBefore,
    isAfter,
    addDays,
    subDays,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
  };