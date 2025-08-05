import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/constants/storage_constants.dart';
import '../../../core/errors/exceptions.dart';
import '../../models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<String?> getToken();
  Future<void> saveToken(String token);
  Future<void> deleteToken();
  
  Future<UserModel?> getCurrentUser();
  Future<void> saveCurrentUser(UserModel user);
  Future<void> deleteCurrentUser();
  
  Future<void> clearAuthData();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final FlutterSecureStorage _secureStorage;

  AuthLocalDataSourceImpl({required FlutterSecureStorage secureStorage})
      : _secureStorage = secureStorage;

  @override
  Future<String?> getToken() async {
    try {
      return await _secureStorage.read(key: StorageConstants.authToken);
    } catch (e) {
      throw CacheException('Failed to get auth token');
    }
  }

  @override
  Future<void> saveToken(String token) async {
    try {
      await _secureStorage.write(
        key: StorageConstants.authToken,
        value: token,
      );
    } catch (e) {
      throw CacheException('Failed to save auth token');
    }
  }

  @override
  Future<void> deleteToken() async {
    try {
      await _secureStorage.delete(key: StorageConstants.authToken);
    } catch (e) {
      throw CacheException('Failed to delete auth token');
    }
  }

  @override
  Future<UserModel?> getCurrentUser() async {
    try {
      final userJson = await _secureStorage.read(key: StorageConstants.cachedUser);
      if (userJson == null) return null;
      
      final userData = json.decode(userJson) as Map<String, dynamic>;
      return UserModel.fromJson(userData);
    } catch (e) {
      throw CacheException('Failed to get current user');
    }
  }

  @override
  Future<void> saveCurrentUser(UserModel user) async {
    try {
      final userJson = json.encode(user.toJson());
      await _secureStorage.write(
        key: StorageConstants.cachedUser,
        value: userJson,
      );
      
      // Also save commonly used fields for quick access
      await _secureStorage.write(
        key: StorageConstants.userId,
        value: user.id,
      );
      await _secureStorage.write(
        key: StorageConstants.userEmail,
        value: user.email,
      );
      await _secureStorage.write(
        key: StorageConstants.userName,
        value: user.username,
      );
    } catch (e) {
      throw CacheException('Failed to save current user');
    }
  }

  @override
  Future<void> deleteCurrentUser() async {
    try {
      await _secureStorage.delete(key: StorageConstants.cachedUser);
      await _secureStorage.delete(key: StorageConstants.userId);
      await _secureStorage.delete(key: StorageConstants.userEmail);
      await _secureStorage.delete(key: StorageConstants.userName);
    } catch (e) {
      throw CacheException('Failed to delete current user');
    }
  }

  @override
  Future<void> clearAuthData() async {
    try {
      await deleteToken();
      await deleteCurrentUser();
      // Clear any other auth-related data
      await _secureStorage.delete(key: StorageConstants.refreshToken);
    } catch (e) {
      throw CacheException('Failed to clear auth data');
    }
  }
}