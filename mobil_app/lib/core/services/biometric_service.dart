import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/storage_constants.dart';

class BiometricService {
  static final BiometricService _instance = BiometricService._internal();
  factory BiometricService() => _instance;
  BiometricService._internal();

  final LocalAuthentication _localAuth = LocalAuthentication();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Check if biometric is available
  Future<bool> isBiometricAvailable() async {
    try {
      final isAvailable = await _localAuth.canCheckBiometrics;
      final isDeviceSupported = await _localAuth.isDeviceSupported();
      return isAvailable && isDeviceSupported;
    } catch (e) {
      print('Biometric availability check error: $e');
      return false;
    }
  }

  // Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      print('Get available biometrics error: $e');
      return [];
    }
  }

  // Check if biometric is enabled by user
  Future<bool> isBiometricEnabled() async {
    final enabled = await _storage.read(key: StorageConstants.biometricEnabled);
    return enabled == 'true';
  }

  // Enable/disable biometric
  Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(
      key: StorageConstants.biometricEnabled,
      value: enabled.toString(),
    );
  }

  // Authenticate with biometric
  Future<bool> authenticate({
    String reason = 'Please authenticate to access your chats',
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    try {
      // Check if biometric is available and enabled
      final isAvailable = await isBiometricAvailable();
      final isEnabled = await isBiometricEnabled();

      if (!isAvailable || !isEnabled) {
        return false;
      }

      // Authenticate
      final authenticated = await _localAuth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: false, // Allow fallback to device PIN/pattern
        ),
      );

      return authenticated;
    } catch (e) {
      print('Biometric authentication error: $e');
      return false;
    }
  }

  // Stop authentication
  Future<void> stopAuthentication() async {
    await _localAuth.stopAuthentication();
  }

  // Get biometric type string
  String getBiometricTypeString(List<BiometricType> types) {
    if (types.isEmpty) return 'Biometric';

    if (types.contains(BiometricType.face)) {
      return 'Face ID';
    } else if (types.contains(BiometricType.fingerprint)) {
      return 'Fingerprint';
    } else if (types.contains(BiometricType.iris)) {
      return 'Iris';
    } else {
      return 'Biometric';
    }
  }

  // Setup biometric on first launch
  Future<bool> setupBiometric({
    required String title,
    required String message,
  }) async {
    try {
      final isAvailable = await isBiometricAvailable();
      if (!isAvailable) return false;

      final types = await getAvailableBiometrics();
      final biometricType = getBiometricTypeString(types);

      // Show setup dialog
      final authenticated = await authenticate(
        reason: 'Setup $biometricType to secure your chats',
      );

      if (authenticated) {
        await setBiometricEnabled(true);
        return true;
      }

      return false;
    } catch (e) {
      print('Biometric setup error: $e');
      return false;
    }
  }
}