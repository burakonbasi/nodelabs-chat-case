import 'package:equatable/equatable.dart';
import '../../../domain/entities/user.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

// Initial state
class AuthInitial extends AuthState {}

// Loading state
class AuthLoading extends AuthState {}

// Authenticated state
class AuthAuthenticated extends AuthState {
  final User user;
  final String token;

  const AuthAuthenticated({
    required this.user,
    required this.token,
  });

  @override
  List<Object?> get props => [user, token];

  // Copy with method for updating user data
  AuthAuthenticated copyWith({
    User? user,
    String? token,
  }) {
    return AuthAuthenticated(
      user: user ?? this.user,
      token: token ?? this.token,
    );
  }
}

// Unauthenticated state
class AuthUnauthenticated extends AuthState {
  final String? message;

  const AuthUnauthenticated({this.message});

  @override
  List<Object?> get props => [message];
}

// Error state
class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

// Success state for operations like password change
class AuthOperationSuccess extends AuthState {
  final String message;

  const AuthOperationSuccess(this.message);

  @override
  List<Object?> get props => [message];
}