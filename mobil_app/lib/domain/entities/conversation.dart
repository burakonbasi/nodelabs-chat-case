import 'package:equatable/equatable.dart';
import 'user.dart';
import 'message.dart';

enum ConversationType {
  direct,
  group,
  channel
}

class Conversation extends Equatable {
  final String id;
  final ConversationType type;
  final String? name; // For groups and channels
  final String? description;
  final String? avatar;
  final List<User> participants;
  final String? adminId; // For groups and channels
  final Message? lastMessage;
  final int unreadCount;
  final bool isPinned;
  final bool isMuted;
  final DateTime? mutedUntil;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Map<String, dynamic>? settings; // Group/channel specific settings

  const Conversation({
    required this.id,
    required this.type,
    this.name,
    this.description,
    this.avatar,
    required this.participants,
    this.adminId,
    this.lastMessage,
    this.unreadCount = 0,
    this.isPinned = false,
    this.isMuted = false,
    this.mutedUntil,
    required this.createdAt,
    required this.updatedAt,
    this.settings,
  });

  // Helper methods
  bool get isGroup => type == ConversationType.group;
  bool get isChannel => type == ConversationType.channel;
  bool get isDirect => type == ConversationType.direct;
  
  bool get isCurrentlyMuted {
    if (!isMuted) return false;
    if (mutedUntil == null) return true;
    return mutedUntil!.isAfter(DateTime.now());
  }

  // Get conversation display name
  String getDisplayName(String currentUserId) {
    if (name != null && name!.isNotEmpty) {
      return name!;
    }
    
    // For direct conversations, show other participant's name
    if (isDirect && participants.length == 2) {
      final otherUser = participants.firstWhere(
        (user) => user.id != currentUserId,
        orElse: () => participants.first,
      );
      return otherUser.displayName;
    }
    
    // For groups without name, show participant names
    final otherParticipants = participants
        .where((user) => user.id != currentUserId)
        .take(3)
        .map((user) => user.displayName)
        .toList();
    
    if (otherParticipants.isEmpty) {
      return 'Empty conversation';
    }
    
    return otherParticipants.join(', ');
  }

  // Get conversation avatar or initials
  String? getAvatar(String currentUserId) {
    if (avatar != null) return avatar;
    
    // For direct conversations, show other participant's avatar
    if (isDirect && participants.length == 2) {
      final otherUser = participants.firstWhere(
        (user) => user.id != currentUserId,
        orElse: () => participants.first,
      );
      return otherUser.avatar;
    }
    
    return null;
  }

  // Get initials for avatar placeholder
  String getInitials(String currentUserId) {
    final displayName = getDisplayName(currentUserId);
    final names = displayName.split(' ');
    
    if (names.length >= 2) {
      return '${names.first[0]}${names.last[0]}'.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  // Check if user is admin
  bool isAdmin(String userId) => adminId == userId;

  // Get online participants count
  int get onlineParticipantsCount {
    return participants.where((user) => user.isOnline).length;
  }

  @override
  List<Object?> get props => [
        id,
        type,
        name,
        description,
        avatar,
        participants,
        adminId,
        lastMessage,
        unreadCount,
        isPinned,
        isMuted,
        mutedUntil,
        createdAt,
        updatedAt,
        settings,
      ];
}