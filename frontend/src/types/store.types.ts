import { User, Message, Conversation } from './index';

// Auth Store Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface UpdateProfileData {
  username?: string;
  fullName?: string;
  bio?: string;
  avatar?: File;
  status?: UserStatus;
}

export type UserStatus = 'online' | 'away' | 'dnd' | 'offline';

// Chat Store Types
export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  currentConversation: Conversation | null;
  typingUsers: Record<string, string[]>;
  loadingConversations: boolean;
  loadingMessages: Record<string, boolean>;
  hasMoreMessages: Record<string, boolean>;
  error: string | null;
  searchQuery: string;
  searchResults: Message[];
  replyingTo: Message | null;
  editingMessage: Message | null;
  selectedMessages: Message[];
  unreadCounts: Record<string, number>;
}

export interface ChatActions {
  // Conversations
  loadConversations: () => Promise<void>;
  createConversation: (data: CreateConversationData) => Promise<Conversation>;
  updateConversation: (id: string, data: UpdateConversationData) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  
  // Messages
  loadMessages: (conversationId: string, options?: LoadMessagesOptions) => Promise<void>;
  sendMessage: (data: SendMessageData) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  
  // Typing
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  
  // Search
  searchMessages: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Message actions
  setReplyingTo: (message: Message | null) => void;
  setEditingMessage: (message: Message | null) => void;
  toggleMessageSelection: (message: Message) => void;
  clearSelectedMessages: () => void;
  
  // Read status
  markAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
  updateUnreadCount: (conversationId: string, count: number) => void;
  
  // Utility
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  setError: (error: string | null) => void;
}

export interface CreateConversationData {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
  avatar?: File;
  description?: string;
}

export interface UpdateConversationData {
  name?: string;
  avatar?: File;
  description?: string;
  settings?: ConversationSettings;
}

export interface LoadMessagesOptions {
  before?: string;
  after?: string;
  limit?: number;
}

export interface SendMessageData {
  conversationId: string;
  content?: string;
  type: MessageType;
  attachments?: File[];
  replyTo?: string;
  mentions?: string[];
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ConversationSettings {
  muted: boolean;
  notifications: boolean;
  archived: boolean;
  pinned: boolean;
}

// Theme Store Types
export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface ThemeActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  detectSystemTheme: () => void;
}

// UI Store Types
export interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  activeModal: ModalType | null;
  modalData: any;
  contextMenu: ContextMenuState | null;
  toasts: Toast[];
  isFullscreen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  keyboardHeight: number;
}

export interface UIActions {
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  showContextMenu: (menu: ContextMenuState) => void;
  hideContextMenu: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  setDeviceType: (device: DeviceType) => void;
  setKeyboardHeight: (height: number) => void;
}

export type ModalType = 
  | 'search'
  | 'newChat'
  | 'settings'
  | 'profile'
  | 'groupInfo'
  | 'mediaGallery'
  | 'forward'
  | 'delete'
  | 'block'
  | 'report';

export interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Notification Store Types
export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  soundEnabled: boolean;
  desktopEnabled: boolean;
}

export interface NotificationActions {
  requestPermission: () => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  toggleSound: () => void;
  toggleDesktop: () => void;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  data?: any;
  read: boolean;
  timestamp: Date;
}

export type NotificationType = 
  | 'message'
  | 'mention'
  | 'call'
  | 'friendRequest'
  | 'groupInvite'
  | 'system';

export interface NotificationPreferences {
  messages: boolean;
  mentions: boolean;
  calls: boolean;
  friendRequests: boolean;
  groupInvites: boolean;
  systemUpdates: boolean;
}

// Combined Store Type
export interface RootState {
  auth: AuthState & AuthActions;
  chat: ChatState & ChatActions;
  theme: ThemeState & ThemeActions;
  ui: UIState & UIActions;
  notifications: NotificationState & NotificationActions;
}

// Store Selectors
export interface StoreSelectors {
  // Auth selectors
  selectUser: (state: RootState) => User | null;
  selectIsAuthenticated: (state: RootState) => boolean;
  
  // Chat selectors
  selectCurrentConversation: (state: RootState) => Conversation | null;
  selectConversationMessages: (conversationId: string) => (state: RootState) => Message[];
  selectUnreadCount: (conversationId?: string) => (state: RootState) => number;
  selectTypingUsers: (conversationId: string) => (state: RootState) => string[];
  
  // Theme selectors
  selectCurrentTheme: (state: RootState) => 'light' | 'dark';
  
  // UI selectors
  selectActiveModal: (state: RootState) => ModalType | null;
  selectIsMobile: (state: RootState) => boolean;
  
  // Notification selectors
  selectUnreadNotifications: (state: RootState) => AppNotification[];
  selectNotificationCount: (state: RootState) => number;
}

// Store Middleware Types
export interface StoreMiddleware {
  persist?: {
    key: string;
    storage: Storage;
    whitelist?: string[];
    blacklist?: string[];
  };
  logger?: {
    enabled: boolean;
    collapsed: boolean;
  };
}

// Export all store types
export type StoreState = RootState;
export type StoreActions = AuthActions & ChatActions & ThemeActions & UIActions & NotificationActions;