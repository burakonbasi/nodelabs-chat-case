import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../blocs/chat/chat_bloc.dart';
import '../../blocs/chat/chat_event.dart';
import '../../blocs/chat/chat_state.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import '../../../domain/entities/user.dart';
import '../../../domain/entities/conversation.dart';
import '../../widgets/user_avatar.dart';

class UserSearchPage extends StatefulWidget {
  const UserSearchPage({super.key});

  @override
  State<UserSearchPage> createState() => _UserSearchPageState();
}

class _UserSearchPageState extends State<UserSearchPage> {
  final _searchController = TextEditingController();
  final _debouncer = Debouncer(milliseconds: 500);
  String? _currentUserId;

  @override
  void initState() {
    super.initState();
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      _currentUserId = authState.user.id;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debouncer.run(() {
      if (query.trim().isNotEmpty) {
        context.read<ChatBloc>().add(SearchUsersEvent(query.trim()));
      }
    });
  }

  void _startConversation(User user) async {
    // Check if conversation already exists
    final chatState = context.read<ChatBloc>().state;
    final existingConversation = chatState.conversations.firstWhere(
      (conv) =>
          conv.isDirect &&
          conv.participants.any((p) => p.id == user.id) &&
          conv.participants.any((p) => p.id == _currentUserId),
      orElse: () => Conversation(
        id: '',
        type: ConversationType.direct,
        participants: [],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );

    if (existingConversation.id.isNotEmpty) {
      // Navigate to existing conversation
      context.pop();
      context.push('/chat/${existingConversation.id}', extra: existingConversation);
    } else {
      // Create new conversation
      context.read<ChatBloc>().add(
            CreateConversationEvent(
              participantIds: [user.id],
              type: ConversationType.direct,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Users'),
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Search by username or email',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(28),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
              ),
            ),
          ),
          // Search results
          Expanded(
            child: BlocConsumer<ChatBloc, ChatState>(
              listener: (context, state) {
                // Navigate to new conversation if created
                final conversation = state.conversations.firstOrNull;
                if (conversation != null && conversation.participants.length == 2) {
                  context.pop();
                  context.push('/chat/${conversation.id}', extra: conversation);
                }
              },
              builder: (context, state) {
                if (_searchController.text.isEmpty) {
                  return _buildEmptyState();
                }

                if (state.isSearching) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state.searchResults.isEmpty) {
                  return _buildNoResultsState();
                }

                return ListView.builder(
                  itemCount: state.searchResults.length,
                  itemBuilder: (context, index) {
                    final user = state.searchResults[index];
                    return _UserTile(
                      user: user,
                      currentUserId: _currentUserId!,
                      onTap: () => _startConversation(user),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search,
            size: 80,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'Search for users',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Find users by their username or email',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoResultsState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 80,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'No users found',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'Try searching with a different query',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
          ),
        ],
      ),
    );
  }
}

class _UserTile extends StatelessWidget {
  final User user;
  final String currentUserId;
  final VoidCallback onTap;

  const _UserTile({
    required this.user,
    required this.currentUserId,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isCurrentUser = user.id == currentUserId;

    return ListTile(
      onTap: isCurrentUser ? null : onTap,
      leading: UserAvatar(
        user: user,
        radius: 24,
        showOnlineIndicator: false,
      ),
      title: Text(
        user.displayName,
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: Text('@${user.username}'),
      trailing: isCurrentUser
          ? Chip(
              label: const Text('You'),
              backgroundColor:
                  Theme.of(context).colorScheme.primary.withOpacity(0.1),
            )
          : const Icon(Icons.message_outlined),
    );
  }
}

// Debouncer utility class
class Debouncer {
  final int milliseconds;
  Timer? _timer;

  Debouncer({required this.milliseconds});

  void run(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(Duration(milliseconds: milliseconds), action);
  }

  void dispose() {
    _timer?.cancel();
  }
}

// Import this at the top
import 'dart:async';