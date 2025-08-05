// Base exception class
abstract class AppException implements Exception {
  final String message;
  final String? code;

  const AppException(this.message, [this.code]);

  @override
  String toString() => message;
}

// Network exceptions
class NetworkException extends AppException {
  const NetworkException(String message, [String? code]) : super(message, code);
}

class ServerException extends AppException {
  const ServerException(String message, [String? code]) : super(message, code);
}

// Auth exceptions
class UnauthorizedException extends AppException {
  const UnauthorizedException(String message, [String? code]) : super(message, code);
}

class InvalidCredentialsException extends AppException {
  const InvalidCredentialsException(String message, [String? code]) : super(message, code);
}

// Request exceptions
class BadRequestException extends AppException {
  const BadRequestException(String message, [String? code]) : super(message, code);
}

class NotFoundException extends AppException {
  const NotFoundException(String message, [String? code]) : super(message, code);
}

// Cache exceptions
class CacheException extends AppException {
  const CacheException(String message, [String? code]) : super(message, code);
}

// Validation exceptions
class ValidationException extends AppException {
  final Map<String, List<String>>? errors;

  const ValidationException(String message, [this.errors, String? code]) : super(message, code);
}

// Permission exceptions
class PermissionException extends AppException {
  const PermissionException(String message, [String? code]) : super(message, code);
}

// File exceptions
class FileException extends AppException {
  const FileException(String message, [String? code]) : super(message, code);
}