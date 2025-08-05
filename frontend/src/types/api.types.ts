// Base API response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    metadata?: ApiMetadata;
  }
  
  export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp?: string;
    path?: string;
  }
  
  export interface ApiMetadata {
    timestamp: string;
    version: string;
    requestId: string;
  }
  
  // Pagination types
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
  
  // Auth API types
  export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }
  
  export interface AuthResponse {
    user: UserResponse;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string;
  }
  
  export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  }
  
  export interface ForgotPasswordRequest {
    email: string;
  }
  
  export interface ResetPasswordRequest {
    token: string;
    password: string;
  }
  
  export interface VerifyEmailRequest {
    token: string;
  }
  
  export interface TwoFactorAuthRequest {
    userId: string;
    code: string;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }
  
  // User API types
  export interface UserResponse {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    avatar?: string;
    bio?: string;
    status: UserStatus;
    isOnline: boolean;
    lastSeen: string;
    isVerified: boolean;
    isPremium: boolean;
    settings?: UserSettings;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UpdateProfileRequest {
    username?: string;
    fullName?: string;
    bio?: string;
    avatar?: File;
    status?: UserStatus;
  }
  
  export interface UserSearchRequest {
    query: string;
    limit?: number;
    offset?: number;
    excludeContacts?: boolean;
  }
  
  export interface UserSettings {
    privacy: PrivacySettings;
    notifications: NotificationSettings;
    preferences: UserPreferences;
  }
  
  export interface PrivacySettings {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    about: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
    typing: boolean;
  }
  
  export interface NotificationSettings {
    messages: boolean;
    mentions: boolean;
    calls: boolean;
    sound: boolean;
    preview: boolean;
  }
  
  export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
  }
  
  export type UserStatus = 'online' | 'away' | 'dnd' | 'offline';
  
  // Message API types
  export interface MessageResponse {
    id: string;
    conversationId: string;
    sender: UserResponse;
    content?: string;
    type: MessageType;
    attachments?: AttachmentResponse[];
    replyTo?: MessageResponse;
    mentions?: string[];
    reactions?: ReactionResponse[];
    status: MessageStatus;
    edited: boolean;
    editedAt?: string;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface SendMessageRequest {
    conversationId: string;
    content?: string;
    type: MessageType;
    attachments?: File[];
    replyTo?: string;
    mentions?: string[];
  }
  
  export interface UpdateMessageRequest {
    content: string;
  }
  
  export interface MessageSearchRequest {
    query: string;
    conversationId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    type?: MessageType;
    limit?: number;
    offset?: number;
  }
  
  export interface ForwardMessageRequest {
    messageIds: string[];
    conversationIds: string[];
  }
  
  export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact';
  export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  
  // Attachment API types
  export interface AttachmentResponse {
    id: string;
    url: string;
    thumbnailUrl?: string;
    name: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }
  
  export interface UploadAttachmentRequest {
    file: File;
    type: 'image' | 'video' | 'audio' | 'document';
  }
  
  export interface UploadAttachmentResponse {
    attachment: AttachmentResponse;
    uploadUrl?: string;
  }
  
  // Reaction API types
  export interface ReactionResponse {
    id: string;
    emoji: string;
    user: UserResponse;
    createdAt: string;
  }
  
  export interface AddReactionRequest {
    messageId: string;
    emoji: string;
  }
  
  export interface RemoveReactionRequest {
    messageId: string;
    reactionId: string;
  }
  
  // Conversation API types
  export interface ConversationResponse {
    id: string;
    type: 'direct' | 'group';
    name?: string;
    avatar?: string;
    description?: string;
    participants: UserResponse[];
    admins?: string[];
    lastMessage?: MessageResponse;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    isArchived: boolean;
    settings?: ConversationSettings;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateConversationRequest {
    type: 'direct' | 'group';
    participantIds: string[];
    name?: string;
    avatar?: File;
    description?: string;
  }
  
  export interface UpdateConversationRequest {
    name?: string;
    avatar?: File;
    description?: string;
    settings?: Partial<ConversationSettings>;
  }
  
  export interface AddParticipantsRequest {
    conversationId: string;
    participantIds: string[];
  }
  
  export interface RemoveParticipantRequest {
    conversationId: string;
    participantId: string;
  }
  
  export interface ConversationSettings {
    allowGuestMessages: boolean;
    allowMemberInvites: boolean;
    showMessageHistory: boolean;
    encryptionEnabled: boolean;
  }
  
  // Call API types
  export interface CallResponse {
    id: string;
    type: 'voice' | 'video';
    status: CallStatus;
    participants: CallParticipantResponse[];
    startTime?: string;
    endTime?: string;
    duration?: number;
  }
  
  export interface CallParticipantResponse {
    user: UserResponse;
    joinedAt: string;
    leftAt?: string;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor';
  }
  
  export interface InitiateCallRequest {
    type: 'voice' | 'video';
    participantIds: string[];
  }
  
  export interface JoinCallRequest {
    callId: string;
    offer?: RTCSessionDescriptionInit;
  }
  
  export interface CallSignalRequest {
    callId: string;
    targetUserId: string;
    signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
  }
  
  export type CallStatus = 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'failed' | 'missed';
  
  // Notification API types
  export interface NotificationResponse {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    read: boolean;
    createdAt: string;
  }
  
  export interface MarkNotificationReadRequest {
    notificationIds: string[];
  }
  
  export interface NotificationPreferencesRequest {
    messages?: boolean;
    mentions?: boolean;
    calls?: boolean;
    updates?: boolean;
  }
  
  export type NotificationType = 'message' | 'mention' | 'call' | 'friend_request' | 'group_invite' | 'update';
  
  // Presence API types
  export interface PresenceUpdateRequest {
    status: UserStatus;
    customMessage?: string;
  }
  
  export interface TypingIndicatorRequest {
    conversationId: string;
    isTyping: boolean;
  }
  
  // Contact API types
  export interface ContactRequest {
    userId: string;
    message?: string;
  }
  
  export interface ContactResponse {
    id: string;
    user: UserResponse;
    status: 'pending' | 'accepted' | 'blocked';
    createdAt: string;
  }
  
  // Block API types
  export interface BlockUserRequest {
    userId: string;
    reason?: string;
  }
  
  export interface BlockedUserResponse {
    id: string;
    user: UserResponse;
    reason?: string;
    blockedAt: string;
  }
  
  // Report API types
  export interface ReportRequest {
    targetType: 'user' | 'message' | 'conversation';
    targetId: string;
    reason: string;
    description?: string;
    evidence?: string[];
  }
  
  export interface ReportResponse {
    id: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
    createdAt: string;
  }
  
  // Analytics API types
  export interface AnalyticsEventRequest {
    event: string;
    properties?: Record<string, any>;
    timestamp?: string;
  }
  
  export interface UserAnalyticsResponse {
    totalMessages: number;
    totalConversations: number;
    totalCalls: number;
    activeHours: Record<string, number>;
    topContacts: UserResponse[];
  }
  
  // Export all API types
  export * from './index';