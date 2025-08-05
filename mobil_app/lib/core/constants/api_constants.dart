class ApiConstants {
  // Base URLs
  static const String baseUrl = 'http://10.0.2.2:3000'; // Android emulator
  // static const String baseUrl = 'http://localhost:3000'; // iOS simulator
  // static const String baseUrl = 'http://192.168.1.X:3000'; // Real device (use your IP)
  
  static const String apiUrl = '$baseUrl/api';
  static const String socketUrl = baseUrl;
  
  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';
  static const String updateProfile = '/auth/profile';
  
  // Chat Endpoints
  static const String conversations = '/conversations';
  static const String messages = '/messages';
  static const String sendMessage = '/messages';
  static const String searchUsers = '/users/search';
  
  // Socket Events
  static const String socketConnect = 'connect';
  static const String socketDisconnect = 'disconnect';
  static const String socketAuthenticate = 'authenticate';
  static const String socketJoinConversation = 'joinConversation';
  static const String socketLeaveConversation = 'leaveConversation';
  static const String socketNewMessage = 'newMessage';
  static const String socketMessageDelivered = 'messageDelivered';
  static const String socketMessageRead = 'messageRead';
  static const String socketTyping = 'typing';
  static const String socketStopTyping = 'stopTyping';
  static const String socketUserOnline = 'userOnline';
  static const String socketUserOffline = 'userOffline';
  
  // Headers
  static const String contentType = 'Content-Type';
  static const String authorization = 'Authorization';
  static const String bearer = 'Bearer';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}