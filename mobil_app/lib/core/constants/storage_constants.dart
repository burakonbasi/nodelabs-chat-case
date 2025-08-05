class StorageConstants {
  // Secure Storage Keys
  static const String authToken = 'auth_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';
  static const String userName = 'user_name';
  
  // Database
  static const String databaseName = 'nodelabs_chat.db';
  static const int databaseVersion = 1;
  
  // Tables
  static const String usersTable = 'users';
  static const String conversationsTable = 'conversations';
  static const String messagesTable = 'messages';
  static const String participantsTable = 'participants';
  
  // Shared Preferences Keys
  static const String isDarkMode = 'is_dark_mode';
  static const String isFirstLaunch = 'is_first_launch';
  static const String notificationsEnabled = 'notifications_enabled';
  static const String biometricEnabled = 'biometric_enabled';
  static const String lastSyncTime = 'last_sync_time';
  
  // Cache Keys
  static const String cachedUser = 'cached_user';
  static const String cachedConversations = 'cached_conversations';
}