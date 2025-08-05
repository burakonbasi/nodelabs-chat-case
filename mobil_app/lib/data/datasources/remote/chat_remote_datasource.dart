import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/socket_client.dart';
import '../../../core/errors/exceptions.dart';
import '../../models/conversation_model.dart';
import '../../models/message_model.dart';
import '../../models/user_model.dart';

abstract class ChatRemoteDataSource {
  // Conversations
  Future<List<ConversationModel>> getConversations({
    int page = 1,
    int limit = 15,
  });
  
  Future<ConversationModel> getConversation(String conversationId);
  
  Future<ConversationModel> createConversation({
    required List<String> participantIds,
    String type = 'direct',
    String? name,
    String? description,
  });
  
  Future<ConversationModel> updateConversation({
    required String conversationId,
    String? name,
    String? description,
    String? avatar,
  });
  
  Future<void> deleteConversation(String conversationId);
  
  // Messages
  Future<List<MessageModel>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 20,
  });
  
  Future<MessageModel> sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    Map<String, dynamic>? metadata,
    String? replyToId,
  });
  
  Future<MessageModel> updateMessage({
    required String messageId,
    required String content,
  });
  
  Future<void> deleteMessage(String messageId);
  
  Future<void> markAsDelivered({
    required String messageId,
    required String userId,
  });
  
  Future<void> markAsRead({
    required String conversationId,
    required String messageId,
  });
  
  // Users
  Future<List<UserModel>> searchUsers(String query);
  Future<UserModel> getUser(String userId);
  
  // File upload
  Future<String> uploadFile({
    required String filePath,
    required String conversationId,
    Function(int, int)? onProgress,
  });
}

class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  final ApiClient _apiClient;
  final SocketClient _socketClient;

  ChatRemoteDataSourceImpl({
    required ApiClient apiClient,
    required SocketClient socketClient,
  })  : _apiClient = apiClient,
        _socketClient = socketClient;

  @override
  Future<List<ConversationModel>> getConversations({
    int page = 1,
    int limit = 15,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.conversations,
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      if (response.data['success'] == true) {
        final List<dynamic> conversationsData = response.data['data'];
        return conversationsData
            .map((json) => ConversationModel.fromJson(json))
            .toList();
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to get conversations');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get conversations: ${e.toString()}');
    }
  }

  @override
  Future<ConversationModel> getConversation(String conversationId) async {
    try {
      final response = await _apiClient.get('${ApiConstants.conversations}/$conversationId');

      if (response.data['success'] == true) {
        return ConversationModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to get conversation');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get conversation: ${e.toString()}');
    }
  }

  @override
  Future<ConversationModel> createConversation({
    required List<String> participantIds,
    String type = 'direct',
    String? name,
    String? description,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.conversations,
        data: {
          'participantIds': participantIds,
          'type': type,
          if (name != null) 'name': name,
          if (description != null) 'description': description,
        },
      );

      if (response.data['success'] == true) {
        return ConversationModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to create conversation');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to create conversation: ${e.toString()}');
    }
  }

  @override
  Future<ConversationModel> updateConversation({
    required String conversationId,
    String? name,
    String? description,
    String? avatar,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (name != null) data['name'] = name;
      if (description != null) data['description'] = description;
      if (avatar != null) data['avatar'] = avatar;

      final response = await _apiClient.put(
        '${ApiConstants.conversations}/$conversationId',
        data: data,
      );

      if (response.data['success'] == true) {
        return ConversationModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to update conversation');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update conversation: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteConversation(String conversationId) async {
    try {
      final response = await _apiClient.delete(
        '${ApiConstants.conversations}/$conversationId',
      );

      if (response.data['success'] != true) {
        throw ServerException(response.data['message'] ?? 'Failed to delete conversation');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete conversation: ${e.toString()}');
    }
  }

  @override
  Future<List<MessageModel>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.messages,
        queryParameters: {
          'conversationId': conversationId,
          'page': page,
          'limit': limit,
        },
      );

      if (response.data['success'] == true) {
        final List<dynamic> messagesData = response.data['data'];
        return messagesData
            .map((json) => MessageModel.fromJson(json))
            .toList();
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to get messages');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get messages: ${e.toString()}');
    }
  }

  @override
  Future<MessageModel> sendMessage({
    required String conversationId,
    required String content,
    String type = 'text',
    Map<String, dynamic>? metadata,
    String? replyToId,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.sendMessage,
        data: {
          'conversationId': conversationId,
          'content': content,
          'type': type,
          if (metadata != null) 'metadata': metadata,
          if (replyToId != null) 'replyToId': replyToId,
        },
      );

      if (response.data['success'] == true) {
        return MessageModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to send message');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to send message: ${e.toString()}');
    }
  }

  @override
  Future<MessageModel> updateMessage({
    required String messageId,
    required String content,
  }) async {
    try {
      final response = await _apiClient.put(
        '${ApiConstants.messages}/$messageId',
        data: {
          'content': content,
        },
      );

      if (response.data['success'] == true) {
        return MessageModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to update message');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update message: ${e.toString()}');
    }
  }

  @override
  Future<void> deleteMessage(String messageId) async {
    try {
      final response = await _apiClient.delete(
        '${ApiConstants.messages}/$messageId',
      );

      if (response.data['success'] != true) {
        throw ServerException(response.data['message'] ?? 'Failed to delete message');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to delete message: ${e.toString()}');
    }
  }

  @override
  Future<void> markAsDelivered({
    required String messageId,
    required String userId,
  }) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.messages}/$messageId/delivered',
        data: {
          'userId': userId,
        },
      );

      if (response.data['success'] != true) {
        throw ServerException(response.data['message'] ?? 'Failed to mark as delivered');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to mark as delivered: ${e.toString()}');
    }
  }

  @override
  Future<void> markAsRead({
    required String conversationId,
    required String messageId,
  }) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.messages}/$messageId/read',
        data: {
          'conversationId': conversationId,
        },
      );

      if (response.data['success'] != true) {
        throw ServerException(response.data['message'] ?? 'Failed to mark as read');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to mark as read: ${e.toString()}');
    }
  }

  @override
  Future<List<UserModel>> searchUsers(String query) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.searchUsers,
        queryParameters: {
          'q': query,
        },
      );

      if (response.data['success'] == true) {
        final List<dynamic> usersData = response.data['data'];
        return usersData.map((json) => UserModel.fromJson(json)).toList();
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to search users');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to search users: ${e.toString()}');
    }
  }

  @override
  Future<UserModel> getUser(String userId) async {
    try {
      final response = await _apiClient.get('/users/$userId');

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to get user');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get user: ${e.toString()}');
    }
  }

  @override
  Future<String> uploadFile({
    required String filePath,
    required String conversationId,
    Function(int, int)? onProgress,
  }) async {
    try {
      final response = await _apiClient.uploadFile(
        '/upload',
        filePath,
        data: {
          'conversationId': conversationId,
        },
        onSendProgress: onProgress,
      );

      if (response.data['success'] == true) {
        return response.data['data']['url'];
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to upload file');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to upload file: ${e.toString()}');
    }
  }
}