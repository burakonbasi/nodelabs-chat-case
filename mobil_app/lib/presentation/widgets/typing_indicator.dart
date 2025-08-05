import 'package:flutter/material.dart';
import '../../domain/entities/conversation.dart';
import 'user_avatar.dart';

class TypingIndicator extends StatefulWidget {
  final List<String> userIds;
  final Conversation conversation;

  const TypingIndicator({
    super.key,
    required this.userIds,
    required this.conversation,
  });

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
    
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final typingUsers = widget.conversation.participants
        .where((user) => widget.userIds.contains(user.id))
        .toList();

    if (typingUsers.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (typingUsers.length == 1)
            UserAvatar(
              user: typingUsers.first,
              radius: 16,
            )
          else
            Stack(
              children: [
                for (int i = 0; i < typingUsers.take(2).length; i++)
                  Padding(
                    padding: EdgeInsets.only(left: i * 20.0),
                    child: UserAvatar(
                      user: typingUsers[i],
                      radius: 16,
                    ),
                  ),
              ],
            ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceVariant,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (typingUsers.length == 1)
                  Text(
                    '${typingUsers.first.displayName} is typing',
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  )
                else if (typingUsers.length == 2)
                  Text(
                    '${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing',
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  )
                else
                  Text(
                    '${typingUsers.length} people are typing',
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                const SizedBox(width: 4),
                AnimatedBuilder(
                  animation: _animation,
                  builder: (context, child) {
                    return Row(
                      children: List.generate(3, (index) {
                        final delay = index * 0.2;
                        final value = (_animation.value - delay).clamp(0.0, 1.0);
                        final opacity = value < 0.5 ? value * 2 : 2 - value * 2;
                        
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 1),
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.onSurfaceVariant
                                  .withOpacity(opacity),
                              shape: BoxShape.circle,
                            ),
                          ),
                        );
                      }),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}