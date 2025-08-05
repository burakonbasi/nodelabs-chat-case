import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/entities/user.dart';
import '../../domain/entities/message.dart';
import 'user_model.dart';
import 'message_model.dart';

part 'conversation_model.g.dart';

@JsonSerializable(explicitToJson: true)
class ConversationModel extends Conversation {
  @override
  @JsonKey(fromJson: _participantsFromJson)
  final List<User> participants;

  @override
  @JsonKey(fromJson: _messageFromJson)
  final Message? lastMessage;

  const ConversationModel({
    required String id,
    required ConversationType type,
    String? name,
    String? description,
    String? avatar,
    required this.participants,
    String? adminId,
    this.lastMessage,
    int unreadCount = 0,
    bool isPinned = false,
    bool isMuted = false,
    DateTime? mutedUntil,
    required DateTime createdAt,
    required DateTime updatedAt,
    Map<String, dynamic>? settings,
  }) : super(
          id: id,
          type: type,
          name: name,
          description: description,
          avatar: avatar,
          participants: participants,
          adminId: adminId,
          lastMessage: lastMessage,
          unreadCount: unreadCount,
          isPinned: isPinned,
          isMuted: isMuted,
          mutedUntil: mutedUntil,
          createdAt: createdAt,
          updatedAt: updatedAt,
          settings: settings,
        );

  factory ConversationModel.fromJson(Map<String, dynamic> json) => 
      _$ConversationModelFromJson(json);

  Map<String, dynamic> toJson() => _$ConversationModelToJson(this);

  static List<User> _participantsFromJson(List<dynamic> json) =>
      json.map((e) => UserModel.fromJson(e as Map<String, dynamic>)).toList();

  static Message? _messageFromJson(Map<String, dynamic>? json) =>
      json != null ? MessageModel.fromJson(json) : null;

  factory ConversationModel.fromEntity(Conversation conversation) {
    return ConversationModel(
      id: conversation.id,
      type: conversation.type,
      name: conversation.name,
      description: conversation.description,
      avatar: conversation.avatar,
      participants: conversation.participants,
      adminId: conversation.adminId,
      lastMessage: conversation.lastMessage,
      unreadCount: conversation.unreadCount,
      isPinned: conversation.isPinned,
      isMuted: conversation.isMuted,
      mutedUntil: conversation.mutedUntil,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      settings: conversation.settings,
    );
  }

  Conversation toEntity() => this;
}

// Extension to handle enum serialization
extension ConversationTypeExtension on ConversationType {
  String get value => toString().split('.').last;
  
  static ConversationType fromString(String value) {
    return ConversationType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => ConversationType.direct,
    );
  }
}