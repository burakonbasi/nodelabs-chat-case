import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_event.dart';
import '../../blocs/auth/auth_state.dart';
import '../../blocs/chat/chat_bloc.dart';
import '../../blocs/chat/chat_event.dart';
import '../../blocs/chat/chat_state.dart';
import '../../../domain/entities/conversation.dart';
import '../../../domain/entities/user.dart';
import '../../widgets/conversation_tile.dart';
import 'user_search_page.dart';

class ConversationsPage extends StatefulWidget {
  const ConversationsPage({super.key});

  @override
  State<ConversationsPage> createState() => _ConversationsPageState();
}

class _ConversationsPageState extends State<ConversationsPage> {
  final ScrollController _scrollController = ScrollController();
  User? _currentUser;

  @override
  void initState() {
    super.initState();
    _initializeChat();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _initializeChat() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      _currentUser = authState.user;
      context.read<ChatBloc>().add(InitializeChatEvent());
    }
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      // TODO: Implement pagination
      // context.read<ChatBloc>().add(LoadConversationsEvent(page: nextPage));
    }
  }

  void _navigateToUserSearch() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const UserSearchPage()),
    );
  }

  void _navigateToChat(Conversation conversation) {
    context.push('/chat/${conversation.id}', extra: conversation);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chats'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _navigateToUserSearch,
            tooltip: 'Search users',
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'profile':
                  context.push('/profile');
                  break;
                case 'settings':
                  context.push('/settings');
                  break;
                case 'logout':
                  _showLogoutDialog();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person_outline),
                    SizedBox(width: 12),
                    Text('Profile'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'settings',
                child: Row(
                  children: [
                    Icon(Icons.settings_outlined),
                    SizedBox(width: 12),
                    Text('Settings'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 12),
                    Text('Logout'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
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
        },
        builder: (context, state) {
          if (state.isLoadingConversations && state.conversations.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.conversations.isEmpty) {
            return _buildEmptyState();
          }

          return RefreshIndicator(
            onRefresh: () async {
              context.read<ChatBloc>().add(
                    const LoadConversationsEvent(refresh: true),
                  );
            },
            child: ListView.builder(
              controller: _scrollController,
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: state.conversations.length +
                  (state.isLoadingConversations ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == state.conversations.length) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: CircularProgressIndicator(),
                    ),
                  );
                }

                final conversation = state.conversations[index];
                return ConversationTile(
                  conversation: conversation,
                  currentUserId: _currentUser?.id ?? '',
                  isOnline: _isUserOnline(conversation, state),
                  onTap: () => _navigateToChat(conversation),
                  onLongPress: () => _showConversationOptions(conversation),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToUserSearch,
        child: const Icon(Icons.message),
        tooltip: 'New chat',
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 80,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No conversations yet',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Start a conversation by searching for users',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _navigateToUserSearch,
            icon: const Icon(Icons.add),
            label: const Text('Start a chat'),
          ),
        ],
      ),
    );
  }

  bool _isUserOnline(Conversation conversation, ChatState state) {
    if (conversation.isDirect && conversation.participants.length == 2) {
      final otherUser = conversation.participants.firstWhere(
        (user) => user.id != _currentUser?.id,
        orElse: () => conversation.participants.first,
      );
      return state.isUserOnline(otherUser.id);
    }
    return false;
  }

  void _showConversationOptions(Conversation conversation) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(
                conversation.isPinned ? Icons.push_pin : Icons.push_pin_outlined,
              ),
              title: Text(conversation.isPinned ? 'Unpin' : 'Pin'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement pin/unpin
              },
            ),
            ListTile(
              leading: Icon(
                conversation.isMuted
                    ? Icons.notifications_off
                    : Icons.notifications_outlined,
              ),
              title: Text(conversation.isMuted ? 'Unmute' : 'Mute'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement mute/unmute
              },
            ),
            if (conversation.type != ConversationType.direct)
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: const Text('Group info'),
                onTap: () {
                  Navigator.pop(context);
                  // TODO: Navigate to group info
                },
              ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.delete_outline, color: Colors.red),
              title: const Text('Delete chat', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(context);
                _confirmDeleteConversation(conversation);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteConversation(Conversation conversation) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete chat?'),
        content: const Text(
          'This will delete all messages in this chat. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement delete conversation
            },
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthBloc>().add(LogoutEvent());
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }
}