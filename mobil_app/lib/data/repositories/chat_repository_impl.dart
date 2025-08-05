import 'dart:async';
import '../../domain/entities/conversation.dart';
import '../../domain/entities/message.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/chat_repository.dart';
import '../datasources/local/chat_local_datasource.dart';
import '../datasources/remote/chat_remote_datasource.dart';
import '../models/conversation_model.dart';
import '../models/message_model.dart';
import '../../core/network/socket_client.dart';
import '../../core/errors/exceptions.dart';
import '../../core/constants/api_constants.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ChatRemoteDataSource _remoteDataSource;
  final ChatLocalDataSource _localDataSource;
  final SocketClient _socketClient;
  final Connectivity _connectivity;

  // Stream controllers
  final _messageStreamController = StreamController<Message>.broadcast();
  final _conversationStreamController = StreamController<Conversation>.broadcast();
  final _typingStreamController = StreamController<Map<String, Map<String, bool>>>.broadcast();

  // Typing indicators state
  final Map<String, Map<String, bool>> _typingIndicators = {};

  ChatRepositoryImpl({
    required ChatRemoteDataSource remoteDataSource,
    required ChatLocalDataSource localDataSource,
    required SocketClient socketClient,
    required Connectivity connectivity,
  })  : _remoteDataSource = remoteDataSource,
        _localDataSource = localDataSource,
        _socketClient = socketClient,
        _connectivity = connectivity {
    // Initialize local database
    _localDataSource.initDatabase();
  }

  // Helper method to check network connectivity
  Future<bool> _isConnected() async {
    final connectivityResult = await _connectivity.checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  @override
  Future<List<Conversation>> getConversations({
    int page = 1,
    int limit = 15,
  }) async {
    try {
      if (await _isConnected()) {
        // Fetch from remote
        final conversations = await _remoteDataSource.getConversations(
          page: page,
          limit: limit,
        );
        
        // Cache the conversations
        if (page == 1) {
          await _localDataSource.cacheConversations(conversations);
        } else {
          // For pagination, cache individual conversations
          for (final conversation in conversations) {
            await _localDataSource.cacheConversation(conversation);
          }
        }
        
        return conversations.map((c) => c.toEntity()).toList();
      } else {
        // Offline mode - fetch from cache
        if (page == 1) {
          final cachedConversations = await _localDataSource.getCachedConversations();
          return cachedConversations.map((c) => c.toEntity()).toList();
        } else {
          // No pagination support in offline mode
          return [];
        }
      }
    } on ServerException {
      // If server error, try to get from cache
      if (page == 1) {
        final cachedConversations = await _localDataSource.getCachedConversations();
        if (cachedConversations.isNotEmpty) {
          return cachedConversations.map((c) => c.toEntity()).toList();
        }
      }
      rethrow;
    }
  }

  @override
  Future<Conversation> getConversation(String conversationId) async {
    try {
      if (await _isConnected()) {
        final conversation = await _remoteDataSource.getConversation(conversationId);
        await _localDataSource.cacheConversation(conversation);
        return conversation.toEntity();
      } else {
        // Try to get from cache
        final cachedConversations = await _localDataSource.getCachedConversations();
        final conversation = cachedConversations.firstWhere(
          (c) => c.id == conversationId,
          orElse: () => throw NotFoundException('Conversation not found in cache'),
        );
        return conversation.toEntity();
      }
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<Conversation> createConversation({
    required List<String> participantIds,
    ConversationType type = ConversationType.direct,
    String? name,
    String? description,
  }) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      final conversation = await _remoteDataSource.createConversation(
        participantIds: participantIds,
        type: type.value,
        name: name,
        description: description,
      );
      
      await _localDataSource.cacheConversation(conversation);
      
      // Emit to stream
      _conversationStreamController.add(conversation.toEntity());
      
      return conversation.toEntity();
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<Conversation> updateConversation({
    required String conversationId,
    String? name,
    String? description,
    String? avatar,
  }) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      final conversation = await _remoteDataSource.updateConversation(
        conversationId: conversationId,
        name: name,
        description: description,
        avatar: avatar,
      );
      
      await _localDataSource.cacheConversation(conversation);
      
      // Emit to stream
      _conversationStreamController.add(conversation.toEntity());
      
      return conversation.toEntity();
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<void> deleteConversation(String conversationId) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      await _remoteDataSource.deleteConversation(conversationId);
      await _localDataSource.deleteConversationCache(conversationId);
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<List<Message>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      if (await _isConnected()) {
        // Fetch from remote
        final messages = await _remoteDataSource.getMessages(
          conversationId: conversationId,
          page: page,
          limit: limit,
        );
        
        // Cache the messages
        if (page == 1) {
          await _localDataSource.cacheMessages(conversationId, messages);
        } else {
          // For pagination, cache individual messages
          for (final message in messages) {
            await _localDataSource.cacheMessage(message);
          }
        }
        
        return messages.map((m) => m.toEntity()).toList();
      } else {
        // Offline mode - fetch from cache
        if (page == 1) {
          final cachedMessages = await _localDataSource.getCachedMessages(conversationId);
          return cachedMessages.map((m) => m.toEntity()).toList();
        } else {
          // No pagination support in offline mode
          return [];
        }
      }
    } on ServerException {
      // If server error, try to get from cache
      if (page == 1) {
        final cachedMessages = await _localDataSource.getCachedMessages(conversationId);
        if (cachedMessages.isNotEmpty) {
          return cachedMessages.map((m) => m.toEntity()).toList();
        }
      }
      rethrow;
    }
  }

  @override
  Future<Message> sendMessage({
    required String conversationId,
    required String content,
    MessageType type = MessageType.text,
    Map<String, dynamic>? metadata,
    String? replyToId,
  }) async {
    if (!await _isConnected()) {
      // TODO: Implement offline message queue
      throw NetworkException('No internet connection');
    }

    try {
      final message = await _remoteDataSource.sendMessage(
        conversationId: conversationId,
        content: content,
        type: type.value,
        metadata: metadata,
        replyToId: replyToId,
      );
      
      await _localDataSource.cacheMessage(message);
      
      // Emit to stream
      _messageStreamController.add(message.toEntity());
      
      return message.toEntity();
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<Message> updateMessage({
    required String messageId,
    required String content,
  }) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      final message = await _remoteDataSource.updateMessage(
        messageId: messageId,
        content: content,
      );
      
      await _localDataSource.updateMessageCache(message);
      
      // Emit to stream
      _messageStreamController.add(message.toEntity());
      
      return message.toEntity();
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<void> deleteMessage(String messageId) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      await _remoteDataSource.deleteMessage(messageId);
      await _localDataSource.deleteMessageCache(messageId);
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<void> markAsDelivered({
    required String messageId,
    required String userId,
  }) async {
    if (!await _isConnected()) return;

    try {
      await _remoteDataSource.markAsDelivered(
        messageId: messageId,
        userId: userId,
      );
    } catch (e) {
      // Silent fail for delivery receipts
      print('Failed to mark as delivered: $e');
    }
  }

  @override
  Future<void> markAsRead({
    required String conversationId,
    required String messageId,
  }) async {
    if (!await _isConnected()) return;

    try {
      await _remoteDataSource.markAsRead(
        conversationId: conversationId,
        messageId: messageId,
      );
    } catch (e) {
      // Silent fail for read receipts
      print('Failed to mark as read: $e');
    }
  }

  @override
  void sendTypingIndicator({
    required String conversationId,
    required bool isTyping,
  }) {
    _socketClient.sendTyping(conversationId, isTyping);
  }

  @override
  Stream<Map<String, bool>> getTypingIndicators(String conversationId) {
    return _typingStreamController.stream
        .map((allIndicators) => allIndicators[conversationId] ?? {});
  }

  @override
  Stream<Message> getMessageStream() {
    return _messageStreamController.stream;
  }

  @override
  Stream<Conversation> getConversationStream() {
    return _conversationStreamController.stream;
  }

  @override
  Future<List<User>> searchUsers(String query) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      final users = await _remoteDataSource.searchUsers(query);
      return users.map((u) => u.toEntity()).toList();
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<User> getUser(String userId) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      final user = await _remoteDataSource.getUser(userId);
      return user.toEntity();
    } on ServerException {
      rethrow;
    }
  }

  @override
  Future<void> connectSocket() async {
    await _socketClient.connect();
    _setupSocketListeners();
  }

  @override
  void disconnectSocket() {
    _socketClient.disconnect();
  }

  @override
  Future<String> uploadFile({
    required String filePath,
    required String conversationId,
    Function(int, int)? onProgress,
  }) async {
    if (!await _isConnected()) {
      throw NetworkException('No internet connection');
    }

    try {
      return await _remoteDataSource.uploadFile(
        filePath: filePath,
        conversationId: conversationId,
        onProgress: onProgress,
      );
    } on ServerException {
      rethrow;
    }
  }

  // Setup socket listeners
  void _setupSocketListeners() {
    // Listen for new messages
    _socketClient.on(ApiConstants.socketNewMessage, (data) async {
      try {
        final message = MessageModel.fromJson(data);
        await _localDataSource.cacheMessage(message);
        _messageStreamController.add(message.toEntity());
      } catch (e) {
        print('Error handling new message: $e');
      }
    });

    // Listen for typing indicators
    _socketClient.on(ApiConstants.socketTyping, (data) {
      final conversationId = data['conversationId'] as String;
      final userId = data['userId'] as String;
      
      if (!_typingIndicators.containsKey(conversationId)) {
        _typingIndicators[conversationId] = {};
      }
      _typingIndicators[conversationId]![userId] = true;
      
      _typingStreamController.add(Map.from(_typingIndicators));
    });

    _socketClient.on(ApiConstants.socketStopTyping, (data) {
      final conversationId = data['conversationId'] as String;
      final userId = data['userId'] as String;
      
      _typingIndicators[conversationId]?.remove(userId);
      
      _typingStreamController.add(Map.from(_typingIndicators));
    });

    // Listen for message status updates
    _socketClient.on(ApiConstants.socketMessageDelivered, (data) async {
      try {
        final messageId = data['messageId'] as String;
        final userId = data['userId'] as String;
        // TODO: Update local message cache with delivery status
      } catch (e) {
        print('Error handling message delivered: $e');
      }
    });

    _socketClient.on(ApiConstants.socketMessageRead, (data) async {
      try {
        final messageId = data['messageId'] as String;
        final userId = data['userId'] as String;
        // TODO: Update local message cache with read status
      } catch (e) {
        print('Error handling message read: $e');
      }
    });
  }

  // Dispose resources
  void dispose() {
    _messageStreamController.close();
    _conversationStreamController.close();
    _typingStreamController.close();
  }
}