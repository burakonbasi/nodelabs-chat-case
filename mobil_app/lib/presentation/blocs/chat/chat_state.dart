import 'package:equatable/equatable.dart';
import '../../../domain/entities/conversation.dart';
import '../../../domain/entities/message.dart';
import '../../../domain/entities/user.dart';

class ChatState extends Equatable {
  final List<Conversation> conversations;
  final Map<String, List<Message>> messages; // conversationId -> messages
  final Map<String, Map<String, bool>> typingIndicators; // conversationId -> userId -> isTyping
  final List<User> searchResults;
  final bool isConnected;
  final bool isLoadingConversations;
  final bool isLoadingMessages;
  final bool isSendingMessage;
  final bool isSearching;
  final String? error;
  final String? currentConversationId;
  final Map<String, int> unreadCounts; // conversationId -> count
  final Set<String> onlineUsers;

  const ChatState({
    this.conversations = const [],
    this.messages = const {},
    this.typingIndicators = const {},
    this.searchResults = const [],
    this.isConnected = false,
    this.isLoadingConversations = false,
    this.isLoadingMessages = false,
    this.isSendingMessage = false,
    this.isSearching = false,
    this.error,
    this.currentConversationId,
    this.unreadCounts = const {},
    this.onlineUsers = const {},
  });

  @override
  List<Object?> get props => [
        conversations,
        messages,
        typingIndicators,
        searchResults,
        isConnected,
        isLoadingConversations,
        isLoadingMessages,
        isSendingMessage,
        isSearching,
        error,
        currentConversationId,
        unreadCounts,
        onlineUsers,
      ];

  ChatState copyWith({
    List<Conversation>? conversations,
    Map<String, List<Message>>? messages,
    Map<String, Map<String, bool>>? typingIndicators,
    List<User>? searchResults,
    bool? isConnected,
    bool? isLoadingConversations,
    bool? isLoadingMessages,
    bool? isSendingMessage,
    bool? isSearching,
    String? error,
    String? currentConversationId,
    Map<String, int>? unreadCounts,
    Set<String>? onlineUsers,
  }) {
    return ChatState(
      conversations: conversations ?? this.conversations,
      messages: messages ?? this.messages,
      typingIndicators: typingIndicators ?? this.typingIndicators,
      searchResults: searchResults ?? this.searchResults,
      isConnected: isConnected ?? this.isConnected,
      isLoadingConversations: isLoadingConversations ?? this.isLoadingConversations,
      isLoadingMessages: isLoadingMessages ?? this.isLoadingMessages,
      isSendingMessage: isSendingMessage ?? this.isSendingMessage,
      isSearching: isSearching ?? this.isSearching,
      error: error,
      currentConversationId: currentConversationId ?? this.currentConversationId,
      unreadCounts: unreadCounts ?? this.unreadCounts,
      onlineUsers: onlineUsers ?? this.onlineUsers,
    );
  }

  // Helper methods
  List<Message> getMessagesForConversation(String conversationId) {
    return messages[conversationId] ?? [];
  }

  Map<String, bool> getTypingIndicatorsForConversation(String conversationId) {
    return typingIndicators[conversationId] ?? {};
  }

  int getUnreadCount(String conversationId) {
    return unreadCounts[conversationId] ?? 0;
  }

  bool isUserOnline(String userId) {
    return onlineUsers.contains(userId);
  }

  // Add message to state
  ChatState addMessage(Message message) {
    final updatedMessages = Map<String, List<Message>>.from(messages);
    final conversationMessages = List<Message>.from(
      updatedMessages[message.conversationId] ?? [],
    );
    
    // Add message if it doesn't exist
    if (!conversationMessages.any((m) => m.id == message.id)) {
      conversationMessages.add(message);
      // Sort by creation date
      conversationMessages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    }
    
    updatedMessages[message.conversationId] = conversationMessages;

    // Update conversation's last message
    final updatedConversations = conversations.map((conv) {
      if (conv.id == message.conversationId) {
        return Conversation(
          id: conv.id,
          type: conv.type,
          name: conv.name,
          description: conv.description,
          avatar: conv.avatar,
          participants: conv.participants,
          adminId: conv.adminId,
          lastMessage: message,
          unreadCount: conv.unreadCount,
          isPinned: conv.isPinned,
          isMuted: conv.isMuted,
          mutedUntil: conv.mutedUntil,
          createdAt: conv.createdAt,
          updatedAt: DateTime.now(),
          settings: conv.settings,
        );
      }
      return conv;
    }).toList();

    // Sort conversations by last message time
    updatedConversations.sort((a, b) {
      final aTime = a.lastMessage?.createdAt ?? a.updatedAt;
      final bTime = b.lastMessage?.createdAt ?? b.updatedAt;
      return bTime.compareTo(aTime);
    });

    return copyWith(
      messages: updatedMessages,
      conversations: updatedConversations,
    );
  }

  // Update message status
  ChatState updateMessageStatus(String messageId, MessageStatus status) {
    final updatedMessages = Map<String, List<Message>>.from(messages);
    
    updatedMessages.forEach((convId, messageList) {
      final index = messageList.indexWhere((m) => m.id == messageId);
      if (index != -1) {
        final updatedMessage = Message(
          id: messageList[index].id,
          conversationId: messageList[index].conversationId,
          sender: messageList[index].sender,
          content: messageList[index].content,
          type: messageList[index].type,
          status: status,
          metadata: messageList[index].metadata,
          replyToId: messageList[index].replyToId,
          replyTo: messageList[index].replyTo,
          readBy: messageList[index].readBy,
          deliveredTo: messageList[index].deliveredTo,
          createdAt: messageList[index].createdAt,
          editedAt: messageList[index].editedAt,
          isDeleted: messageList[index].isDeleted,
        );
        messageList[index] = updatedMessage;
      }
    });

    return copyWith(messages: updatedMessages);
  }
}