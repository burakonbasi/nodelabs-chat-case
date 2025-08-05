import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../domain/entities/message.dart';
import 'user_avatar.dart';

class ChatBubble extends StatelessWidget {
  final Message message;
  final bool isMe;
  final bool showAvatar;
  final bool showTime;
  final VoidCallback? onReply;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const ChatBubble({
    super.key,
    required this.message,
    required this.isMe,
    required this.showAvatar,
    required this.showTime,
    this.onReply,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    
    return Padding(
      padding: EdgeInsets.only(
        top: showTime ? 12 : 4,
        bottom: 4,
        left: isMe ? 48 : 0,
        right: isMe ? 0 : 48,
      ),
      child: Column(
        crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          if (showTime)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                _formatTime(message.createdAt),
                style: TextStyle(
                  fontSize: 12,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            ),
          Row(
            mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isMe && showAvatar) ...[
                UserAvatar(
                  user: message.sender,
                  radius: 16,
                ),
                const SizedBox(width: 8),
              ] else if (!isMe) 
                const SizedBox(width: 40),
              
              Flexible(
                child: GestureDetector(
                  onLongPress: () => _showMessageOptions(context),
                  child: Container(
                    padding: _getPadding(),
                    decoration: BoxDecoration(
                      color: _getBubbleColor(theme, isDarkMode),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isMe ? 16 : 4),
                        bottomRight: Radius.circular(isMe ? 4 : 16),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 2,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (message.replyTo != null)
                          _buildReplyPreview(context),
                        _buildMessageContent(context),
                        const SizedBox(height: 2),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (message.isEdited)
                              Text(
                                'Edited • ',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: _getTextColor(theme, isDarkMode).withOpacity(0.6),
                                ),
                              ),
                            Text(
                              DateFormat('HH:mm').format(message.createdAt),
                              style: TextStyle(
                                fontSize: 11,
                                color: _getTextColor(theme, isDarkMode).withOpacity(0.6),
                              ),
                            ),
                            if (isMe) ...[
                              const SizedBox(width: 4),
                              Icon(
                                _getStatusIcon(message.status),
                                size: 14,
                                color: _getStatusColor(message.status, theme),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  EdgeInsets _getPadding() {
    switch (message.type) {
      case MessageType.text:
      case MessageType.system:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case MessageType.image:
      case MessageType.video:
        return const EdgeInsets.all(4);
      default:
        return const EdgeInsets.all(12);
    }
  }

  Color _getBubbleColor(ThemeData theme, bool isDarkMode) {
    if (message.type == MessageType.system) {
      return theme.colorScheme.surface;
    }
    
    if (isMe) {
      return theme.colorScheme.primary;
    } else {
      return isDarkMode
          ? theme.colorScheme.surface
          : theme.colorScheme.surfaceVariant;
    }
  }

  Color _getTextColor(ThemeData theme, bool isDarkMode) {
    if (message.type == MessageType.system) {
      return theme.colorScheme.onSurface.withOpacity(0.6);
    }
    
    if (isMe) {
      return theme.colorScheme.onPrimary;
    } else {
      return theme.colorScheme.onSurface;
    }
  }

  Widget _buildReplyPreview(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: _getTextColor(theme, isDarkMode).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 3,
            height: 40,
            color: _getTextColor(theme, isDarkMode).withOpacity(0.3),
            margin: const EdgeInsets.only(right: 8),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message.replyTo!.sender.displayName,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _getTextColor(theme, isDarkMode).withOpacity(0.8),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _getMessagePreview(message.replyTo!),
                  style: TextStyle(
                    fontSize: 12,
                    color: _getTextColor(theme, isDarkMode).withOpacity(0.6),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageContent(BuildContext context) {
    final theme = Theme.of(context);
    final isDarkMode = theme.brightness == Brightness.dark;
    
    if (message.isDeleted) {
      return Text(
        'This message was deleted',
        style: TextStyle(
          fontStyle: FontStyle.italic,
          color: _getTextColor(theme, isDarkMode).withOpacity(0.6),
        ),
      );
    }

    switch (message.type) {
      case MessageType.text:
        return Text(
          message.content,
          style: TextStyle(
            color: _getTextColor(theme, isDarkMode),
            fontSize: 15,
          ),
        );
        
      case MessageType.image:
        return ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: 250,
              maxHeight: 250,
            ),
            child: CachedNetworkImage(
              imageUrl: message.imageUrl ?? '',
              placeholder: (context, url) => Container(
                width: 250,
                height: 250,
                color: theme.colorScheme.surface,
                child: const Center(child: CircularProgressIndicator()),
              ),
              errorWidget: (context, url, error) => Container(
                width: 250,
                height: 250,
                color: theme.colorScheme.surface,
                child: const Icon(Icons.error),
              ),
              fit: BoxFit.cover,
            ),
          ),
        );
        
      case MessageType.file:
        return Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: _getTextColor(theme, isDarkMode).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.insert_drive_file,
                color: _getTextColor(theme, isDarkMode),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      message.fileName ?? 'File',
                      style: TextStyle(
                        color: _getTextColor(theme, isDarkMode),
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (message.fileSize != null)
                      Text(
                        _formatFileSize(message.fileSize!),
                        style: TextStyle(
                          fontSize: 12,
                          color: _getTextColor(theme, isDarkMode).withOpacity(0.6),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
        
      case MessageType.voice:
        return Container(
          padding: const EdgeInsets.all(8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.play_arrow),
                onPressed: () {
                  // TODO: Implement voice playback
                },
                color: _getTextColor(theme, isDarkMode),
              ),
              // TODO: Add waveform visualization
              if (message.voiceDuration != null)
                Text(
                  _formatDuration(message.voiceDuration!),
                  style: TextStyle(
                    color: _getTextColor(theme, isDarkMode),
                  ),
                ),
            ],
          ),
        );
        
      case MessageType.location:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 200,
                height: 150,
                color: theme.colorScheme.surface,
                child: const Center(
                  child: Icon(Icons.location_on, size: 48),
                ),
                // TODO: Add map preview
              ),
            ),
            if (message.locationName != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  message.locationName!,
                  style: TextStyle(
                    color: _getTextColor(theme, isDarkMode),
                  ),
                ),
              ),
          ],
        );
        
      case MessageType.system:
        return Text(
          message.content,
          style: TextStyle(
            color: _getTextColor(theme, isDarkMode),
            fontSize: 13,
            fontStyle: FontStyle.italic,
          ),
          textAlign: TextAlign.center,
        );
        
      default:
        return Text(
          message.content,
          style: TextStyle(
            color: _getTextColor(theme, isDarkMode),
          ),
        );
    }
  }

  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays == 0) {
      return 'Today ${DateFormat('HH:mm').format(dateTime)}';
    } else if (difference.inDays == 1) {
      return 'Yesterday ${DateFormat('HH:mm').format(dateTime)}';
    } else if (difference.inDays < 7) {
      return DateFormat('EEEE HH:mm').format(dateTime);
    } else {
      return DateFormat('dd MMM yyyy HH:mm').format(dateTime);
    }
  }

  String _formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '$minutes:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  String _getMessagePreview(Message message) {
    if (message.isDeleted) return 'This message was deleted';
    
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
      default:
        return message.content;
    }
  }

  IconData _getStatusIcon(MessageStatus status) {
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

  Color _getStatusColor(MessageStatus status, ThemeData theme) {
    switch (status) {
      case MessageStatus.read:
        return theme.colorScheme.onPrimary;
      case MessageStatus.failed:
        return Colors.red;
      default:
        return theme.colorScheme.onPrimary.withOpacity(0.7);
    }
  }

  void _showMessageOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (message.type == MessageType.text)
              ListTile(
                leading: const Icon(Icons.copy),
                title: const Text('Copy'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Implement copy to clipboard
                },
              ),
            ListTile(
              leading: const Icon(Icons.reply),
              title: const Text('Reply'),
              onTap: () {
                Navigator.pop(context);
                onReply?.call();
              },
            ),
            if (isMe && message.type == MessageType.text)
              ListTile(
                leading: const Icon(Icons.edit),
                title: const Text('Edit'),
                onTap: () {
                  Navigator.pop(context);
                  onEdit?.call();
                },
              ),
            ListTile(
              leading: const Icon(Icons.forward),
              title: const Text('Forward'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement forward
              },
            ),
            if (isMe)
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title: const Text('Delete', style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  onDelete?.call();
                },
              ),
          ],
        ),
      ),
    );
  }
}