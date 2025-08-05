import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../blocs/chat/chat_bloc.dart';
import '../../blocs/chat/chat_event.dart';
import '../../blocs/chat/chat_state.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import '../../../domain/entities/conversation.dart';
import '../../../domain/entities/message.dart';
import '../../../domain/entities/user.dart';
import '../../widgets/chat_bubble.dart';
import '../../widgets/typing_indicator.dart';
import '../../widgets/user_avatar.dart';
import '../../../core/constants/app_constants.dart';

class ChatPage extends StatefulWidget {
  final String conversationId;
  final Conversation? conversation;

  const ChatPage({
    super.key,
    required this.conversationId,
    this.conversation,
  });

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  
  User? _currentUser;
  Conversation? _conversation;
  Timer? _typingTimer;
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _conversation = widget.conversation;
    _initializeChat();
    _scrollController.addListener(_onScroll);
    _messageController.addListener(_onMessageChanged);
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _typingTimer?.cancel();
    super.dispose();
  }

  void _initializeChat() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      _currentUser = authState.user;
    }

    // Load messages
    context.read<ChatBloc>().add(
          LoadMessagesEvent(
            conversationId: widget.conversationId,
            refresh: true,
          ),
        );
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      // TODO: Implement pagination for older messages
    }
  }

  void _onMessageChanged() {
    if (_messageController.text.isNotEmpty && !_isTyping) {
      _isTyping = true;
      context.read<ChatBloc>().add(
            SendTypingIndicatorEvent(
              conversationId: widget.conversationId,
              isTyping: true,
            ),
          );
    } else if (_messageController.text.isEmpty && _isTyping) {
      _isTyping = false;
      context.read<ChatBloc>().add(
            SendTypingIndicatorEvent(
              conversationId: widget.conversationId,
              isTyping: false,
            ),
          );
    }

    // Reset typing timer
    _typingTimer?.cancel();
    if (_messageController.text.isNotEmpty) {
      _typingTimer = Timer(AppConstants.typingTimeout, () {
        if (_isTyping) {
          _isTyping = false;
          context.read<ChatBloc>().add(
                SendTypingIndicatorEvent(
                  conversationId: widget.conversationId,
                  isTyping: false,
                ),
              );
        }
      });
    }
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    context.read<ChatBloc>().add(
          SendMessageEvent(
            conversationId: widget.conversationId,
            content: text,
          ),
        );

    _messageController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: BlocConsumer<ChatBloc, ChatState>(
        listener: (context, state) {
          if (state.error != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.error!),
                backgroundColor: Colors.red,
              ),
            );
          }

          // Update conversation if needed
          if (_conversation == null) {
            final conversation = state.conversations.firstWhere(
              (conv) => conv.id == widget.conversationId,
              orElse: () => Conversation(
                id: widget.conversationId,
                type: ConversationType.direct,
                participants: [],
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              ),
            );
            if (conversation.participants.isNotEmpty) {
              setState(() {
                _conversation = conversation;
              });
            }
          }
        },
        builder: (context, state) {
          final messages = state.getMessagesForConversation(widget.conversationId);
          final typingUsers = state.getTypingIndicatorsForConversation(widget.conversationId);

          if (state.isLoadingMessages && messages.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          return Column(
            children: [
              // Messages list
              Expanded(
                child: GestureDetector(
                  onTap: () => FocusScope.of(context).unfocus(),
                  child: ListView.builder(
                    controller: _scrollController,
                    reverse: true,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    itemCount: messages.length + 
                        (typingUsers.isNotEmpty ? 1 : 0) +
                        (state.isLoadingMessages ? 1 : 0),
                    itemBuilder: (context, index) {
                      // Loading indicator
                      if (index == messages.length + (typingUsers.isNotEmpty ? 1 : 0)) {
                        return const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: CircularProgressIndicator(),
                          ),
                        );
                      }

                      // Typing indicator
                      if (typingUsers.isNotEmpty && index == 0) {
                        final typingUsersList = typingUsers.entries
                            .where((entry) => entry.value)
                            .map((entry) => entry.key)
                            .toList();
                        
                        if (typingUsersList.isNotEmpty) {
                          return TypingIndicator(
                            userIds: typingUsersList,
                            conversation: _conversation!,
                          );
                        }
                      }

                      // Message
                      final messageIndex = typingUsers.isNotEmpty ? index - 1 : index;
                      final message = messages[messages.length - 1 - messageIndex];
                      final previousMessage = messageIndex < messages.length - 1
                          ? messages[messages.length - 2 - messageIndex]
                          : null;
                      final nextMessage = messageIndex > 0
                          ? messages[messages.length - messageIndex]
                          : null;

                      final showAvatar = _shouldShowAvatar(
                        message,
                        previousMessage,
                        _currentUser!.id,
                      );
                      final showTime = _shouldShowTime(
                        message,
                        nextMessage,
                      );

                      return ChatBubble(
                        message: message,
                        isMe: message.sender.id == _currentUser!.id,
                        showAvatar: showAvatar,
                        showTime: showTime,
                        onReply: () => _handleReply(message),
                        onEdit: () => _handleEdit(message),
                        onDelete: () => _handleDelete(message),
                      );
                    },
                  ),
                ),
              ),
              // Input area
              _buildInputArea(context, state),
            ],
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    final theme = Theme.of(context);
    
    return AppBar(
      titleSpacing: 0,
      title: _conversation != null
          ? InkWell(
              onTap: () => _showConversationInfo(),
              child: Row(
                children: [
                  UserAvatar(
                    user: _getOtherUser(),
                    radius: 20,
                    showOnlineIndicator: true,
                    isOnline: context.watch<ChatBloc>().state.isUserOnline(
                          _getOtherUser().id,
                        ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _conversation!.getDisplayName(_currentUser!.id),
                          style: const TextStyle(fontSize: 18),
                        ),
                        if (_conversation!.isDirect)
                          BlocBuilder<ChatBloc, ChatState>(
                            builder: (context, state) {
                              final otherUser = _getOtherUser();
                              final isOnline = state.isUserOnline(otherUser.id);
                              
                              return Text(
                                isOnline ? 'Online' : 'Offline',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: theme.colorScheme.onSurface.withOpacity(0.7),
                                ),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            )
          : const Text('Loading...'),
      actions: [
        IconButton(
          icon: const Icon(Icons.videocam_outlined),
          onPressed: () {
            // TODO: Implement video call
          },
        ),
        IconButton(
          icon: const Icon(Icons.call_outlined),
          onPressed: () {
            // TODO: Implement voice call
          },
        ),
        PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'search':
                // TODO: Implement search in chat
                break;
              case 'media':
                // TODO: Show media gallery
                break;
              case 'mute':
                // TODO: Implement mute
                break;
              case 'clear':
                _confirmClearChat();
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'search',
              child: Text('Search'),
            ),
            const PopupMenuItem(
              value: 'media',
              child: Text('Media & files'),
            ),
            PopupMenuItem(
              value: 'mute',
              child: Text(_conversation?.isMuted ?? false ? 'Unmute' : 'Mute'),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(
              value: 'clear',
              child: Text('Clear chat'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInputArea(BuildContext context, ChatState state) {
    final theme = Theme.of(context);
    
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            // Attachment button
            IconButton(
              icon: const Icon(Icons.attach_file),
              onPressed: () => _showAttachmentOptions(),
            ),
            // Message input
            Expanded(
              child: Container(
                constraints: const BoxConstraints(maxHeight: 120),
                child: TextField(
                  controller: _messageController,
                  focusNode: _focusNode,
                  maxLines: null,
                  keyboardType: TextInputType.multiline,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: InputDecoration(
                    hintText: 'Type a message',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: theme.colorScheme.surface,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 4),
            // Send button
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: _messageController.text.trim().isEmpty
                  ? IconButton(
                      key: const ValueKey('voice'),
                      icon: const Icon(Icons.mic),
                      onPressed: () {
                        // TODO: Implement voice message
                      },
                    )
                  : IconButton(
                      key: const ValueKey('send'),
                      icon: Icon(
                        Icons.send,
                        color: theme.colorScheme.primary,
                      ),
                      onPressed: state.isSendingMessage ? null : _sendMessage,
                    ),
            ),
          ],
        ),
      ),
    );
  }

  User _getOtherUser() {
    if (_conversation == null || _conversation!.participants.isEmpty) {
      return User(
        id: '',
        email: '',
        username: 'Unknown',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }

    return _conversation!.participants.firstWhere(
      (user) => user.id != _currentUser?.id,
      orElse: () => _conversation!.participants.first,
    );
  }

  bool _shouldShowAvatar(Message message, Message? previousMessage, String currentUserId) {
    if (message.sender.id == currentUserId) return false;
    if (previousMessage == null) return true;
    if (previousMessage.sender.id != message.sender.id) return true;
    
    // Show avatar if more than 5 minutes between messages
    final timeDiff = message.createdAt.difference(previousMessage.createdAt);
    return timeDiff.inMinutes > 5;
  }

  bool _shouldShowTime(Message message, Message? nextMessage) {
    if (nextMessage == null) return true;
    
    // Show time if more than 5 minutes between messages
    final timeDiff = nextMessage.createdAt.difference(message.createdAt);
    return timeDiff.inMinutes > 5;
  }

  void _showConversationInfo() {
    // TODO: Navigate to conversation info page
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.image, color: Colors.blue),
              title: const Text('Gallery'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement image picker
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Colors.teal),
              title: const Text('Camera'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement camera
              },
            ),
            ListTile(
              leading: const Icon(Icons.insert_drive_file, color: Colors.purple),
              title: const Text('Document'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement file picker
              },
            ),
            ListTile(
              leading: const Icon(Icons.location_on, color: Colors.green),
              title: const Text('Location'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement location sharing
              },
            ),
          ],
        ),
      ),
    );
  }

  void _handleReply(Message message) {
    // TODO: Implement reply
  }

  void _handleEdit(Message message) {
    // TODO: Implement edit
  }

  void _handleDelete(Message message) {
    // TODO: Implement delete
  }

  void _confirmClearChat() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear chat?'),
        content: const Text(
          'This will clear all messages in this chat. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement clear chat
            },
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
}