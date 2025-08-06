import 'dart:async';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path/path.dart' as path;

class VoiceMessageService {
  static final VoiceMessageService _instance = VoiceMessageService._internal();
  factory VoiceMessageService() => _instance;
  VoiceMessageService._internal();

  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _player = AudioPlayer();
  
  Timer? _recordingTimer;
  int _recordingDuration = 0;
  String? _currentRecordingPath;
  
  // Callbacks
  Function(int duration)? onRecordingDurationChanged;
  Function(double amplitude)? onAmplitudeChanged;
  
  // Check and request microphone permission
  Future<bool> checkPermission() async {
    final status = await Permission.microphone.status;
    
    if (status.isDenied) {
      final result = await Permission.microphone.request();
      return result.isGranted;
    }
    
    return status.isGranted;
  }

  // Start recording
  Future<bool> startRecording() async {
    try {
      // Check permission
      final hasPermission = await checkPermission();
      if (!hasPermission) return false;

      // Check if already recording
      if (await _recorder.isRecording()) {
        await stopRecording();
      }

      // Get temp directory
      final tempDir = await getTemporaryDirectory();
      final fileName = 'voice_${DateTime.now().millisecondsSinceEpoch}.m4a';
      _currentRecordingPath = path.join(tempDir.path, fileName);

      // Configure recording
      const config = RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
      );

      // Start recording
      await _recorder.start(config, path: _currentRecordingPath!);

      // Start duration timer
      _recordingDuration = 0;
      _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        _recordingDuration++;
        onRecordingDurationChanged?.call(_recordingDuration);
      });

      // Start amplitude monitoring
      _startAmplitudeMonitoring();

      return true;
    } catch (e) {
      print('Start recording error: $e');
      return false;
    }
  }

  // Stop recording
  Future<VoiceMessageResult?> stopRecording() async {
    try {
      if (!await _recorder.isRecording()) return null;

      // Stop recording
      final path = await _recorder.stop();
      
      // Stop timers
      _recordingTimer?.cancel();
      _recordingTimer = null;

      if (path == null || _currentRecordingPath == null) return null;

      // Get file info
      final file = File(_currentRecordingPath!);
      final fileSize = await file.length();

      return VoiceMessageResult(
        filePath: _currentRecordingPath!,
        duration: _recordingDuration,
        fileSize: fileSize,
      );
    } catch (e) {
      print('Stop recording error: $e');
      return null;
    }
  }

  // Cancel recording
  Future<void> cancelRecording() async {
    try {
      if (await _recorder.isRecording()) {
        await _recorder.stop();
      }

      _recordingTimer?.cancel();
      _recordingTimer = null;

      // Delete the file
      if (_currentRecordingPath != null) {
        final file = File(_currentRecordingPath!);
        if (await file.exists()) {
          await file.delete();
        }
      }

      _currentRecordingPath = null;
      _recordingDuration = 0;
    } catch (e) {
      print('Cancel recording error: $e');
    }
  }

  // Monitor amplitude
  void _startAmplitudeMonitoring() {
    Timer.periodic(const Duration(milliseconds: 100), (timer) async {
      if (!await _recorder.isRecording()) {
        timer.cancel();
        return;
      }

      final amplitude = await _recorder.getAmplitude();
      onAmplitudeChanged?.call(amplitude.current);
    });
  }

  // Play voice message
  Future<void> playVoiceMessage(String filePath) async {
    try {
      await _player.play(
        File(filePath).existsSync() 
            ? DeviceFileSource(filePath)
            : UrlSource(filePath),
      );
    } catch (e) {
      print('Play voice message error: $e');
    }
  }

  // Pause playback
  Future<void> pausePlayback() async {
    await _player.pause();
  }

  // Resume playback
  Future<void> resumePlayback() async {
    await _player.resume();
  }

  // Stop playback
  Future<void> stopPlayback() async {
    await _player.stop();
  }

  // Get player state stream
  Stream<PlayerState> get playerStateStream => _player.onPlayerStateChanged;

  // Get position stream
  Stream<Duration> get positionStream => _player.onPositionChanged;

  // Get duration stream
  Stream<Duration> get durationStream => _player.onDurationChanged;

  // Seek to position
  Future<void> seekTo(Duration position) async {
    await _player.seek(position);
  }

  // Format duration
  static String formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  // Dispose
  void dispose() {
    _recordingTimer?.cancel();
    _recorder.dispose();
    _player.dispose();
  }
}

class VoiceMessageResult {
  final String filePath;
  final int duration;
  final int fileSize;

  VoiceMessageResult({
    required this.filePath,
    required this.duration,
    required this.fileSize,
  });
}