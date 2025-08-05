import 'package:equatable/equatable.dart';
import '../../../domain/entities/message.dart';
import '../../../domain/entities/conversation.dart';

abstract class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

// Initialize chat (connect socket, load conversations)
class InitializeChatEvent extends ChatEvent {}

// Load conversations
class LoadConversationsEvent extends ChatEvent {
  final bool refresh;
  final int page;

  const LoadConversationsEvent({
    this.refresh = false,
    this.page = 1,
  });

  @override
  List<Object?> get props => [refresh, page];
}

// Load messages for a conversation
class LoadMessagesEvent extends ChatEvent {
  final String conversationId;
  final bool refresh;
  final int page;

  const LoadMessagesEvent({
    required this.conversationId,
    this.refresh = false,
    this.page = 1,
  });

  @override
  List<Object?> get props => [conversationId, refresh, page];
}

// Send a message
class SendMessageEvent extends ChatEvent {
  final String conversationId;
  final String content;
  final MessageType type;
  final Map<String, dynamic>? metadata;
  final String? replyToId;

  const SendMessageEvent({
    required this.conversationId,
    required this.content,
    this.type = MessageType.text,
    this.metadata,
    this.replyToId,
  });

  @override
  List<Object?> get props => [conversationId, content, type, metadata, replyToId];
}

// Create a new conversation
class CreateConversationEvent extends ChatEvent {
  final List<String> participantIds;
  final ConversationType type;
  final String? name;
  final String? description;

  const CreateConversationEvent({
    required this.participantIds,
    this.type = ConversationType.direct,
    this.name,
    this.description,
  });

  @override
  List<Object?> get props => [participantIds, type, name, description];
}

// Mark messages as read
class MarkMessagesAsReadEvent extends ChatEvent {
  final String conversationId;
  final String messageId;

  const MarkMessagesAsReadEvent({
    required this.conversationId,
    required this.messageId,
  });

  @override
  List<Object?> get props => [conversationId, messageId];
}

// Send typing indicator
class SendTypingIndicatorEvent extends ChatEvent {
  final String conversationId;
  final bool isTyping;

  const SendTypingIndicatorEvent({
    required this.conversationId,
    required this.isTyping,
  });

  @override
  List<Object?> get props => [conversationId, isTyping];
}

// Search users
class SearchUsersEvent extends ChatEvent {
  final String query;

  const SearchUsersEvent(this.query);

  @override
  List<Object?> get props => [query];
}

// Handle incoming message from socket
class ReceiveMessageEvent extends ChatEvent {
  final Message message;

  const ReceiveMessageEvent(this.message);

  @override
  List<Object?> get props => [message];
}

// Handle conversation update from socket
class UpdateConversationEvent extends ChatEvent {
  final Conversation conversation;

  const UpdateConversationEvent(this.conversation);

  @override
  List<Object?> get props => [conversation];
}

// Handle typing indicator from socket
class ReceiveTypingIndicatorEvent extends ChatEvent {
  final String conversationId;
  final String userId;
  final bool isTyping;

  const ReceiveTypingIndicatorEvent({
    required this.conversationId,
    required this.userId,
    required this.isTyping,
  });

  @override
  List<Object?> get props => [conversationId, userId, isTyping];
}

// Handle user online status
class UpdateUserOnlineStatusEvent extends ChatEvent {
  final String userId;
  final bool isOnline;

  const UpdateUserOnlineStatusEvent({
    required this.userId,
    required this.isOnline,
  });

  @override
  List<Object?> get props => [userId, isOnline];
}

// Clean up resources
class DisposeChatEvent extends ChatEvent {}