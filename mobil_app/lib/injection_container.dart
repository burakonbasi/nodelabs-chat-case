import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import 'core/network/api_client.dart';
import 'core/network/socket_client.dart';

// Data sources
import 'data/datasources/remote/auth_remote_datasource.dart';
import 'data/datasources/local/auth_local_datasource.dart';
import 'data/datasources/remote/chat_remote_datasource.dart';
import 'data/datasources/local/chat_local_datasource.dart';

// Repositories
import 'data/repositories/auth_repository_impl.dart';
import 'data/repositories/chat_repository_impl.dart';
import 'domain/repositories/auth_repository.dart';
import 'domain/repositories/chat_repository.dart';

// Use cases
import 'domain/usecases/auth/login_usecase.dart';
import 'domain/usecases/auth/register_usecase.dart';
import 'domain/usecases/auth/logout_usecase.dart';

// Blocs
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/chat/chat_bloc.dart';

final getIt = GetIt.instance;

Future<void> init() async {
  // Core
  getIt.registerLazySingleton(() => const FlutterSecureStorage());
  getIt.registerLazySingleton(() => Connectivity());
  
  // Network
  getIt.registerLazySingleton<ApiClient>(
    () => ApiClient(storage: getIt()),
  );
  
  getIt.registerLazySingleton<SocketClient>(
    () => SocketClient(storage: getIt()),
  );

  // Data sources
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(apiClient: getIt()),
  );
  
  getIt.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(secureStorage: getIt()),
  );
  
  getIt.registerLazySingleton<ChatRemoteDataSource>(
    () => ChatRemoteDataSourceImpl(
      apiClient: getIt(),
      socketClient: getIt(),
    ),
  );
  
  getIt.registerLazySingleton<ChatLocalDataSource>(
    () => ChatLocalDataSourceImpl(),
  );

  // Repositories
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
    ),
  );
  
  getIt.registerLazySingleton<ChatRepository>(
    () => ChatRepositoryImpl(
      remoteDataSource: getIt(),
      localDataSource: getIt(),
      socketClient: getIt(),
      connectivity: getIt(),
    ),
  );

  // Use cases
  getIt.registerLazySingleton(() => LoginUseCase(getIt()));
  getIt.registerLazySingleton(() => RegisterUseCase(getIt()));
  getIt.registerLazySingleton(() => LogoutUseCase(getIt()));

  // Blocs
  getIt.registerFactory(
    () => AuthBloc(
      loginUseCase: getIt(),
      registerUseCase: getIt(),
      logoutUseCase: getIt(),
      authRepository: getIt(),
    ),
  );
  
  getIt.registerFactory(
    () => ChatBloc(
      chatRepository: getIt(),
      socketClient: getIt(),
    ),
  );
}