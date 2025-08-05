import '../entities/conversation.dart';
import '../entities/message.dart';
import '../entities/user.dart';

abstract class ChatRepository {
  // Conversations
  Future<List<Conversation>> getConversations({
    int page = 1,
    int limit = 15,
  });
  
  Future<Conversation> getConversation(String conversationId);
  
  Future<Conversation> createConversation({
    required List<String> participantIds,
    ConversationType type = ConversationType.direct,
    String? name,
    String? description,
  });
  
  Future<Conversation> updateConversation({
    required String conversationId,
    String? name,
    String? description,
    String? avatar,
  });
  
  Future<void> deleteConversation(String conversationId);
  
  // Messages
  Future<List<Message>> getMessages({
    required String conversationId,
    int page = 1,
    int limit = 20,
  });
  
  Future<Message> sendMessage({
    required String conversationId,
    required String content,
    MessageType type = MessageType.text,
    Map<String, dynamic>? metadata,
    String? replyToId,
  });
  
  Future<Message> updateMessage({
    required String messageId,
    required String content,
  });
  
  Future<void> deleteMessage(String messageId);
  
  // Message status
  Future<void> markAsDelivered({
    required String messageId,
    required String userId,
  });
  
  Future<void> markAsRead({
    required String conversationId,
    required String messageId,
  });
  
  // Typing indicators
  void sendTypingIndicator({
    required String conversationId,
    required bool isTyping,
  });
  
  Stream<Map<String, bool>> getTypingIndicators(String conversationId);
  
  // Real-time streams
  Stream<Message> getMessageStream();
  Stream<Conversation> getConversationStream();
  
  // Users
  Future<List<User>> searchUsers(String query);
  Future<User> getUser(String userId);
  
  // Socket connection
  Future<void> connectSocket();
  void disconnectSocket();
  
  // File upload
  Future<String> uploadFile({
    required String filePath,
    required String conversationId,
    Function(int, int)? onProgress,
  });
}