export interface User {
    _id: string;
    username: string;
    email: string;
    lastSeen: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Message {
    _id: string;
    conversationId: string;
    senderId: User | string;
    receiverId: User | string;
    content: string;
    readAt?: string;
    edited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount?: Map<string, number>;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
      user: User;
      accessToken: string;
      refreshToken: string;
    };
  }
  
  export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: unknown[];
  }
  
  export interface PaginationData {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
  
  export interface MessageResponse {
    messages: Message[];
    pagination: PaginationData;
  }
  
  export interface ConversationResponse {
    conversations: Conversation[];
    pagination: PaginationData;
  }
  
  export interface OnlineUser {
    userId: string;
    socketId?: string;
  }
  
  export interface SocketEvents {
    // Incoming events
    message_received: (data: { message: Message; conversationId: string }) => void;
    message_sent: (data: { message: Message; conversationId: string }) => void;
    user_online: (data: { userId: string }) => void;
    user_offline: (data: { userId: string }) => void;
    user_typing: (data: { userId: string; conversationId: string }) => void;
    user_stopped_typing: (data: { userId: string; conversationId: string }) => void;
    new_message: (data: { message: Message }) => void;
    error: (data: { message: string }) => void;
  
    // Outgoing events
    join_room: (conversationId: string) => void;
    send_message: (data: { receiverId: string; content: string }) => void;
    typing_start: (data: { conversationId: string; receiverId: string }) => void;
    typing_stop: (data: { conversationId: string; receiverId: string }) => void;
  }
  
  // Form types
  export interface LoginForm {
    email: string;
    password: string;
  }
  
  export interface RegisterForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface MessageForm {
    content: string;
  }