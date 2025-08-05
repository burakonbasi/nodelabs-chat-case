import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String username;
  final String? fullName;
  final String? avatar;
  final String? bio;
  final bool isOnline;
  final DateTime? lastSeen;
  final DateTime createdAt;
  final DateTime updatedAt;

  const User({
    required this.id,
    required this.email,
    required this.username,
    this.fullName,
    this.avatar,
    this.bio,
    this.isOnline = false,
    this.lastSeen,
    required this.createdAt,
    required this.updatedAt,
  });

  // Helper method to get display name
  String get displayName => fullName ?? username;

  // Helper method to get initials
  String get initials {
    if (fullName != null && fullName!.isNotEmpty) {
      final names = fullName!.split(' ');
      if (names.length >= 2) {
        return '${names.first[0]}${names.last[0]}'.toUpperCase();
      }
      return fullName![0].toUpperCase();
    }
    return username[0].toUpperCase();
  }

  @override
  List<Object?> get props => [
        id,
        email,
        username,
        fullName,
        avatar,
        bio,
        isOnline,
        lastSeen,
        createdAt,
        updatedAt,
      ];
}