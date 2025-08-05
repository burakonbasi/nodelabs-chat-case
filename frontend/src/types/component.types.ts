// src/types/component.types.ts
import { ReactNode, CSSProperties, MouseEvent, KeyboardEvent, ChangeEvent } from 'react';
import { Message, User, Conversation } from './index';

// Common component prop types
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
}

// Button component types
export interface ButtonProps extends InteractiveComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
}

// Input component types
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClear?: () => void;
  showPasswordToggle?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  animate?: boolean;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
  animate?: boolean;
}

// Dropdown component types
export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface DropdownProps<T = string> extends BaseComponentProps {
  options: DropdownOption<T>[];
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  maxHeight?: number;
  renderOption?: (option: DropdownOption<T>, isSelected: boolean) => ReactNode;
  renderValue?: (value: T | T[]) => ReactNode;
}

// Avatar component types
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  onClick?: () => void;
}

// Badge component types
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'square' | 'pill';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: ReactNode;
  animate?: boolean;
  pulse?: boolean;
  outline?: boolean;
}

// Skeleton component types
export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
  spacing?: number;
}

// Toast component types
export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Tooltip component types
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  offset?: number;
  arrow?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Context menu component types
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  submenu?: ContextMenuItem[];
  divider?: boolean;
  checked?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  onClose?: () => void;
  className?: string;
}

// Chat-specific component types
export interface MessageItemProps extends BaseComponentProps {
  message: Message;
  showAvatar?: boolean;
  showUsername?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onReact?: (emoji: string) => void;
  onImageClick?: (url: string) => void;
}

export interface ConversationItemProps extends BaseComponentProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: MouseEvent) => void;
  showUnread?: boolean;
  showTyping?: boolean;
  typingUsers?: User[];
}

export interface ChatHeaderProps extends BaseComponentProps {
  conversation: Conversation;
  onBack?: () => void;
  onSearch?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  onShowInfo?: () => void;
}

export interface ChatInputProps extends BaseComponentProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showAttachments?: boolean;
  showEmoji?: boolean;
  showVoiceRecorder?: boolean;
}

export interface MessageListProps extends BaseComponentProps {
  messages: Message[];
  currentUserId: string;
  onLoadMore?: () => void;
  onMessageAction?: (action: MessageAction) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  emptyMessage?: string;
  groupByDate?: boolean;
  showUnreadSeparator?: boolean;
  unreadCount?: number;
}

export interface MessageAction {
  type: 'reply' | 'edit' | 'delete' | 'forward' | 'react' | 'copy' | 'pin';
  message: Message;
  data?: any;
}

export interface EmojiPickerProps extends BaseComponentProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  recentEmojis?: string[];
  skinTone?: number;
  theme?: 'light' | 'dark' | 'auto';
  categories?: string[];
  customEmojis?: CustomEmoji[];
}

export interface CustomEmoji {
  id: string;
  name: string;
  url: string;
  category?: string;
}

export interface VoiceRecorderProps extends BaseComponentProps {
  onStop: (audioBlob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number;
  quality?: 'low' | 'medium' | 'high';
  showWaveform?: boolean;
}

export interface FileUploadProps extends BaseComponentProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  dragAndDrop?: boolean;
  showPreview?: boolean;
  disabled?: boolean;
}

export interface ImagePreviewProps extends BaseComponentProps {
  images: string[];
  currentIndex?: number;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  onDownload?: (url: string) => void;
  onDelete?: (index: number) => void;
  showThumbnails?: boolean;
  showControls?: boolean;
}

export interface TypingIndicatorProps extends BaseComponentProps {
  users: User[];
  variant?: 'dots' | 'text' | 'wave';
  size?: 'sm' | 'md' | 'lg';
}

export interface OnlineIndicatorProps extends BaseComponentProps {
  user?: User;
  isOnline?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
  pulse?: boolean;
}

export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showIcon?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

export interface TabsProps extends BaseComponentProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  content?: ReactNode;
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface LoadingStateProps extends BaseComponentProps {
  variant?: 'spinner' | 'skeleton' | 'progress';
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorStateProps extends BaseComponentProps {
  error: Error | string;
  onRetry?: () => void;
  showDetails?: boolean;
}

// Form component types
export interface FormProps extends BaseComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  initialValues?: Record<string, any>;
  validation?: Record<string, ValidationRule[]>;
  onChange?: (values: Record<string, any>) => void;
}

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export interface PageProps extends BaseComponentProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  loading?: boolean;
  error?: Error | string;
}

export interface Breadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

// Utility component types
export interface InfiniteScrollProps extends BaseComponentProps {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: ReactNode;
  endMessage?: ReactNode;
}

export interface VirtualListProps<T> extends BaseComponentProps {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export interface ResizableProps extends BaseComponentProps {
  defaultSize?: { width?: number; height?: number };
  minSize?: { width?: number; height?: number };
  maxSize?: { width?: number; height?: number };
  resizable?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  onResize?: (size: { width: number; height: number }) => void;
}

export interface DraggableProps extends BaseComponentProps {
  handle?: string;
  axis?: 'x' | 'y' | 'both' | 'none';
  bounds?: 'parent' | HTMLElement | { left?: number; top?: number; right?: number; bottom?: number };
  defaultPosition?: { x: number; y: number };
  position?: { x: number; y: number };
  onDrag?: (e: MouseEvent, data: { x: number; y: number; deltaX: number; deltaY: number }) => void;
  onStart?: (e: MouseEvent, data: { x: number; y: number }) => void;
  onStop?: (e: MouseEvent, data: { x: number; y: number }) => void;
}

// Export all component types
export type AnyComponentProps = 
  | BaseComponentProps
  | InteractiveComponentProps
  | ButtonProps
  | InputProps
  | ModalProps
  | DropdownProps<any>
  | AvatarProps
  | BadgeProps
  | SkeletonProps
  | ToastProps
  | TooltipProps
  | ContextMenuProps
  | MessageItemProps
  | ConversationItemProps
  | ChatHeaderProps
  | ChatInputProps
  | MessageListProps
  | EmojiPickerProps
  | VoiceRecorderProps
  | FileUploadProps
  | ImagePreviewProps
  | TypingIndicatorProps
  | OnlineIndicatorProps
  | SearchBarProps
  | TabsProps
  | EmptyStateProps
  | LoadingStateProps
  | ErrorStateProps
  | FormProps
  | FormFieldProps
  | LayoutProps
  | PageProps
  | InfiniteScrollProps
  | VirtualListProps<any>
  | ResizableProps
  | DraggableProps;