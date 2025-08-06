import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path/path.dart' as path;
import 'package:image/image.dart' as img;
import '../constants/app_constants.dart';

class FileService {
  static final FileService _instance = FileService._internal();
  factory FileService() => _instance;
  FileService._internal();

  final ImagePicker _imagePicker = ImagePicker();

  // Pick image from gallery
  Future<FilePickerResult?> pickImage({
    bool allowMultiple = false,
    bool compress = true,
  }) async {
    try {
      // Check permission
      final status = await Permission.photos.status;
      if (status.isDenied) {
        final result = await Permission.photos.request();
        if (!result.isGranted) return null;
      }

      if (allowMultiple) {
        final images = await _imagePicker.pickMultiImage();
        if (images.isEmpty) return null;

        final files = <File>[];
        for (final image in images) {
          final file = File(image.path);
          if (compress) {
            final compressedFile = await _compressImage(file);
            files.add(compressedFile);
          } else {
            files.add(file);
          }
        }

        return FilePickerResult(
          files: files,
          type: FileType.image,
        );
      } else {
        final image = await _imagePicker.pickImage(source: ImageSource.gallery);
        if (image == null) return null;

        File file = File(image.path);
        if (compress) {
          file = await _compressImage(file);
        }

        return FilePickerResult(
          files: [file],
          type: FileType.image,
        );
      }
    } catch (e) {
      print('Pick image error: $e');
      return null;
    }
  }

  // Take photo with camera
  Future<FilePickerResult?> takePhoto({bool compress = true}) async {
    try {
      // Check permission
      final status = await Permission.camera.status;
      if (status.isDenied) {
        final result = await Permission.camera.request();
        if (!result.isGranted) return null;
      }

      final image = await _imagePicker.pickImage(source: ImageSource.camera);
      if (image == null) return null;

      File file = File(image.path);
      if (compress) {
        file = await _compressImage(file);
      }

      return FilePickerResult(
        files: [file],
        type: FileType.image,
      );
    } catch (e) {
      print('Take photo error: $e');
      return null;
    }
  }

  // Pick video
  Future<FilePickerResult?> pickVideo({
    bool fromCamera = false,
    Duration? maxDuration,
  }) async {
    try {
      // Check permissions
      if (fromCamera) {
        final cameraStatus = await Permission.camera.status;
        if (cameraStatus.isDenied) {
          final result = await Permission.camera.request();
          if (!result.isGranted) return null;
        }
      } else {
        final photosStatus = await Permission.photos.status;
        if (photosStatus.isDenied) {
          final result = await Permission.photos.request();
          if (!result.isGranted) return null;
        }
      }

      final video = await _imagePicker.pickVideo(
        source: fromCamera ? ImageSource.camera : ImageSource.gallery,
        maxDuration: maxDuration,
      );
      
      if (video == null) return null;

      return FilePickerResult(
        files: [File(video.path)],
        type: FileType.video,
      );
    } catch (e) {
      print('Pick video error: $e');
      return null;
    }
  }

  // Pick document
  Future<FilePickerResult?> pickDocument({
    bool allowMultiple = false,
    List<String>? allowedExtensions,
  }) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: allowMultiple,
        type: allowedExtensions != null ? FileType.custom : FileType.any,
        allowedExtensions: allowedExtensions,
      );

      if (result == null || result.files.isEmpty) return null;

      final files = result.files
          .where((file) => file.path != null)
          .map((file) => File(file.path!))
          .toList();

      if (files.isEmpty) return null;

      // Check file sizes
      for (final file in files) {
        final fileSize = await file.length();
        if (fileSize > AppConstants.maxFileSize) {
          throw Exception('File size exceeds ${AppConstants.maxFileSize ~/ (1024 * 1024)}MB limit');
        }
      }

      return FilePickerResult(
        files: files,
        type: FileType.document,
      );
    } catch (e) {
      print('Pick document error: $e');
      rethrow;
    }
  }

  // Compress image
  Future<File> _compressImage(File file) async {
    try {
      final bytes = await file.readAsBytes();
      final image = img.decodeImage(bytes);
      
      if (image == null) return file;

      // Calculate new dimensions
      const maxWidth = 1920;
      const maxHeight = 1920;
      
      int width = image.width;
      int height = image.height;
      
      if (width > maxWidth || height > maxHeight) {
        final aspectRatio = width / height;
        
        if (width > height) {
          width = maxWidth;
          height = (maxWidth / aspectRatio).round();
        } else {
          height = maxHeight;
          width = (maxHeight * aspectRatio).round();
        }
      }

      // Resize image
      final resized = img.copyResize(image, width: width, height: height);
      
      // Compress
      final compressed = img.encodeJpg(resized, quality: 85);
      
      // Save to temp file
      final tempDir = await getTemporaryDirectory();
      final fileName = 'compressed_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final compressedFile = File(path.join(tempDir.path, fileName));
      
      await compressedFile.writeAsBytes(compressed);
      
      return compressedFile;
    } catch (e) {
      print('Compress image error: $e');
      return file;
    }
  }

  // Get file size string
  static String getFileSizeString(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    }
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  // Get file extension
  static String getFileExtension(String filePath) {
    return path.extension(filePath).toLowerCase();
  }

  // Get file name
  static String getFileName(String filePath) {
    return path.basename(filePath);
  }

  // Check if file is image
  static bool isImage(String filePath) {
    final ext = getFileExtension(filePath);
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].contains(ext);
  }

  // Check if file is video
  static bool isVideo(String filePath) {
    final ext = getFileExtension(filePath);
    return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'].contains(ext);
  }

  // Save file to app directory
  Future<File> saveFileToAppDirectory(
    File file, {
    required String subDirectory,
  }) async {
    try {
      final appDir = await getApplicationDocumentsDirectory();
      final saveDir = Directory(path.join(appDir.path, subDirectory));
      
      if (!await saveDir.exists()) {
        await saveDir.create(recursive: true);
      }

      final fileName = getFileName(file.path);
      final savePath = path.join(saveDir.path, fileName);
      
      return await file.copy(savePath);
    } catch (e) {
      print('Save file error: $e');
      rethrow;
    }
  }

  // Delete file
  Future<bool> deleteFile(String filePath) async {
    try {
      final file = File(filePath);
      if (await file.exists()) {
        await file.delete();
        return true;
      }
      return false;
    } catch (e) {
      print('Delete file error: $e');
      return false;
    }
  }
}

class FilePickerResult {
  final List<File> files;
  final FileType type;

  FilePickerResult({
    required this.files,
    required this.type,
  });
}

enum FileType {
  image,
  video,
  document,
  audio,
  other,
}