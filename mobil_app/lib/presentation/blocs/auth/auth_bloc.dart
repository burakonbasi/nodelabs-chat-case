import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/auth/login_usecase.dart';
import '../../../domain/usecases/auth/register_usecase.dart';
import '../../../domain/usecases/auth/logout_usecase.dart';
import '../../../domain/repositories/auth_repository.dart';
import '../../../core/errors/exceptions.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;
  final AuthRepository _authRepository;

  AuthBloc({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required LogoutUseCase logoutUseCase,
    required AuthRepository authRepository,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _logoutUseCase = logoutUseCase,
        _authRepository = authRepository,
        super(AuthInitial()) {
    // Register event handlers
    on<CheckAuthStatusEvent>(_onCheckAuthStatus);
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
    on<LogoutEvent>(_onLogout);
    on<UpdateProfileEvent>(_onUpdateProfile);
    on<ChangePasswordEvent>(_onChangePassword);
  }

  // Check authentication status
  Future<void> _onCheckAuthStatus(
    CheckAuthStatusEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      final isAuthenticated = await _authRepository.isAuthenticated();
      
      if (isAuthenticated) {
        final user = await _authRepository.getCurrentUser();
        final token = await _authRepository.getToken();
        
        if (user != null && token != null) {
          emit(AuthAuthenticated(user: user, token: token));
        } else {
          emit(const AuthUnauthenticated());
        }
      } else {
        emit(const AuthUnauthenticated());
      }
    } catch (e) {
      emit(const AuthUnauthenticated());
    }
  }

  // Handle login
  Future<void> _onLogin(
    LoginEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      final user = await _loginUseCase(LoginParams(
        email: event.email,
        password: event.password,
      ));

      // Get token from repository after successful login
      final token = await _authRepository.getToken();
      
      if (token != null) {
        emit(AuthAuthenticated(user: user, token: token));
      } else {
        emit(const AuthError('Login successful but failed to save session'));
      }
    } on ValidationException catch (e) {
      emit(AuthError(e.message));
    } on UnauthorizedException catch (e) {
      emit(AuthError(e.message));
    } on ServerException catch (e) {
      emit(AuthError(e.message));
    } catch (e) {
      emit(AuthError('An unexpected error occurred: ${e.toString()}'));
    }
  }

  // Handle registration
  Future<void> _onRegister(
    RegisterEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      final user = await _registerUseCase(RegisterParams(
        email: event.email,
        username: event.username,
        password: event.password,
        confirmPassword: event.confirmPassword,
      ));

      // Get token from repository after successful registration
      final token = await _authRepository.getToken();
      
      if (token != null) {
        emit(AuthAuthenticated(user: user, token: token));
      } else {
        emit(const AuthError('Registration successful but failed to save session'));
      }
    } on ValidationException catch (e) {
      emit(AuthError(e.message));
    } on ServerException catch (e) {
      emit(AuthError(e.message));
    } catch (e) {
      emit(AuthError('An unexpected error occurred: ${e.toString()}'));
    }
  }

  // Handle logout
  Future<void> _onLogout(
    LogoutEvent event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      await _logoutUseCase();
      emit(const AuthUnauthenticated(message: 'Logged out successfully'));
    } catch (e) {
      // Even if logout fails on server, clear local data
      emit(const AuthUnauthenticated(message: 'Logged out'));
    }
  }

  // Handle profile update
  Future<void> _onUpdateProfile(
    UpdateProfileEvent event,
    Emitter<AuthState> emit,
  ) async {
    final currentState = state;
    if (currentState is! AuthAuthenticated) return;

    emit(AuthLoading());

    try {
      final updatedUser = await _authRepository.updateProfile(
        fullName: event.fullName,
        bio: event.bio,
        avatar: event.avatar,
      );

      emit(currentState.copyWith(user: updatedUser));
    } on ServerException catch (e) {
      emit(AuthError(e.message));
      // Restore previous state after showing error
      Future.delayed(const Duration(seconds: 2), () {
        add(CheckAuthStatusEvent());
      });
    } catch (e) {
      emit(AuthError('Failed to update profile: ${e.toString()}'));
      // Restore previous state after showing error
      Future.delayed(const Duration(seconds: 2), () {
        add(CheckAuthStatusEvent());
      });
    }
  }

  // Handle password change
  Future<void> _onChangePassword(
    ChangePasswordEvent event,
    Emitter<AuthState> emit,
  ) async {
    final currentState = state;
    if (currentState is! AuthAuthenticated) return;

    emit(AuthLoading());

    try {
      await _authRepository.changePassword(
        currentPassword: event.currentPassword,
        newPassword: event.newPassword,
      );

      emit(const AuthOperationSuccess('Password changed successfully'));
      
      // Return to authenticated state after showing success
      Future.delayed(const Duration(seconds: 2), () {
        emit(currentState);
      });
    } on ServerException catch (e) {
      emit(AuthError(e.message));
      // Restore previous state after showing error
      Future.delayed(const Duration(seconds: 2), () {
        emit(currentState);
      });
    } catch (e) {
      emit(AuthError('Failed to change password: ${e.toString()}'));
      // Restore previous state after showing error
      Future.delayed(const Duration(seconds: 2), () {
        emit(currentState);
      });
    }
  }
}