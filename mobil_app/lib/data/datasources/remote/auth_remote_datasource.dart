import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../core/errors/exceptions.dart';
import '../../models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<(UserModel, String)> login({
    required String email,
    required String password,
  });
  
  Future<(UserModel, String)> register({
    required String email,
    required String username,
    required String password,
  });
  
  Future<void> logout();
  
  Future<UserModel> getProfile();
  
  Future<UserModel> updateProfile({
    String? fullName,
    String? bio,
    String? avatar,
  });
  
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final ApiClient _apiClient;

  AuthRemoteDataSourceImpl({required ApiClient apiClient}) : _apiClient = apiClient;

  @override
  Future<(UserModel, String)> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        final userData = response.data['data']['user'];
        
        return (UserModel.fromJson(userData), token);
      } else {
        throw ServerException(response.data['message'] ?? 'Login failed');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Login failed: ${e.toString()}');
    }
  }

  @override
  Future<(UserModel, String)> register({
    required String email,
    required String username,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.register,
        data: {
          'email': email,
          'username': username,
          'password': password,
        },
      );

      if (response.data['success'] == true) {
        final token = response.data['data']['token'];
        final userData = response.data['data']['user'];
        
        return (UserModel.fromJson(userData), token);
      } else {
        throw ServerException(response.data['message'] ?? 'Registration failed');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Registration failed: ${e.toString()}');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiConstants.logout);
    } catch (e) {
      // Logout should not fail the app
      print('Logout error: $e');
    }
  }

  @override
  Future<UserModel> getProfile() async {
    try {
      final response = await _apiClient.get(ApiConstants.profile);

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to get profile');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to get profile: ${e.toString()}');
    }
  }

  @override
  Future<UserModel> updateProfile({
    String? fullName,
    String? bio,
    String? avatar,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (fullName != null) data['fullName'] = fullName;
      if (bio != null) data['bio'] = bio;
      if (avatar != null) data['avatar'] = avatar;

      final response = await _apiClient.put(
        ApiConstants.updateProfile,
        data: data,
      );

      if (response.data['success'] == true) {
        return UserModel.fromJson(response.data['data']);
      } else {
        throw ServerException(response.data['message'] ?? 'Failed to update profile');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to update profile: ${e.toString()}');
    }
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await _apiClient.post(
        '${ApiConstants.profile}/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.data['success'] != true) {
        throw ServerException(response.data['message'] ?? 'Failed to change password');
      }
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException('Failed to change password: ${e.toString()}');
    }
  }
}