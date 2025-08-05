import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/message.dart';
import '../../domain/entities/user.dart';
import 'user_model.dart';

part 'message_model.g.dart';

@JsonSerializable(explicitToJson: true)
class MessageModel extends Message {
  @override
  @JsonKey(fromJson: _userFromJson)
  final User sender;

  @override
  @JsonKey(fromJson: _messageFromJson)
  final Message? replyTo;

  const MessageModel({
    required String id,
    required String conversationId,
    required this.sender,
    required String content,
    required MessageType type,
    required MessageStatus status,
    Map<String, dynamic>? metadata,
    String? replyToId,
    this.replyTo,
    List<String> readBy = const [],
    List<String> deliveredTo = const [],
    required DateTime createdAt,
    DateTime? editedAt,
    bool isDeleted = false,
  }) : super(
          id: id,
          conversationId: conversationId,
          sender: sender,
          content: content,
          type: type,
          status: status,
          metadata: metadata,
          replyToId: replyToId,
          replyTo: replyTo,
          readBy: readBy,
          deliveredTo: deliveredTo,
          createdAt: createdAt,
          editedAt: editedAt,
          isDeleted: isDeleted,
        );

  factory MessageModel.fromJson(Map<String, dynamic> json) => _$MessageModelFromJson(json);

  Map<String, dynamic> toJson() => _$MessageModelToJson(this);

  static User _userFromJson(Map<String, dynamic> json) => UserModel.fromJson(json);
  
  static Message? _messageFromJson(Map<String, dynamic>? json) => 
      json != null ? MessageModel.fromJson(json) : null;

  factory MessageModel.fromEntity(Message message) {
    return MessageModel(
      id: message.id,
      conversationId: message.conversationId,
      sender: message.sender,
      content: message.content,
      type: message.type,
      status: message.status,
      metadata: message.metadata,
      replyToId: message.replyToId,
      replyTo: message.replyTo,
      readBy: message.readBy,
      deliveredTo: message.deliveredTo,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
    );
  }

  Message toEntity() => this;
}

// Extension to handle enum serialization
extension MessageTypeExtension on MessageType {
  String get value => toString().split('.').last;
  
  static MessageType fromString(String value) {
    return MessageType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => MessageType.text,
    );
  }
}

extension MessageStatusExtension on MessageStatus {
  String get value => toString().split('.').last;
  
  static MessageStatus fromString(String value) {
    return MessageStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => MessageStatus.pending,
    );
  }
}