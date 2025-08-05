import '../entities/user.dart';

abstract class AuthRepository {
  // Authentication
  Future<User> login({
    required String email,
    required String password,
  });
  
  Future<User> register({
    required String email,
    required String username,
    required String password,
  });
  
  Future<void> logout();
  
  // Token management
  Future<String?> getToken();
  Future<void> saveToken(String token);
  Future<void> deleteToken();
  
  // User management
  Future<User?> getCurrentUser();
  Future<void> saveCurrentUser(User user);
  Future<void> deleteCurrentUser();
  
  // Profile
  Future<User> getProfile();
  Future<User> updateProfile({
    String? fullName,
    String? bio,
    String? avatar,
  });
  
  // Password
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  });
  
  // Check auth status
  Future<bool> isAuthenticated();
}