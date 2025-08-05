class AppConstants {
  // App Info
  static const String appName = 'NodeLabs Chat';
  static const String appVersion = '1.0.0';
  
  // Pagination
  static const int messagesPerPage = 20;
  static const int conversationsPerPage = 15;
  
  // Limits
  static const int maxMessageLength = 5000;
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  
  // Durations
  static const Duration typingTimeout = Duration(seconds: 3);
  static const Duration messageRetryDelay = Duration(seconds: 2);
  static const Duration splashDuration = Duration(seconds: 2);
  
  // Regex Patterns
  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );
  static final RegExp phoneRegex = RegExp(r'^\+?[0-9]{10,15}$');
  static final RegExp urlRegex = RegExp(
    r'https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)',
  );
  
  // Date Formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  
  // Assets
  static const String defaultAvatar = 'assets/images/default_avatar.png';
  static const String appLogo = 'assets/images/logo.png';
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 400);
  static const Duration longAnimation = Duration(milliseconds: 600);
}