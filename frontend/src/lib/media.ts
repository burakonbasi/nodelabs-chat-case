export interface MediaFile {
    file: File;
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
    thumbnail?: string;
    duration?: number;
    dimensions?: { width: number; height: number };
  }
  
  export interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }
  
  export interface VideoCompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    videoBitrate?: number;
    audioBitrate?: number;
  }
  
  // File type detection
  export function getFileType(file: File): MediaFile['type'] {
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }
  
  // Create object URL with cleanup
  export function createObjectURL(file: File | Blob): string {
    return URL.createObjectURL(file);
  }
  
  export function revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }
  
  // Image compression
  export async function compressImage(
    file: File,
    options: CompressOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;
  
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
  
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = Math.round(width / aspectRatio);
          } else {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
          }
        }
  
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
  
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
  
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
  
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format}`),
              { type: `image/${format}` }
            );
  
            resolve(compressedFile);
          },
          `image/${format}`,
          quality
        );
      };
  
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = createObjectURL(file);
    });
  }
  
  // Generate video thumbnail
  export async function generateVideoThumbnail(
    file: File,
    seekTime: number = 1.0
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
  
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(seekTime, video.duration);
      };
  
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
  
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate thumbnail'));
            return;
          }
  
          const thumbnailUrl = createObjectURL(blob);
          resolve(thumbnailUrl);
        }, 'image/jpeg', 0.7);
      };
  
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = createObjectURL(file);
    });
  }
  
  // Get video metadata
  export async function getVideoMetadata(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
  
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
  
      video.onerror = () => reject(new Error('Failed to load video metadata'));
      video.src = createObjectURL(file);
    });
  }
  
  // Get image dimensions
  export async function getImageDimensions(file: File): Promise<{
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
  
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
  
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = createObjectURL(file);
    });
  }
  
  // Process media file
  export async function processMediaFile(file: File): Promise<MediaFile> {
    const type = getFileType(file);
    const url = createObjectURL(file);
    const mediaFile: MediaFile = { file, url, type };
  
    try {
      switch (type) {
        case 'image':
          mediaFile.dimensions = await getImageDimensions(file);
          break;
        
        case 'video':
          const metadata = await getVideoMetadata(file);
          mediaFile.dimensions = { width: metadata.width, height: metadata.height };
          mediaFile.duration = metadata.duration;
          mediaFile.thumbnail = await generateVideoThumbnail(file);
          break;
        
        case 'audio':
          // Could extract audio duration if needed
          break;
      }
    } catch (error) {
      console.error('Error processing media file:', error);
    }
  
    return mediaFile;
  }
  
  // File size formatting
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Duration formatting
  export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
  
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  
  // Media validation
  export function validateMediaFile(
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const { maxSize = 100 * 1024 * 1024, allowedTypes } = options; // Default 100MB
  
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${formatFileSize(maxSize)}`
      };
    }
  
    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed'
      };
    }
  
    return { valid: true };
  }
  
  // Batch media processor
  export class MediaProcessor {
    private queue: Array<{ file: File; resolve: Function; reject: Function }> = [];
    private processing = false;
    private concurrency = 3;
    private activeProcesses = 0;
  
    async addFile(file: File): Promise<MediaFile> {
      return new Promise((resolve, reject) => {
        this.queue.push({ file, resolve, reject });
        this.processQueue();
      });
    }
  
    private async processQueue() {
      if (this.processing || this.queue.length === 0) return;
      
      this.processing = true;
  
      while (this.queue.length > 0 && this.activeProcesses < this.concurrency) {
        const item = this.queue.shift();
        if (!item) continue;
  
        this.activeProcesses++;
        
        processMediaFile(item.file)
          .then(item.resolve)
          .catch(item.reject)
          .finally(() => {
            this.activeProcesses--;
            this.processQueue();
          });
      }
  
      this.processing = false;
    }
  }
  
  // Download media file
  export function downloadFile(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  // Copy image to clipboard
  export async function copyImageToClipboard(blob: Blob): Promise<void> {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error('Clipboard API not supported');
    }
  
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
  }
  
  // Extract frames from video
  export async function extractVideoFrames(
    file: File,
    count: number = 5
  ): Promise<string[]> {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Failed to get canvas context');
  
    return new Promise((resolve, reject) => {
      const frames: string[] = [];
      let currentFrame = 0;
  
      video.onloadedmetadata = () => {
        const interval = video.duration / count;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const captureFrame = () => {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              frames.push(createObjectURL(blob));
            }
            
            currentFrame++;
            if (currentFrame < count) {
              video.currentTime = interval * currentFrame;
            } else {
              resolve(frames);
            }
          }, 'image/jpeg', 0.7);
        };
  
        video.onseeked = captureFrame;
        video.currentTime = 0;
      };
  
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = createObjectURL(file);
    });
  }