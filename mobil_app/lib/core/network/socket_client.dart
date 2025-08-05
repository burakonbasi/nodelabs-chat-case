import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';
import '../constants/storage_constants.dart';

class SocketClient {
  IO.Socket? _socket;
  final FlutterSecureStorage _storage;
  bool _isConnected = false;

  SocketClient({required FlutterSecureStorage storage}) : _storage = storage;

  bool get isConnected => _isConnected;
  IO.Socket? get socket => _socket;

  // Initialize socket connection
  Future<void> connect() async {
    if (_isConnected) return;

    final token = await _storage.read(key: StorageConstants.authToken);
    if (token == null) {
      throw Exception('No auth token found');
    }

    _socket = IO.io(
      ApiConstants.socketUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _setupListeners();
    _socket!.connect();
  }

  // Setup event listeners
  void _setupListeners() {
    _socket!.onConnect((_) {
      print('Socket connected');
      _isConnected = true;
    });

    _socket!.onDisconnect((_) {
      print('Socket disconnected');
      _isConnected = false;
    });

    _socket!.onConnectError((error) {
      print('Socket connection error: $error');
      _isConnected = false;
    });

    _socket!.onError((error) {
      print('Socket error: $error');
    });
  }

  // Emit event
  void emit(String event, dynamic data) {
    if (!_isConnected || _socket == null) {
      print('Socket not connected');
      return;
    }
    _socket!.emit(event, data);
  }

  // Listen to event
  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  // Remove listener
  void off(String event) {
    _socket?.off(event);
  }

  // Join conversation room
  void joinConversation(String conversationId) {
    emit(ApiConstants.socketJoinConversation, {'conversationId': conversationId});
  }

  // Leave conversation room
  void leaveConversation(String conversationId) {
    emit(ApiConstants.socketLeaveConversation, {'conversationId': conversationId});
  }

  // Send typing indicator
  void sendTyping(String conversationId, bool isTyping) {
    emit(
      isTyping ? ApiConstants.socketTyping : ApiConstants.socketStopTyping,
      {'conversationId': conversationId},
    );
  }

  // Disconnect socket
  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _isConnected = false;
    }
  }
}