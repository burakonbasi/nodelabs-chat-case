import '../../entities/user.dart';
import '../../repositories/auth_repository.dart';
import '../base_usecase.dart';
import '../../../core/errors/exceptions.dart';
import '../../../core/constants/app_constants.dart';

class LoginUseCase extends UseCase<User, LoginParams> {
  final AuthRepository _repository;

  LoginUseCase(this._repository);

  @override
  Future<User> call(LoginParams params) async {
    // Validate inputs
    if (!_isValidEmail(params.email)) {
      throw ValidationException('Please enter a valid email address');
    }
    
    if (params.password.length < 6) {
      throw ValidationException('Password must be at least 6 characters');
    }

    // Perform login
    return await _repository.login(
      email: params.email.toLowerCase().trim(),
      password: params.password,
    );
  }

  bool _isValidEmail(String email) {
    return AppConstants.emailRegex.hasMatch(email);
  }
}

class LoginParams extends Params {
  final String email;
  final String password;

  const LoginParams({
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [email, password];
}