import '../../entities/user.dart';
import '../../repositories/auth_repository.dart';
import '../base_usecase.dart';
import '../../../core/errors/exceptions.dart';
import '../../../core/constants/app_constants.dart';

class RegisterUseCase extends UseCase<User, RegisterParams> {
  final AuthRepository _repository;

  RegisterUseCase(this._repository);

  @override
  Future<User> call(RegisterParams params) async {
    // Validate inputs
    final validationError = _validateInputs(params);
    if (validationError != null) {
      throw ValidationException(validationError);
    }

    // Perform registration
    return await _repository.register(
      email: params.email.toLowerCase().trim(),
      username: params.username.trim(),
      password: params.password,
    );
  }

  String? _validateInputs(RegisterParams params) {
    // Email validation
    if (!AppConstants.emailRegex.hasMatch(params.email)) {
      return 'Please enter a valid email address';
    }

    // Username validation
    if (params.username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (params.username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(params.username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (params.password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (params.password != params.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  }
}

class RegisterParams extends Params {
  final String email;
  final String username;
  final String password;
  final String confirmPassword;

  const RegisterParams({
    required this.email,
    required this.username,
    required this.password,
    required this.confirmPassword,
  });

  @override
  List<Object?> get props => [email, username, password, confirmPassword];
}