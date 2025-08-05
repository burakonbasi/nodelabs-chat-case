import api from '../lib/api';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResponse {
  url: string;
  publicId: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
}

interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxDimensions?: { width: number; height: number };
}

type UploadProgressCallback = (progress: UploadProgress) => void;

class FileService {
  private readonly FILE_ENDPOINTS = {
    UPLOAD: '/files/upload',
    DELETE: '/files/:id',
    GET_URL: '/files/:id/url',
    THUMBNAIL: '/files/:id/thumbnail',
    BULK_UPLOAD: '/files/bulk-upload',
  };

  private readonly DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  private readonly AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
  private readonly DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  async uploadFile(
    file: File,
    type: 'image' | 'video' | 'audio' | 'document',
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    // Validate file before upload
    this.validateFile(file, type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post<UploadResponse>(
      this.FILE_ENDPOINTS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  }

  async uploadMultipleFiles(
    files: File[],
    type: 'image' | 'video' | 'audio' | 'document',
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      this.validateFile(file, type);
      formData.append(`files[${index}]`, file);
    });
    
    formData.append('type', type);

    const response = await api.post<UploadResponse[]>(
      this.FILE_ENDPOINTS.BULK_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await api.delete(this.FILE_ENDPOINTS.DELETE.replace(':id', fileId));
  }

  async getFileUrl(fileId: string): Promise<string> {
    const response = await api.get<{ url: string }>(
      this.FILE_ENDPOINTS.GET_URL.replace(':id', fileId)
    );
    return response.data.url;
  }

  async getThumbnailUrl(fileId: string): Promise<string> {
    const response = await api.get<{ url: string }>(
      this.FILE_ENDPOINTS.THUMBNAIL.replace(':id', fileId)
    );
    return response.data.url;
  }

  // File validation
  private validateFile(file: File, type: 'image' | 'video' | 'audio' | 'document'): void {
    const options = this.getValidationOptions(type);
    
    // Check file size
    if (file.size > options.maxSize!) {
      throw new Error(`File size exceeds ${this.formatFileSize(options.maxSize!)} limit`);
    }

    // Check file type
    if (!options.allowedTypes!.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Additional validation for images
    if (type === 'image' && options.maxDimensions) {
      this.validateImageDimensions(file, options.maxDimensions);
    }
  }

  private getValidationOptions(type: string): FileValidationOptions {
    switch (type) {
      case 'image':
        return {
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: this.IMAGE_TYPES,
          maxDimensions: { width: 4096, height: 4096 },
        };
      case 'video':
        return {
          maxSize: this.DEFAULT_MAX_SIZE,
          allowedTypes: this.VIDEO_TYPES,
        };
      case 'audio':
        return {
          maxSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: this.AUDIO_TYPES,
        };
      case 'document':
        return {
          maxSize: 20 * 1024 * 1024, // 20MB
          allowedTypes: this.DOCUMENT_TYPES,
        };
      default:
        return {
          maxSize: this.DEFAULT_MAX_SIZE,
          allowedTypes: [],
        };
    }
  }

  private async validateImageDimensions(
    file: File,
    maxDimensions: { width: number; height: number }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
          reject(new Error(`Image dimensions exceed ${maxDimensions.width}x${maxDimensions.height}px`));
        } else {
          resolve();
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (this.IMAGE_TYPES.includes(mimeType)) return '🖼️';
    if (this.VIDEO_TYPES.includes(mimeType)) return '🎥';
    if (this.AUDIO_TYPES.includes(mimeType)) return '🎵';
    if (this.DOCUMENT_TYPES.includes(mimeType)) return '📄';
    return '📎';
  }

  async compressImage(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  generateThumbnail(file: File, maxWidth = 200, maxHeight = 200): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }
}

export default new FileService();