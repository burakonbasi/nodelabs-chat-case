import '../../repositories/auth_repository.dart';
import '../base_usecase.dart';

class LogoutUseCase extends NoParamsUseCase<void> {
  final AuthRepository _repository;

  LogoutUseCase(this._repository);

  @override
  Future<void> call() async {
    await _repository.logout();
  }
}