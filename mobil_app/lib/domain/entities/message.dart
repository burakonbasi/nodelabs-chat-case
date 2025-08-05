import 'package:equatable/equatable.dart';
import 'user.dart';

enum MessageType {
  text,
  image,
  file,
  voice,
  video,
  location,
  system
}

enum MessageStatus {
  pending,
  sent,
  delivered,
  read,
  failed
}

class Message extends Equatable {
  final String id;
  final String conversationId;
  final User sender;
  final String content;
  final MessageType type;
  final MessageStatus status;
  final Map<String, dynamic>? metadata; // For file info, location coords, etc.
  final String? replyToId;
  final Message? replyTo;
  final List<String> readBy;
  final List<String> deliveredTo;
  final DateTime createdAt;
  final DateTime? editedAt;
  final bool isDeleted;

  const Message({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.content,
    required this.type,
    required this.status,
    this.metadata,
    this.replyToId,
    this.replyTo,
    this.readBy = const [],
    this.deliveredTo = const [],
    required this.createdAt,
    this.editedAt,
    this.isDeleted = false,
  });

  // Helper methods
  bool get isEdited => editedAt != null;
  
  bool isReadBy(String userId) => readBy.contains(userId);
  
  bool isDeliveredTo(String userId) => deliveredTo.contains(userId);

  // Get file info from metadata
  String? get fileName => metadata?['fileName'];
  int? get fileSize => metadata?['fileSize'];
  String? get fileUrl => metadata?['fileUrl'];
  String? get mimeType => metadata?['mimeType'];

  // Get image info from metadata
  String? get imageUrl => metadata?['imageUrl'];
  String? get thumbnailUrl => metadata?['thumbnailUrl'];
  int? get imageWidth => metadata?['width'];
  int? get imageHeight => metadata?['height'];

  // Get voice info from metadata
  int? get voiceDuration => metadata?['duration'];
  String? get voiceUrl => metadata?['voiceUrl'];

  // Get location info from metadata
  double? get latitude => metadata?['latitude'];
  double? get longitude => metadata?['longitude'];
  String? get locationName => metadata?['locationName'];

  @override
  List<Object?> get props => [
        id,
        conversationId,
        sender,
        content,
        type,
        status,
        metadata,
        replyToId,
        replyTo,
        readBy,
        deliveredTo,
        createdAt,
        editedAt,
        isDeleted,
      ];
}