export interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;
  }
  
  export interface VideoMetadata {
    duration: number;
    width: number;
    height: number;
    aspectRatio: number;
    frameRate?: number;
  }
  
  export interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }
  
  // Image processing utilities
  export const imageUtils = {
    // Get image dimensions
    async getDimensions(file: File | Blob | string): Promise<ImageDimensions> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        const cleanup = () => {
          if (typeof url === 'string' && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        };
        
        const url = typeof file === 'string' ? file : URL.createObjectURL(file as Blob);
        
        img.onload = () => {
          const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          };
          cleanup();
          resolve(dimensions);
        };
        
        img.onerror = () => {
          cleanup();
          reject(new Error('Failed to load image'));
        };
        
        img.src = url;
      });
    },
  
    // Compress image
    async compress(
      file: File | Blob,
      options: CompressOptions = {}
    ): Promise<Blob> {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        format = 'jpeg',
      } = options;
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
            }
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            `image/${format}`,
            quality
          );
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        
        img.src = url;
      });
    },
  
    // Generate thumbnail
    async generateThumbnail(
      file: File | Blob,
      size = 200
    ): Promise<Blob> {
      return this.compress(file, {
        maxWidth: size,
        maxHeight: size,
        quality: 0.7,
      });
    },
  
    // Convert to base64
    async toBase64(file: File | Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          resolve(reader.result as string);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
      });
    },
  
    // Rotate image
    async rotate(file: File | Blob, degrees: number): Promise<Blob> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Calculate rotated dimensions
          const radians = (degrees * Math.PI) / 180;
          const sin = Math.abs(Math.sin(radians));
          const cos = Math.abs(Math.cos(radians));
          
          canvas.width = img.width * cos + img.height * sin;
          canvas.height = img.width * sin + img.height * cos;
          
          // Rotate around center
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(radians);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to rotate image'));
              }
            },
            file.type || 'image/jpeg'
          );
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        
        img.src = url;
      });
    },
  
    // Apply filter
    async applyFilter(
      file: File | Blob,
      filter: 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast',
      value = 1
    ): Promise<Blob> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Apply CSS filter
          const filterMap = {
            grayscale: `grayscale(${value})`,
            sepia: `sepia(${value})`,
            blur: `blur(${value}px)`,
            brightness: `brightness(${value})`,
            contrast: `contrast(${value})`,
          };
          
          ctx.filter = filterMap[filter];
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to apply filter'));
              }
            },
            file.type || 'image/jpeg'
          );
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load image'));
        };
        
        img.src = url;
      });
    },
  };
  
  // Video processing utilities
  export const videoUtils = {
    // Get video metadata
    async getMetadata(file: File | Blob): Promise<VideoMetadata> {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        
        video.onloadedmetadata = () => {
          const metadata: VideoMetadata = {
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight,
            aspectRatio: video.videoWidth / video.videoHeight,
          };
          
          URL.revokeObjectURL(url);
          resolve(metadata);
        };
        
        video.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load video'));
        };
        
        video.src = url;
      });
    },
  
    // Generate video thumbnail
    async generateThumbnail(
      file: File | Blob,
      time = 0
    ): Promise<Blob> {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(file);
        
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(time, video.duration);
        };
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(video, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);
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
        
        video.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load video'));
        };
        
        video.src = url;
      });
    },
  
    // Extract frames
    async extractFrames(
      file: File | Blob,
      count = 10
    ): Promise<Blob[]> {
      const metadata = await this.getMetadata(file);
      const interval = metadata.duration / count;
      const frames: Blob[] = [];
      
      for (let i = 0; i < count; i++) {
        const time = i * interval;
        const frame = await this.generateThumbnail(file, time);
        frames.push(frame);
      }
      
      return frames;
    },
  };
  
  // Audio processing utilities
  export const audioUtils = {
    // Get audio duration
    async getDuration(file: File | Blob): Promise<number> {
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        
        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(audio.duration);
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load audio'));
        };
        
        audio.src = url;
      });
    },
  
    // Generate waveform data
    async generateWaveform(
      file: File | Blob,
      samples = 100
    ): Promise<number[]> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(e.target!.result as ArrayBuffer);
            
            const rawData = audioBuffer.getChannelData(0);
            const blockSize = Math.floor(rawData.length / samples);
            const waveform: number[] = [];
            
            for (let i = 0; i < samples; i++) {
              const start = blockSize * i;
              let sum = 0;
              
              for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(rawData[start + j]);
              }
              
              waveform.push(sum / blockSize);
            }
            
            // Normalize
            const max = Math.max(...waveform);
            const normalized = waveform.map(v => v / max);
            
            resolve(normalized);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read audio file'));
        };
        
        reader.readAsArrayBuffer(file);
      });
    },
  };
  
  // Media validation utilities
  export const mediaValidation = {
    // Check if file is image
    isImage(file: File | Blob): boolean {
      return file.type.startsWith('image/');
    },
  
    // Check if file is video
    isVideo(file: File | Blob): boolean {
      return file.type.startsWith('video/');
    },
  
    // Check if file is audio
    isAudio(file: File | Blob): boolean {
      return file.type.startsWith('audio/');
    },
  
    // Validate media file
    async validate(
      file: File | Blob,
      options: {
        maxSize?: number;
        allowedTypes?: string[];
        maxDimensions?: { width: number; height: number };
        maxDuration?: number;
      } = {}
    ): Promise<{ valid: boolean; errors: string[] }> {
      const errors: string[] = [];
      
      // Check file size
      if (options.maxSize && file.size > options.maxSize) {
        errors.push(`File size exceeds ${options.maxSize / (1024 * 1024)}MB limit`);
      }
      
      // Check file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }
      
      // Check dimensions for images
      if (this.isImage(file) && options.maxDimensions) {
        try {
          const dimensions = await imageUtils.getDimensions(file);
          if (
            dimensions.width > options.maxDimensions.width ||
            dimensions.height > options.maxDimensions.height
          ) {
            errors.push(
              `Image dimensions exceed ${options.maxDimensions.width}x${options.maxDimensions.height}px`
            );
          }
        } catch (error) {
          errors.push('Failed to validate image dimensions');
        }
      }
      
      // Check duration for video/audio
      if ((this.isVideo(file) || this.isAudio(file)) && options.maxDuration) {
        try {
          const duration = this.isVideo(file)
            ? (await videoUtils.getMetadata(file)).duration
            : await audioUtils.getDuration(file);
            
          if (duration > options.maxDuration) {
            errors.push(`Media duration exceeds ${options.maxDuration}s limit`);
          }
        } catch (error) {
          errors.push('Failed to validate media duration');
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
      };
    },
  };
  
  // Export all media utilities
  export default {
    image: imageUtils,
    video: videoUtils,
    audio: audioUtils,
    validation: mediaValidation,
  };