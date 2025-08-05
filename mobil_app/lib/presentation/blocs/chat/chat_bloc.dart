import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/repositories/chat_repository.dart';
import '../../../core/network/socket_client.dart';
import '../../../core/errors/exceptions.dart';
import '../../../core/constants/api_constants.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository _chatRepository;
  final SocketClient _socketClient;
  
  StreamSubscription? _messageStreamSubscription;
  StreamSubscription? _conversationStreamSubscription;
  StreamSubscription? _typingStreamSubscription;

  ChatBloc({
    required ChatRepository chatRepository,
    required SocketClient socketClient,
  })  : _chatRepository = chatRepository,
        _socketClient = socketClient,
        super(const ChatState()) {
    // Register event handlers
    on<InitializeChatEvent>(_onInitializeChat);
    on<LoadConversationsEvent>(_onLoadConversations);
    on<LoadMessagesEvent>(_onLoadMessages);
    on<SendMessageEvent>(_onSendMessage);
    on<CreateConversationEvent>(_onCreateConversation);
    on<MarkMessagesAsReadEvent>(_onMarkMessagesAsRead);
    on<SendTypingIndicatorEvent>(_onSendTypingIndicator);
    on<SearchUsersEvent>(_onSearchUsers);
    on<ReceiveMessageEvent>(_onReceiveMessage);
    on<UpdateConversationEvent>(_onUpdateConversation);
    on<ReceiveTypingIndicatorEvent>(_onReceiveTypingIndicator);
    on<UpdateUserOnlineStatusEvent>(_onUpdateUserOnlineStatus);
    on<DisposeChatEvent>(_onDispose);
  }

  // Initialize chat
  Future<void> _onInitializeChat(
    InitializeChatEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      // Connect socket
      await _chatRepository.connectSocket();
      emit(state.copyWith(isConnected: true));

      // Setup socket listeners
      _setupSocketListeners();

      // Load initial conversations
      add(const LoadConversationsEvent());
    } catch (e) {
      emit(state.copyWith(
        error: 'Failed to initialize chat: ${e.toString()}',
        isConnected: false,
      ));
    }
  }

  // Setup socket listeners
  void _setupSocketListeners() {
    // Listen for new messages
    _socketClient.on(ApiConstants.socketNewMessage, (data) {
      // Parse message from data and add event
      // add(ReceiveMessageEvent(message));
    });

    // Listen for typing indicators
    _socketClient.on(ApiConstants.socketTyping, (data) {
      add(ReceiveTypingIndicatorEvent(
        conversationId: data['conversationId'],
        userId: data['userId'],
        isTyping: true,
      ));
    });

    _socketClient.on(ApiConstants.socketStopTyping, (data) {
      add(ReceiveTypingIndicatorEvent(
        conversationId: data['conversationId'],
        userId: data['userId'],
        isTyping: false,
      ));
    });

    // Listen for user online status
    _socketClient.on(ApiConstants.socketUserOnline, (data) {
      add(UpdateUserOnlineStatusEvent(
        userId: data['userId'],
        isOnline: true,
      ));
    });

    _socketClient.on(ApiConstants.socketUserOffline, (data) {
      add(UpdateUserOnlineStatusEvent(
        userId: data['userId'],
        isOnline: false,
      ));
    });

    // Subscribe to streams from repository
    _messageStreamSubscription = _chatRepository.getMessageStream().listen(
      (message) => add(ReceiveMessageEvent(message)),
    );

    _conversationStreamSubscription = _chatRepository.getConversationStream().listen(
      (conversation) => add(UpdateConversationEvent(conversation)),
    );
  }

  // Load conversations
  Future<void> _onLoadConversations(
    LoadConversationsEvent event,
    Emitter<ChatState> emit,
  ) async {
    if (state.isLoadingConversations && !event.refresh) return;

    emit(state.copyWith(
      isLoadingConversations: true,
      error: null,
    ));

    try {
      final conversations = await _chatRepository.getConversations(
        page: event.page,
      );

      if (event.refresh || event.page == 1) {
        emit(state.copyWith(
          conversations: conversations,
          isLoadingConversations: false,
        ));
      } else {
        // Append to existing conversations
        final updatedConversations = [...state.conversations, ...conversations];
        emit(state.copyWith(
          conversations: updatedConversations,
          isLoadingConversations: false,
        ));
      }
    } on ServerException catch (e) {
      emit(state.copyWith(
        isLoadingConversations: false,
        error: e.message,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoadingConversations: false,
        error: 'Failed to load conversations',
      ));
    }
  }

  // Load messages
  Future<void> _onLoadMessages(
    LoadMessagesEvent event,
    Emitter<ChatState> emit,
  ) async {
    if (state.isLoadingMessages && !event.refresh) return;

    emit(state.copyWith(
      isLoadingMessages: true,
      error: null,
      currentConversationId: event.conversationId,
    ));

    try {
      final messages = await _chatRepository.getMessages(
        conversationId: event.conversationId,
        page: event.page,
      );

      final updatedMessages = Map<String, List<Message>>.from(state.messages);
      
      if (event.refresh || event.page == 1) {
        updatedMessages[event.conversationId] = messages;
      } else {
        // Prepend older messages
        final existingMessages = updatedMessages[event.conversationId] ?? [];
        updatedMessages[event.conversationId] = [...messages, ...existingMessages];
      }

      // Join conversation room for real-time updates
      _socketClient.joinConversation(event.conversationId);

      emit(state.copyWith(
        messages: updatedMessages,
        isLoadingMessages: false,
      ));
    } on ServerException catch (e) {
      emit(state.copyWith(
        isLoadingMessages: false,
        error: e.message,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoadingMessages: false,
        error: 'Failed to load messages',
      ));
    }
  }

  // Send message
  Future<void> _onSendMessage(
    SendMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(state.copyWith(isSendingMessage: true, error: null));

    try {
      final message = await _chatRepository.sendMessage(
        conversationId: event.conversationId,
        content: event.content,
        type: event.type,
        metadata: event.metadata,
        replyToId: event.replyToId,
      );

      // Add message to state
      emit(state.addMessage(message).copyWith(isSendingMessage: false));
    } on ServerException catch (e) {
      emit(state.copyWith(
        isSendingMessage: false,
        error: e.message,
      ));
    } catch (e) {
      emit(state.copyWith(
        isSendingMessage: false,
        error: 'Failed to send message',
      ));
    }
  }

  // Create conversation
  Future<void> _onCreateConversation(
    CreateConversationEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(state.copyWith(isLoadingConversations: true, error: null));

    try {
      final conversation = await _chatRepository.createConversation(
        participantIds: event.participantIds,
        type: event.type,
        name: event.name,
        description: event.description,
      );

      // Add conversation to list
      final updatedConversations = [conversation, ...state.conversations];
      emit(state.copyWith(
        conversations: updatedConversations,
        isLoadingConversations: false,
      ));
    } on ServerException catch (e) {
      emit(state.copyWith(
        isLoadingConversations: false,
        error: e.message,
      ));
    } catch (e) {
      emit(state.copyWith(
        isLoadingConversations: false,
        error: 'Failed to create conversation',
      ));
    }
  }

  // Mark messages as read
  Future<void> _onMarkMessagesAsRead(
    MarkMessagesAsReadEvent event,
    Emitter<ChatState> emit,
  ) async {
    try {
      await _chatRepository.markAsRead(
        conversationId: event.conversationId,
        messageId: event.messageId,
      );

      // Update unread count
      final updatedUnreadCounts = Map<String, int>.from(state.unreadCounts);
      updatedUnreadCounts[event.conversationId] = 0;
      
      emit(state.copyWith(unreadCounts: updatedUnreadCounts));
    } catch (e) {
      // Silent fail for marking as read
      print('Failed to mark as read: $e');
    }
  }

  // Send typing indicator
  Future<void> _onSendTypingIndicator(
    SendTypingIndicatorEvent event,
    Emitter<ChatState> emit,
  ) async {
    _chatRepository.sendTypingIndicator(
      conversationId: event.conversationId,
      isTyping: event.isTyping,
    );
  }

  // Search users
  Future<void> _onSearchUsers(
    SearchUsersEvent event,
    Emitter<ChatState> emit,
  ) async {
    if (event.query.isEmpty) {
      emit(state.copyWith(searchResults: []));
      return;
    }

    emit(state.copyWith(isSearching: true, error: null));

    try {
      final users = await _chatRepository.searchUsers(event.query);
      emit(state.copyWith(
        searchResults: users,
        isSearching: false,
      ));
    } on ServerException catch (e) {
      emit(state.copyWith(
        isSearching: false,
        error: e.message,
      ));
    } catch (e) {
      emit(state.copyWith(
        isSearching: false,
        error: 'Failed to search users',
      ));
    }
  }

  // Handle incoming message
  Future<void> _onReceiveMessage(
    ReceiveMessageEvent event,
    Emitter<ChatState> emit,
  ) async {
    emit(state.addMessage(event.message));
    
    // Update unread count if not current conversation
    if (state.currentConversationId != event.message.conversationId) {
      final updatedUnreadCounts = Map<String, int>.from(state.unreadCounts);
      final currentCount = updatedUnreadCounts[event.message.conversationId] ?? 0;
      updatedUnreadCounts[event.message.conversationId] = currentCount + 1;
      
      emit(state.copyWith(unreadCounts: updatedUnreadCounts));
    }
  }

  // Handle conversation update
  Future<void> _onUpdateConversation(
    UpdateConversationEvent event,
    Emitter<ChatState> emit,
  ) async {
    final updatedConversations = state.conversations.map((conv) {
      return conv.id == event.conversation.id ? event.conversation : conv;
    }).toList();

    emit(state.copyWith(conversations: updatedConversations));
  }

  // Handle typing indicator
  Future<void> _onReceiveTypingIndicator(
    ReceiveTypingIndicatorEvent event,
    Emitter<ChatState> emit,
  ) async {
    final updatedTypingIndicators = Map<String, Map<String, bool>>.from(state.typingIndicators);
    
    if (!updatedTypingIndicators.containsKey(event.conversationId)) {
      updatedTypingIndicators[event.conversationId] = {};
    }
    
    updatedTypingIndicators[event.conversationId]![event.userId] = event.isTyping;
    
    emit(state.copyWith(typingIndicators: updatedTypingIndicators));
  }

  // Handle user online status
  Future<void> _onUpdateUserOnlineStatus(
    UpdateUserOnlineStatusEvent event,
    Emitter<ChatState> emit,
  ) async {
    final updatedOnlineUsers = Set<String>.from(state.onlineUsers);
    
    if (event.isOnline) {
      updatedOnlineUsers.add(event.userId);
    } else {
      updatedOnlineUsers.remove(event.userId);
    }
    
    emit(state.copyWith(onlineUsers: updatedOnlineUsers));
  }

  // Dispose resources
  Future<void> _onDispose(
    DisposeChatEvent event,
    Emitter<ChatState> emit,
  ) async {
    _messageStreamSubscription?.cancel();
    _conversationStreamSubscription?.cancel();
    _typingStreamSubscription?.cancel();
    _socketClient.disconnect();
    
    emit(const ChatState());
  }

  @override
  Future<void> close() {
    add(DisposeChatEvent());
    return super.close();
  }
}