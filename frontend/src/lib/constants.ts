// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Authentication
export const TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const AUTH_HEADER = 'Authorization';
export const TOKEN_PREFIX = 'Bearer';

// WebSocket Events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Authentication
  AUTH_SUCCESS: 'auth:success',
  AUTH_ERROR: 'auth:error',
  
  // Messages
  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_UPDATE: 'message:update',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  
  // Typing
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PRESENCE_UPDATE: 'presence:update',
  
  // Calls
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPTED: 'call:accepted',
  CALL_DECLINED: 'call:declined',
  CALL_ENDED: 'call:ended',
  CALL_ICE_CANDIDATE: 'call:ice-candidate',
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  
  // Conversations
  CONVERSATION_CREATE: 'conversation:create',
  CONVERSATION_UPDATE: 'conversation:update',
  CONVERSATION_DELETE: 'conversation:delete',
  
  // Reactions
  REACTION_ADD: 'reaction:add',
  REACTION_REMOVE: 'reaction:remove',
} as const;

// File Upload
export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
} as const;

export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
} as const;

// Message Configuration
export const MESSAGE_MAX_LENGTH = 1000;
export const MESSAGE_BATCH_SIZE = 50;
export const TYPING_INDICATOR_DURATION = 3000; // 3 seconds
export const MESSAGE_DELETE_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// UI Configuration
export const CONVERSATION_LIST_HEIGHT = 80; // px per item
export const MESSAGE_LIST_BUFFER = 5; // Number of messages to render outside viewport
export const SCROLL_THRESHOLD = 100; // px from bottom to show "new messages" button
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Date/Time Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'h:mm a';
export const DATETIME_FORMAT = 'MMM dd, yyyy h:mm a';
export const MESSAGE_TIME_FORMAT = 'h:mm a';
export const LAST_SEEN_FORMAT = 'MMM dd, h:mm a';

// Status Messages
export const STATUS_MESSAGES = {
  CONNECTING: 'Connecting...',
  RECONNECTING: 'Reconnecting...',
  CONNECTED: 'Connected',
  DISCONNECTED: 'Disconnected',
  ERROR: 'Connection error',
  TYPING: 'is typing...',
  RECORDING: 'Recording audio...',
  UPLOADING: 'Uploading...',
  SENDING: 'Sending...',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  UNSUPPORTED_FILE: 'This file type is not supported.',
  MESSAGE_TOO_LONG: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters.`,
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  SEND_FAILED: 'Failed to send message. Please try again.',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  DRAFT_MESSAGES: 'draftMessages',
  RECENT_EMOJIS: 'recentEmojis',
  NOTIFICATION_PERMISSION: 'notificationPermission',
  DEVICE_ID: 'deviceId',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  MENTION: 'mention',
  CALL: 'call',
  GROUP_INVITE: 'group_invite',
  FRIEND_REQUEST: 'friend_request',
} as const;

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Language Codes
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
  MENTION: /@([a-zA-Z0-9_]+)/g,
  EMOJI: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: 'ctrl+n',
  SEARCH: 'ctrl+k',
  SETTINGS: 'ctrl+,',
  TOGGLE_SIDEBAR: 'ctrl+b',
  SEND_MESSAGE: 'enter',
  NEW_LINE: 'shift+enter',
  EMOJI_PICKER: 'ctrl+e',
  ATTACH_FILE: 'ctrl+u',
  ESCAPE: 'escape',
} as const;

// PWA Configuration
export const PWA_CONFIG = {
  APP_NAME: 'Chat App',
  APP_SHORT_NAME: 'Chat',
  APP_DESCRIPTION: 'Modern real-time chat application',
  THEME_COLOR: '#3b82f6',
  BACKGROUND_COLOR: '#ffffff',
} as const;

// Media Constraints
export const MEDIA_CONSTRAINTS = {
  VIDEO: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    facingMode: 'user',
  },
  AUDIO: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
} as const;

// Call Configuration
export const CALL_CONFIG = {
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  RING_DURATION: 30000, // 30 seconds
  RECONNECT_TIMEOUT: 10000, // 10 seconds
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: 30,
  API_CALLS_PER_MINUTE: 60,
  FILE_UPLOADS_PER_HOUR: 100,
} as const;