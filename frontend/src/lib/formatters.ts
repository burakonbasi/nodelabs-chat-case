import React from 'react';
import { format, formatDistanceToNow, formatRelative, isToday, isYesterday, parseISO } from 'date-fns';
import { enUS, es, fr, de, it, pt, ru, zhCN, ja, ko } from 'date-fns/locale';

// Locale mapping
const locales = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  it: it,
  pt: pt,
  ru: ru,
  zh: zhCN,
  ja: ja,
  ko: ko,
};

type LocaleCode = keyof typeof locales;

// Get current locale
function getCurrentLocale(): LocaleCode {
  const storedLocale = localStorage.getItem('language') as LocaleCode;
  return storedLocale && storedLocale in locales ? storedLocale : 'en';
}

// Date formatting
export const dateFormatters = {
  // Format date
  formatDate: (date: Date | string, formatStr = 'PPP'): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr, { locale: locales[getCurrentLocale()] });
  },

  // Format time
  formatTime: (date: Date | string, use24Hour = false): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const formatStr = use24Hour ? 'HH:mm' : 'h:mm a';
    return format(parsedDate, formatStr, { locale: locales[getCurrentLocale()] });
  },

  // Format date and time
  formatDateTime: (date: Date | string, use24Hour = false): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const timeFormat = use24Hour ? 'HH:mm' : 'h:mm a';
    return format(parsedDate, `PPP ${timeFormat}`, { locale: locales[getCurrentLocale()] });
  },

  // Format relative time
  formatRelativeTime: (date: Date | string): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { 
      addSuffix: true, 
      locale: locales[getCurrentLocale()] 
    });
  },

  // Format message time
  formatMessageTime: (date: Date | string): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(parsedDate)) {
      return dateFormatters.formatTime(parsedDate);
    } else if (isYesterday(parsedDate)) {
      return `Yesterday at ${dateFormatters.formatTime(parsedDate)}`;
    } else {
      return format(parsedDate, 'MMM d, h:mm a', { locale: locales[getCurrentLocale()] });
    }
  },

  // Format last seen
  formatLastSeen: (date: Date | string): string => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Active now';
    if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)}h ago`;
    
    return formatRelative(parsedDate, now, { locale: locales[getCurrentLocale()] });
  },

  // Format duration
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // Format call duration
  formatCallDuration: (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  },
};

// Number formatting
export const numberFormatters = {
  // Format with commas
  formatNumber: (num: number, decimals = 0): string => {
    return new Intl.NumberFormat(getCurrentLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  // Format currency
  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat(getCurrentLocale(), {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format percentage
  formatPercentage: (value: number, decimals = 0): string => {
    return new Intl.NumberFormat(getCurrentLocale(), {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Format compact numbers (1K, 1M, etc.)
  formatCompact: (num: number): string => {
    return new Intl.NumberFormat(getCurrentLocale(), {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num);
  },

  // Format ordinal numbers (1st, 2nd, etc.)
  formatOrdinal: (num: number): string => {
    const locale = getCurrentLocale();
    
    if (locale === 'en') {
      const j = num % 10;
      const k = num % 100;
      
      if (j === 1 && k !== 11) return `${num}st`;
      if (j === 2 && k !== 12) return `${num}nd`;
      if (j === 3 && k !== 13) return `${num}rd`;
      return `${num}th`;
    }
    
    // For other locales, just return the number
    // This could be extended for other languages
    return num.toString();
  },
};

// File size formatting
export const fileSizeFormatters = {
  // Format bytes to human readable
  formatFileSize: (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  },

  // Format download/upload speed
  formatSpeed: (bytesPerSecond: number): string => {
    return `${fileSizeFormatters.formatFileSize(bytesPerSecond)}/s`;
  },

  // Format remaining time for downloads
  formatRemainingTime: (remainingBytes: number, bytesPerSecond: number): string => {
    if (bytesPerSecond === 0) return 'Calculating...';
    
    const remainingSeconds = Math.ceil(remainingBytes / bytesPerSecond);
    return dateFormatters.formatDuration(remainingSeconds);
  },
};

// Text formatting
export const textFormatters = {
  // Truncate text
  truncate: (text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  // Capitalize first letter
  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Title case
  titleCase: (text: string): string => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  // Format phone number
  formatPhoneNumber: (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length (US format example)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    
    // Return original if not standard format
    return phone;
  },

  // Format mention
  formatMention: (username: string): string => {
    return `@${username}`;
  },

  // Format hashtag
  formatHashtag: (tag: string): string => {
    return `#${tag.replace(/\s+/g, '')}`;
  },

  // Pluralize
  pluralize: (count: number, singular: string, plural?: string): string => {
    if (count === 1) return `${count} ${singular}`;
    return `${count} ${plural || singular + 's'}`;
  },
};

// Message formatting
export const messageFormatters = {
  // Format message with mentions
  formatMessageWithMentions: (
    text: string, 
    mentions: Array<{ id: string; username: string; indices: [number, number] }>
  ): React.ReactNode[] => {
    if (!mentions || mentions.length === 0) return [text];
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    mentions
      .sort((a, b) => a.indices[0] - b.indices[0])
      .forEach((mention, index) => {
        // Add text before mention
        if (mention.indices[0] > lastIndex) {
          parts.push(text.slice(lastIndex, mention.indices[0]));
        }
        
        // Add mention as a link/span
        parts.push(
          <span key={`mention-${index}`} className="text-primary-500 font-medium cursor-pointer">
            @{mention.username}
          </span>
        );
        
        lastIndex = mention.indices[1];
      });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts;
  },

  // Format message with links
  formatMessageWithLinks: (text: string): React.ReactNode[] => {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let index = 0;
    
    while ((match = urlRegex.exec(text)) !== null) {
      // Add text before URL
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add URL as a link
      parts.push(
        <a
          key={`link-${index++}`}
          href={match[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-500 underline"
        >
          {textFormatters.truncate(match[0], 30)}
        </a>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  },

  // Format typing status
  formatTypingStatus: (users: string[]): string => {
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0]} is typing...`;
    if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`;
    return `${users[0]}, ${users[1]} and ${users.length - 2} others are typing...`;
  },
};

// Export all formatters
export default {
  date: dateFormatters,
  number: numberFormatters,
  fileSize: fileSizeFormatters,
  text: textFormatters,
  message: messageFormatters,
};