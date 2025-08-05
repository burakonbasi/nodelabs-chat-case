import 'package:equatable/equatable.dart';

// Base use case with parameters
abstract class UseCase<Type, Params> {
  Future<Type> call(Params params);
}

// Base use case without parameters
abstract class NoParamsUseCase<Type> {
  Future<Type> call();
}

// Base params class
abstract class Params extends Equatable {
  const Params();
}

// No params class
class NoParams extends Params {
  @override
  List<Object?> get props => [];
}