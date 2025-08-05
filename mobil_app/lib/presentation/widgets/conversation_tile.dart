import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../domain/entities/conversation.dart';
import '../../domain/entities/message.dart';
import '../../core/constants/app_constants.dart';

class ConversationTile extends StatelessWidget {
  final Conversation conversation;
  final String currentUserId;
  final bool isOnline;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;

  const ConversationTile({
    super.key,
    required this.conversation,
    required this.currentUserId,
    required this.isOnline,
    required this.onTap,
    this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final displayName = conversation.getDisplayName(currentUserId);
    final avatar = conversation.getAvatar(currentUserId);
    final initials = conversation.getInitials(currentUserId);
    final hasUnread = conversation.unreadCount > 0;

    return ListTile(
      onTap: onTap,
      onLongPress: onLongPress,
      leading: Stack(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
            backgroundImage: avatar != null
                ? CachedNetworkImageProvider(avatar)
                : null,
            child: avatar == null
                ? Text(
                    initials,
                    style: TextStyle(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  )
                : null,
          ),
          if (isOnline && conversation.isDirect)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: theme.colorScheme.surface,
                    width: 2,
                  ),
                ),
              ),
            ),
        ],
      ),
      title: Row(
        children: [
          if (conversation.isPinned)
            Padding(
              padding: const EdgeInsets.only(right: 4),
              child: Icon(
                Icons.push_pin,
                size: 16,
                color: theme.colorScheme.primary,
              ),
            ),
          Expanded(
            child: Text(
              displayName,
              style: TextStyle(
                fontWeight: hasUnread ? FontWeight.bold : FontWeight.normal,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _formatTime(conversation.lastMessage?.createdAt ?? conversation.updatedAt),
            style: TextStyle(
              fontSize: 12,
              color: hasUnread
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface.withOpacity(0.6),
              fontWeight: hasUnread ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
      subtitle: Row(
        children: [
          if (conversation.lastMessage != null) ...[
            // Message status icon for sent messages
            if (conversation.lastMessage!.sender.id == currentUserId) ...[
              Icon(
                _getMessageStatusIcon(conversation.lastMessage!.status),
                size: 16,
                color: _getMessageStatusColor(
                  conversation.lastMessage!.status,
                  theme,
                ),
              ),
              const SizedBox(width: 4),
            ],
            // Message type icon
            if (conversation.lastMessage!.type != MessageType.text) ...[
              Icon(
                _getMessageTypeIcon(conversation.lastMessage!.type),
                size: 16,
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
              const SizedBox(width: 4),
            ],
            // Message content
            Expanded(
              child: Text(
                _getMessagePreview(conversation.lastMessage!),
                style: TextStyle(
                  color: hasUnread
                      ? theme.colorScheme.onSurface
                      : theme.colorScheme.onSurface.withOpacity(0.6),
                  fontWeight: hasUnread ? FontWeight.w500 : FontWeight.normal,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ] else
            Expanded(
              child: Text(
                conversation.isGroup
                    ? 'Tap to start a group chat'
                    : 'Tap to start a conversation',
                style: TextStyle(
                  color: theme.colorScheme.onSurface.withOpacity(0.6),
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          // Muted icon
          if (conversation.isCurrentlyMuted) ...[
            const SizedBox(width: 4),
            Icon(
              Icons.notifications_off,
              size: 16,
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          ],
          // Unread count
          if (hasUnread) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                conversation.unreadCount > 99
                    ? '99+'
                    : conversation.unreadCount.toString(),
                style: TextStyle(
                  color: theme.colorScheme.onPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays == 0) {
      // Today - show time
      return DateFormat('HH:mm').format(dateTime);
    } else if (difference.inDays == 1) {
      // Yesterday
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      // This week - show day name
      return DateFormat('EEEE').format(dateTime);
    } else {
      // Older - show date
      return DateFormat('dd/MM/yy').format(dateTime);
    }
  }

  IconData _getMessageStatusIcon(MessageStatus status) {
    switch (status) {
      case MessageStatus.pending:
        return Icons.access_time;
      case MessageStatus.sent:
        return Icons.check;
      case MessageStatus.delivered:
        return Icons.done_all;
      case MessageStatus.read:
        return Icons.done_all;
      case MessageStatus.failed:
        return Icons.error_outline;
    }
  }

  Color _getMessageStatusColor(MessageStatus status, ThemeData theme) {
    switch (status) {
      case MessageStatus.pending:
      case MessageStatus.sent:
      case MessageStatus.delivered:
        return theme.colorScheme.onSurface.withOpacity(0.6);
      case MessageStatus.read:
        return theme.colorScheme.primary;
      case MessageStatus.failed:
        return Colors.red;
    }
  }

  IconData _getMessageTypeIcon(MessageType type) {
    switch (type) {
      case MessageType.text:
        return Icons.message;
      case MessageType.image:
        return Icons.image;
      case MessageType.file:
        return Icons.attach_file;
      case MessageType.voice:
        return Icons.mic;
      case MessageType.video:
        return Icons.videocam;
      case MessageType.location:
        return Icons.location_on;
      case MessageType.system:
        return Icons.info;
    }
  }

  String _getMessagePreview(Message message) {
    if (message.isDeleted) {
      return 'This message was deleted';
    }

    switch (message.type) {
      case MessageType.text:
        return message.content;
      case MessageType.image:
        return '📷 Photo';
      case MessageType.file:
        return '📎 ${message.fileName ?? 'File'}';
      case MessageType.voice:
        return '🎙️ Voice message';
      case MessageType.video:
        return '📹 Video';
      case MessageType.location:
        return '📍 Location';
      case MessageType.system:
        return message.content;
    }
  }
}