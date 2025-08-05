import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

// Check authentication status on app start
class CheckAuthStatusEvent extends AuthEvent {}

// Login event
class LoginEvent extends AuthEvent {
  final String email;
  final String password;

  const LoginEvent({
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [email, password];
}

// Register event
class RegisterEvent extends AuthEvent {
  final String email;
  final String username;
  final String password;
  final String confirmPassword;

  const RegisterEvent({
    required this.email,
    required this.username,
    required this.password,
    required this.confirmPassword,
  });

  @override
  List<Object?> get props => [email, username, password, confirmPassword];
}

// Logout event
class LogoutEvent extends AuthEvent {}

// Update profile event
class UpdateProfileEvent extends AuthEvent {
  final String? fullName;
  final String? bio;
  final String? avatar;

  const UpdateProfileEvent({
    this.fullName,
    this.bio,
    this.avatar,
  });

  @override
  List<Object?> get props => [fullName, bio, avatar];
}

// Change password event
class ChangePasswordEvent extends AuthEvent {
  final String currentPassword;
  final String newPassword;

  const ChangePasswordEvent({
    required this.currentPassword,
    required this.newPassword,
  });

  @override
  List<Object?> get props => [currentPassword, newPassword];
}