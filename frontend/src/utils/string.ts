// String case utilities
export const caseUtils = {
    // Convert to camelCase
    toCamelCase(str: string): string {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (match, index) =>
          index === 0 ? match.toLowerCase() : match.toUpperCase()
        )
        .replace(/\s+/g, '');
    },
  
    // Convert to PascalCase
    toPascalCase(str: string): string {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, match => match.toUpperCase())
        .replace(/\s+/g, '');
    },
  
    // Convert to snake_case
    toSnakeCase(str: string): string {
      return str
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
        .replace(/\s+/g, '_');
    },
  
    // Convert to kebab-case
    toKebabCase(str: string): string {
      return str
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')
        .replace(/\s+/g, '-');
    },
  
    // Convert to Title Case
    toTitleCase(str: string): string {
      return str.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    },
  
    // Convert to Sentence case
    toSentenceCase(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
  
    // Toggle case
    toggleCase(str: string): string {
      return str
        .split('')
        .map(char => 
          char === char.toUpperCase() 
            ? char.toLowerCase() 
            : char.toUpperCase()
        )
        .join('');
    },
  };
  
  // String manipulation utilities
  export const manipulation = {
    // Truncate string
    truncate(str: string, length: number, suffix = '...'): string {
      if (str.length <= length) return str;
      return str.slice(0, length - suffix.length) + suffix;
    },
  
    // Truncate words
    truncateWords(str: string, count: number, suffix = '...'): string {
      const words = str.split(' ');
      if (words.length <= count) return str;
      return words.slice(0, count).join(' ') + suffix;
    },
  
    // Truncate middle
    truncateMiddle(str: string, length: number, separator = '...'): string {
      if (str.length <= length) return str;
      
      const charsToShow = length - separator.length;
      const frontChars = Math.ceil(charsToShow / 2);
      const backChars = Math.floor(charsToShow / 2);
      
      return str.substr(0, frontChars) + separator + str.substr(str.length - backChars);
    },
  
    // Repeat string
    repeat(str: string, count: number, separator = ''): string {
      return new Array(count).fill(str).join(separator);
    },
  
    // Pad string
    pad(str: string, length: number, char = ' ', position: 'start' | 'end' | 'both' = 'end'): string {
      const padLength = length - str.length;
      if (padLength <= 0) return str;
      
      const padStr = char.repeat(Math.ceil(padLength / char.length)).slice(0, padLength);
      
      switch (position) {
        case 'start':
          return padStr + str;
        case 'end':
          return str + padStr;
        case 'both':
          const startPad = padStr.slice(0, Math.floor(padLength / 2));
          const endPad = padStr.slice(0, Math.ceil(padLength / 2));
          return startPad + str + endPad;
      }
    },
  
    // Remove extra whitespace
    normalizeWhitespace(str: string): string {
      return str.trim().replace(/\s+/g, ' ');
    },
  
    // Remove accents
    removeAccents(str: string): string {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },
  
    // Reverse string
    reverse(str: string): string {
      return str.split('').reverse().join('');
    },
  
    // Shuffle string
    shuffle(str: string): string {
      const arr = str.split('');
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join('');
    },
  };
  
  // String validation utilities
  export const validation = {
    // Check if string is empty or whitespace
    isEmpty(str: string): boolean {
      return str.trim().length === 0;
    },
  
    // Check if string is numeric
    isNumeric(str: string): boolean {
      return !isNaN(parseFloat(str)) && isFinite(Number(str));
    },
  
    // Check if string is alphabetic
    isAlpha(str: string): boolean {
      return /^[a-zA-Z]+$/.test(str);
    },
  
    // Check if string is alphanumeric
    isAlphanumeric(str: string): boolean {
      return /^[a-zA-Z0-9]+$/.test(str);
    },
  
    // Check if string is email
    isEmail(str: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    },
  
    // Check if string is URL
    isUrl(str: string): boolean {
      try {
        new URL(str);
        return true;
      } catch {
        return false;
      }
    },
  
    // Check if string is phone number
    isPhoneNumber(str: string): boolean {
      return /^\+?[1-9]\d{1,14}$/.test(str.replace(/\s/g, ''));
    },
  
    // Check if string is hex color
    isHexColor(str: string): boolean {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);
    },
  
    // Check if string is IPv4
    isIPv4(str: string): boolean {
      return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) &&
        str.split('.').every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
    },
  
    // Check if string is UUID
    isUUID(str: string): boolean {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    },
  };
  
  // String parsing utilities
  export const parsing = {
    // Extract numbers from string
    extractNumbers(str: string): number[] {
      const matches = str.match(/\d+(\.\d+)?/g);
      return matches ? matches.map(Number) : [];
    },
  
    // Extract emails from string
    extractEmails(str: string): string[] {
      const matches = str.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g);
      return matches || [];
    },
  
    // Extract URLs from string
    extractUrls(str: string): string[] {
      const matches = str.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
      return matches || [];
    },
  
    // Extract mentions (@username)
    extractMentions(str: string): string[] {
      const matches = str.match(/@(\w+)/g);
      return matches ? matches.map(m => m.slice(1)) : [];
    },
  
    // Extract hashtags (#tag)
    extractHashtags(str: string): string[] {
      const matches = str.match(/#(\w+)/g);
      return matches ? matches.map(h => h.slice(1)) : [];
    },
  
    // Parse query string
    parseQueryString(str: string): Record<string, string> {
      const params: Record<string, string> = {};
      const searchParams = new URLSearchParams(str);
      
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return params;
    },
  
    // Parse CSV line
    parseCSVLine(str: string, delimiter = ','): string[] {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      if (current) {
        result.push(current.trim());
      }
      
      return result;
    },
  };
  
  // String generation utilities
  export const generation = {
    // Generate random string
    random(length: number, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
  
    // Generate UUID
    uuid(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  
    // Generate slug
    slug(str: string): string {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },
  
    // Generate initials
    initials(str: string, count = 2): string {
      const words = str.trim().split(/\s+/);
      return words
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, count);
    },
  
    // Generate lorem ipsum
    loremIpsum(wordCount = 50): string {
      const words = [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
        'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
        'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna',
        'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis',
        'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
        'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
        'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      ];
      
      const result: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        result.push(words[Math.floor(Math.random() * words.length)]);
      }
      
      return result.join(' ');
    },
  };
  
  // String search utilities
  export const search = {
    // Fuzzy search
    fuzzyMatch(str: string, pattern: string): boolean {
      const patternLower = pattern.toLowerCase();
      const strLower = str.toLowerCase();
      
      let patternIndex = 0;
      for (let i = 0; i < strLower.length && patternIndex < patternLower.length; i++) {
        if (strLower[i] === patternLower[patternIndex]) {
          patternIndex++;
        }
      }
      
      return patternIndex === patternLower.length;
    },
  
    // Calculate Levenshtein distance
    levenshteinDistance(str1: string, str2: string): number {
      const matrix: number[][] = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
    },
  
    // Calculate similarity percentage
    similarity(str1: string, str2: string): number {
      const distance = this.levenshteinDistance(str1, str2);
      const maxLength = Math.max(str1.length, str2.length);
      return ((maxLength - distance) / maxLength) * 100;
    },
  
    // Highlight search term
    highlight(str: string, searchTerm: string, className = 'highlight'): string {
      if (!searchTerm) return str;
      
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      return str.replace(regex, `<span class="${className}">$1</span>`);
    },
  };
  
  // String encoding utilities
  export const encoding = {
    // Encode HTML entities
    escapeHtml(str: string): string {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      
      return str.replace(/[&<>"']/g, char => map[char]);
    },
  
    // Decode HTML entities
    unescapeHtml(str: string): string {
      const map: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
      };
      
      return str.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, entity => map[entity]);
    },
  
    // Base64 encode
    toBase64(str: string): string {
      return btoa(unescape(encodeURIComponent(str)));
    },
  
    // Base64 decode
    fromBase64(str: string): string {
      return decodeURIComponent(escape(atob(str)));
    },
  
    // URL encode
    urlEncode(str: string): string {
      return encodeURIComponent(str);
    },
  
    // URL decode
    urlDecode(str: string): string {
      return decodeURIComponent(str);
    },
  };
  
  // Export all string utilities
  export default {
    case: caseUtils,
    manipulation,
    validation,
    parsing,
    generation,
    search,
    encoding,
  };