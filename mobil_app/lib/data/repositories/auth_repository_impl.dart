import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/local/auth_local_datasource.dart';
import '../datasources/remote/auth_remote_datasource.dart';
import '../models/user_model.dart';
import '../../core/errors/exceptions.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final AuthLocalDataSource _localDataSource;

  AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required AuthLocalDataSource localDataSource,
  })  : _remoteDataSource = remoteDataSource,
        _localDataSource = localDataSource;

  @override
  Future<User> login({
    required String email,
    required String password,
  }) async {
    try {
      // Call remote login
      final (userModel, token) = await _remoteDataSource.login(
        email: email,
        password: password,
      );
      
      // Save token
      await _localDataSource.saveToken(token);
      
      // Save user data locally
      await _localDataSource.saveCurrentUser(userModel);
      
      return userModel.toEntity();
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Login failed: ${e.toString()}');
    }
  }

  @override
  Future<User> register({
    required String email,
    required String username,
    required String password,
  }) async {
    try {
      // Call remote register
      final (userModel, token) = await _remoteDataSource.register(
        email: email,
        username: username,
        password: password,
      );
      
      // Save token
      await _localDataSource.saveToken(token);
      
      // Save user data locally
      await _localDataSource.saveCurrentUser(userModel);
      
      return userModel.toEntity();
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Registration failed: ${e.toString()}');
    }
  }

  @override
  Future<void> logout() async {
    try {
      // Call remote logout
      await _remoteDataSource.logout();
    } finally {
      // Always clear local data, even if remote logout fails
      await _localDataSource.clearAuthData();
    }
  }

  @override
  Future<String?> getToken() async {
    try {
      return await _localDataSource.getToken();
    } on CacheException {
      return null;
    }
  }

  @override
  Future<void> saveToken(String token) async {
    try {
      await _localDataSource.saveToken(token);
    } on CacheException {
      throw ServerException('Failed to save authentication token');
    }
  }

  @override
  Future<void> deleteToken() async {
    try {
      await _localDataSource.deleteToken();
    } on CacheException {
      throw ServerException('Failed to delete authentication token');
    }
  }

  @override
  Future<User?> getCurrentUser() async {
    try {
      final userModel = await _localDataSource.getCurrentUser();
      return userModel?.toEntity();
    } on CacheException {
      return null;
    }
  }

  @override
  Future<void> saveCurrentUser(User user) async {
    try {
      final userModel = UserModel.fromEntity(user);
      await _localDataSource.saveCurrentUser(userModel);
    } on CacheException {
      throw ServerException('Failed to save user data');
    }
  }

  @override
  Future<void> deleteCurrentUser() async {
    try {
      await _localDataSource.deleteCurrentUser();
    } on CacheException {
      throw ServerException('Failed to delete user data');
    }
  }

  @override
  Future<User> getProfile() async {
    try {
      // Try to get from remote first
      final userModel = await _remoteDataSource.getProfile();
      
      // Update local cache
      await _localDataSource.saveCurrentUser(userModel);
      
      return userModel.toEntity();
    } on ServerException {
      // If remote fails, try to get from cache
      final cachedUser = await _localDataSource.getCurrentUser();
      if (cachedUser != null) {
        return cachedUser.toEntity();
      }
      rethrow;
    }
  }

  @override
  Future<User> updateProfile({
    String? fullName,
    String? bio,
    String? avatar,
  }) async {
    try {
      final userModel = await _remoteDataSource.updateProfile(
        fullName: fullName,
        bio: bio,
        avatar: avatar,
      );
      
      // Update local cache
      await _localDataSource.saveCurrentUser(userModel);
      
      return userModel.toEntity();
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to update profile: ${e.toString()}');
    }
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await _remoteDataSource.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to change password: ${e.toString()}');
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    try {
      final token = await _localDataSource.getToken();
      final user = await _localDataSource.getCurrentUser();
      
      return token != null && user != null;
    } catch (e) {
      return false;
    }
  }
}