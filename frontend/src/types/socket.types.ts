import { 
    UserResponse, 
    MessageResponse, 
    ConversationResponse,
    CallResponse,
    ReactionResponse,
    UserStatus,
    MessageStatus,
    CallStatus
  } from './api.types';
  
  // Socket connection events
  export interface SocketConnectionEvents {
    connect: () => void;
    disconnect: (reason: string) => void;
    connect_error: (error: Error) => void;
    reconnect: (attemptNumber: number) => void;
    reconnect_attempt: (attemptNumber: number) => void;
    reconnect_error: (error: Error) => void;
    reconnect_failed: () => void;
  }
  
  // Authentication events
  export interface SocketAuthEvents {
    'auth:success': (data: { user: UserResponse }) => void;
    'auth:error': (data: { error: string }) => void;
    'auth:logout': (data: { reason?: string }) => void;
    'auth:token_expired': () => void;
  }
  
  // Message events
  export interface SocketMessageEvents {
    'message:new': (data: MessageEventData) => void;
    'message:update': (data: MessageUpdateEventData) => void;
    'message:delete': (data: MessageDeleteEventData) => void;
    'message:delivered': (data: MessageStatusEventData) => void;
    'message:read': (data: MessageStatusEventData) => void;
    'message:reaction_add': (data: ReactionEventData) => void;
    'message:reaction_remove': (data: ReactionEventData) => void;
  }
  
  export interface MessageEventData {
    message: MessageResponse;
    conversationId: string;
  }
  
  export interface MessageUpdateEventData {
    messageId: string;
    conversationId: string;
    content: string;
    editedAt: string;
  }
  
  export interface MessageDeleteEventData {
    messageId: string;
    conversationId: string;
    deletedBy: string;
    deletedAt: string;
  }
  
  export interface MessageStatusEventData {
    messageId: string;
    conversationId: string;
    userId: string;
    status: MessageStatus;
    timestamp: string;
  }
  
  export interface ReactionEventData {
    messageId: string;
    conversationId: string;
    reaction: ReactionResponse;
  }
  
  // Conversation events
  export interface SocketConversationEvents {
    'conversation:create': (data: ConversationEventData) => void;
    'conversation:update': (data: ConversationUpdateEventData) => void;
    'conversation:delete': (data: ConversationDeleteEventData) => void;
    'conversation:participant_add': (data: ParticipantEventData) => void;
    'conversation:participant_remove': (data: ParticipantEventData) => void;
    'conversation:participant_update': (data: ParticipantUpdateEventData) => void;
  }
  
  export interface ConversationEventData {
    conversation: ConversationResponse;
  }
  
  export interface ConversationUpdateEventData {
    conversationId: string;
    updates: Partial<ConversationResponse>;
  }
  
  export interface ConversationDeleteEventData {
    conversationId: string;
    deletedBy: string;
    deletedAt: string;
  }
  
  export interface ParticipantEventData {
    conversationId: string;
    participant: UserResponse;
    addedBy?: string;
    removedBy?: string;
  }
  
  export interface ParticipantUpdateEventData {
    conversationId: string;
    participantId: string;
    role?: 'member' | 'admin';
    permissions?: string[];
  }
  
  // Typing events
  export interface SocketTypingEvents {
    'typing:start': (data: TypingEventData) => void;
    'typing:stop': (data: TypingEventData) => void;
  }
  
  export interface TypingEventData {
    conversationId: string;
    userId: string;
    user: UserResponse;
  }
  
  // Presence events
  export interface SocketPresenceEvents {
    'presence:update': (data: PresenceEventData) => void;
    'presence:status_change': (data: StatusChangeEventData) => void;
    'presence:last_seen': (data: LastSeenEventData) => void;
  }
  
  export interface PresenceEventData {
    userId: string;
    isOnline: boolean;
    lastSeen?: string;
  }
  
  export interface StatusChangeEventData {
    userId: string;
    status: UserStatus;
    customMessage?: string;
  }
  
  export interface LastSeenEventData {
    userId: string;
    lastSeen: string;
    conversationId?: string;
  }
  
  // Call events
  export interface SocketCallEvents {
    'call:incoming': (data: CallEventData) => void;
    'call:accepted': (data: CallEventData) => void;
    'call:declined': (data: CallDeclinedEventData) => void;
    'call:ended': (data: CallEndedEventData) => void;
    'call:participant_joined': (data: CallParticipantEventData) => void;
    'call:participant_left': (data: CallParticipantEventData) => void;
    'call:ice_candidate': (data: ICECandidateEventData) => void;
    'call:offer': (data: RTCSignalEventData) => void;
    'call:answer': (data: RTCSignalEventData) => void;
    'call:renegotiate': (data: RTCSignalEventData) => void;
  }
  
  export interface CallEventData {
    call: CallResponse;
    from?: UserResponse;
  }
  
  export interface CallDeclinedEventData {
    callId: string;
    declinedBy: string;
    reason?: string;
  }
  
  export interface CallEndedEventData {
    callId: string;
    endedBy?: string;
    duration: number;
    reason?: string;
  }
  
  export interface CallParticipantEventData {
    callId: string;
    participant: UserResponse;
    timestamp: string;
  }
  
  export interface ICECandidateEventData {
    callId: string;
    candidate: RTCIceCandidateInit;
    from: string;
  }
  
  export interface RTCSignalEventData {
    callId: string;
    signal: RTCSessionDescriptionInit;
    from: string;
  }
  
  // Notification events
  export interface SocketNotificationEvents {
    'notification:new': (data: NotificationEventData) => void;
    'notification:read': (data: NotificationReadEventData) => void;
    'notification:clear': (data: NotificationClearEventData) => void;
  }
  
  export interface NotificationEventData {
    id: string;
    type: string;
    title: string;
    body: string;
    icon?: string;
    data?: Record<string, any>;
    timestamp: string;
  }
  
  export interface NotificationReadEventData {
    notificationIds: string[];
    readAt: string;
  }
  
  export interface NotificationClearEventData {
    clearedAt: string;
  }
  
  // Friend/Contact events
  export interface SocketContactEvents {
    'contact:request': (data: ContactRequestEventData) => void;
    'contact:accept': (data: ContactAcceptEventData) => void;
    'contact:decline': (data: ContactDeclineEventData) => void;
    'contact:remove': (data: ContactRemoveEventData) => void;
    'contact:block': (data: ContactBlockEventData) => void;
    'contact:unblock': (data: ContactUnblockEventData) => void;
  }
  
  export interface ContactRequestEventData {
    from: UserResponse;
    message?: string;
    requestedAt: string;
  }
  
  export interface ContactAcceptEventData {
    contact: UserResponse;
    acceptedAt: string;
  }
  
  export interface ContactDeclineEventData {
    userId: string;
    declinedAt: string;
  }
  
  export interface ContactRemoveEventData {
    userId: string;
    removedBy: string;
    removedAt: string;
  }
  
  export interface ContactBlockEventData {
    userId: string;
    blockedAt: string;
    reason?: string;
  }
  
  export interface ContactUnblockEventData {
    userId: string;
    unblockedAt: string;
  }
  
  // File/Media events
  export interface SocketMediaEvents {
    'media:upload_progress': (data: UploadProgressEventData) => void;
    'media:upload_complete': (data: UploadCompleteEventData) => void;
    'media:upload_failed': (data: UploadFailedEventData) => void;
  }
  
  export interface UploadProgressEventData {
    uploadId: string;
    progress: number;
    bytesUploaded: number;
    totalBytes: number;
  }
  
  export interface UploadCompleteEventData {
    uploadId: string;
    url: string;
    metadata: Record<string, any>;
  }
  
  export interface UploadFailedEventData {
    uploadId: string;
    error: string;
    code?: string;
  }
  
  // System events
  export interface SocketSystemEvents {
    'system:maintenance': (data: MaintenanceEventData) => void;
    'system:announcement': (data: AnnouncementEventData) => void;
    'system:rate_limit': (data: RateLimitEventData) => void;
  }
  
  export interface MaintenanceEventData {
    scheduled: boolean;
    startTime: string;
    duration?: number;
    message: string;
  }
  
  export interface AnnouncementEventData {
    id: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    expiresAt?: string;
  }
  
  export interface RateLimitEventData {
    limit: number;
    remaining: number;
    resetAt: string;
  }
  
  // Combined socket events interface
  export interface SocketEvents extends 
    SocketConnectionEvents,
    SocketAuthEvents,
    SocketMessageEvents,
    SocketConversationEvents,
    SocketTypingEvents,
    SocketPresenceEvents,
    SocketCallEvents,
    SocketNotificationEvents,
    SocketContactEvents,
    SocketMediaEvents,
    SocketSystemEvents {}
  
  // Client to server events
  export interface ClientToServerEvents {
    // Authentication
    'auth:login': (data: { token: string }) => void;
    'auth:logout': () => void;
    
    // Messages
    'message:send': (data: SendMessageData) => void;
    'message:update': (data: UpdateMessageData) => void;
    'message:delete': (data: DeleteMessageData) => void;
    'message:mark_read': (data: MarkReadData) => void;
    'message:react': (data: ReactMessageData) => void;
    
    // Typing
    'typing:start': (data: { conversationId: string }) => void;
    'typing:stop': (data: { conversationId: string }) => void;
    
    // Presence
    'presence:update': (data: { status: UserStatus; customMessage?: string }) => void;
    
    // Conversations
    'conversation:join': (data: { conversationId: string }) => void;
    'conversation:leave': (data: { conversationId: string }) => void;
    
    // Calls
    'call:initiate': (data: InitiateCallData) => void;
    'call:accept': (data: { callId: string }) => void;
    'call:decline': (data: { callId: string; reason?: string }) => void;
    'call:end': (data: { callId: string }) => void;
    'call:signal': (data: CallSignalData) => void;
  }
  
  // Client to server data types
  export interface SendMessageData {
    conversationId: string;
    content?: string;
    type: string;
    attachments?: string[];
    replyTo?: string;
    mentions?: string[];
  }
  
  export interface UpdateMessageData {
    messageId: string;
    conversationId: string;
    content: string;
  }
  
  export interface DeleteMessageData {
    messageId: string;
    conversationId: string;
  }
  
  export interface MarkReadData {
    conversationId: string;
    messageIds: string[];
  }
  
  export interface ReactMessageData {
    messageId: string;
    conversationId: string;
    emoji: string;
    action: 'add' | 'remove';
  }
  
  export interface InitiateCallData {
    type: 'voice' | 'video';
    participantIds: string[];
  }
  
  export interface CallSignalData {
    callId: string;
    targetUserId: string;
    signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
  }
  
  // Server to client acknowledgments
  export interface ServerAcknowledgments {
    'message:sent': (data: { tempId: string; messageId: string }) => void;
    'message:updated': (data: { messageId: string }) => void;
    'message:deleted': (data: { messageId: string }) => void;
    'message:read_receipt': (data: { messageIds: string[] }) => void;
    'error': (data: { error: string; code?: string }) => void;
  }
  
  // Socket instance type
  export interface TypedSocket {
    on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void;
    off<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void;
    emit<K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>): void;
    once<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void;
    connect(): void;
    disconnect(): void;
    connected: boolean;
    id: string;
  }
  
  // Export all socket types
  export type { SocketEvents as SocketEventsMap };