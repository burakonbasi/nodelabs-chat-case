export interface FileInfo {
    name: string;
    size: number;
    type: string;
    extension: string;
    lastModified: Date;
  }
  
  export interface FileValidationResult {
    valid: boolean;
    errors: string[];
  }
  
  // File type utilities
  export const fileTypes = {
    // Get file extension
    getExtension(filename: string): string {
      const parts = filename.split('.');
      return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
    },
  
    // Get file name without extension
    getNameWithoutExtension(filename: string): string {
      const lastDotIndex = filename.lastIndexOf('.');
      return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename;
    },
  
    // Get MIME type category
    getCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other' {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'audio';
      if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) return 'document';
      if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return 'archive';
      return 'other';
    },
  
    // Check if file is of specific type
    isType(file: File | Blob, category: 'image' | 'video' | 'audio' | 'document'): boolean {
      return this.getCategory(file.type) === category;
    },
  
    // Get icon for file type
    getIcon(mimeType: string): string {
      const category = this.getCategory(mimeType);
      const icons = {
        image: '🖼️',
        video: '🎥',
        audio: '🎵',
        document: '📄',
        archive: '🗜️',
        other: '📎',
      };
      return icons[category];
    },
  
    // Common MIME types
    MIME_TYPES: {
      // Images
      JPEG: 'image/jpeg',
      PNG: 'image/png',
      GIF: 'image/gif',
      WEBP: 'image/webp',
      SVG: 'image/svg+xml',
      
      // Videos
      MP4: 'video/mp4',
      WEBM: 'video/webm',
      MOV: 'video/quicktime',
      AVI: 'video/x-msvideo',
      
      // Audio
      MP3: 'audio/mpeg',
      WAV: 'audio/wav',
      OGG: 'audio/ogg',
      WEBM_AUDIO: 'audio/webm',
      
      // Documents
      PDF: 'application/pdf',
      DOC: 'application/msword',
      DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      XLS: 'application/vnd.ms-excel',
      XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      TXT: 'text/plain',
      
      // Archives
      ZIP: 'application/zip',
      RAR: 'application/x-rar-compressed',
      TAR: 'application/x-tar',
      GZIP: 'application/gzip',
    },
  };
  
  // File size utilities
  export const fileSize = {
    // Format bytes to human readable
    format(bytes: number, decimals = 2): string {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
  
    // Parse human readable size to bytes
    parse(sizeStr: string): number {
      const units: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 * 1024,
        GB: 1024 * 1024 * 1024,
        TB: 1024 * 1024 * 1024 * 1024,
      };
      
      const match = sizeStr.match(/^([\d.]+)\s*([A-Z]+)$/i);
      if (!match) return 0;
      
      const [, value, unit] = match;
      return parseFloat(value) * (units[unit.toUpperCase()] || 1);
    },
  
    // Check if file size is within limit
    isWithinLimit(file: File | Blob, maxSize: number): boolean {
      return file.size <= maxSize;
    },
  
    // Get total size of multiple files
    getTotalSize(files: (File | Blob)[]): number {
      return files.reduce((total, file) => total + file.size, 0);
    },
  };
  
  // File reading utilities
  export const fileReading = {
    // Read file as text
    async readAsText(file: File | Blob, encoding = 'UTF-8'): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file, encoding);
      });
    },
  
    // Read file as data URL
    async readAsDataURL(file: File | Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    },
  
    // Read file as array buffer
    async readAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });
    },
  
    // Read file in chunks
    async readInChunks(
      file: File | Blob,
      chunkSize: number,
      onChunk: (chunk: ArrayBuffer, offset: number) => void | Promise<void>
    ): Promise<void> {
      const fileSize = file.size;
      let offset = 0;
      
      while (offset < fileSize) {
        const chunk = file.slice(offset, offset + chunkSize);
        const buffer = await this.readAsArrayBuffer(chunk);
        await onChunk(buffer, offset);
        offset += chunkSize;
      }
    },
  
    // Read JSON file
    async readAsJSON<T = any>(file: File | Blob): Promise<T> {
      const text = await this.readAsText(file);
      return JSON.parse(text);
    },
  
    // Read CSV file
    async readAsCSV(file: File | Blob): Promise<string[][]> {
      const text = await this.readAsText(file);
      return text
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.split(',').map(cell => cell.trim()));
    },
  };
  
  // File validation utilities
  export const fileValidation = {
    // Validate file
    validate(
      file: File | Blob,
      options: {
        maxSize?: number;
        minSize?: number;
        allowedTypes?: string[];
        allowedExtensions?: string[];
        maxNameLength?: number;
      } = {}
    ): FileValidationResult {
      const errors: string[] = [];
      
      // Check max size
      if (options.maxSize && file.size > options.maxSize) {
        errors.push(`File size exceeds maximum of ${fileSize.format(options.maxSize)}`);
      }
      
      // Check min size
      if (options.minSize && file.size < options.minSize) {
        errors.push(`File size is below minimum of ${fileSize.format(options.minSize)}`);
      }
      
      // Check file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        errors.push(`File type "${file.type}" is not allowed`);
      }
      
      // Check extension (for File objects only)
      if (options.allowedExtensions && file instanceof File) {
        const extension = fileTypes.getExtension(file.name);
        if (!options.allowedExtensions.includes(extension)) {
          errors.push(`File extension ".${extension}" is not allowed`);
        }
      }
      
      // Check name length (for File objects only)
      if (options.maxNameLength && file instanceof File && file.name.length > options.maxNameLength) {
        errors.push(`File name exceeds maximum length of ${options.maxNameLength} characters`);
      }
      
      return {
        valid: errors.length === 0,
        errors,
      };
    },
  
    // Validate multiple files
    validateMultiple(
      files: (File | Blob)[],
      options: Parameters<typeof fileValidation.validate>[1] & {
        maxFiles?: number;
        maxTotalSize?: number;
      } = {}
    ): FileValidationResult {
      const errors: string[] = [];
      
      // Check max files
      if (options.maxFiles && files.length > options.maxFiles) {
        errors.push(`Number of files exceeds maximum of ${options.maxFiles}`);
      }
      
      // Check total size
      if (options.maxTotalSize) {
        const totalSize = fileSize.getTotalSize(files);
        if (totalSize > options.maxTotalSize) {
          errors.push(`Total size exceeds maximum of ${fileSize.format(options.maxTotalSize)}`);
        }
      }
      
      // Validate individual files
      files.forEach((file, index) => {
        const result = this.validate(file, options);
        if (!result.valid) {
          result.errors.forEach(error => {
            errors.push(`File ${index + 1}: ${error}`);
          });
        }
      });
      
      return {
        valid: errors.length === 0,
        errors,
      };
    },
  };
  
  // File manipulation utilities
  export const fileManipulation = {
    // Create file from text
    createFromText(content: string, filename: string, mimeType = 'text/plain'): File {
      const blob = new Blob([content], { type: mimeType });
      return new File([blob], filename, { type: mimeType });
    },
  
    // Create file from base64
    createFromBase64(base64: string, filename: string, mimeType: string): File {
      const byteCharacters = atob(base64.split(',')[1] || base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      return new File([blob], filename, { type: mimeType });
    },
  
    // Rename file
    rename(file: File, newName: string): File {
      return new File([file], newName, { type: file.type, lastModified: file.lastModified });
    },
  
    // Change file extension
    changeExtension(file: File, newExtension: string): File {
      const nameWithoutExt = fileTypes.getNameWithoutExtension(file.name);
      const newName = `${nameWithoutExt}.${newExtension}`;
      return this.rename(file, newName);
    },
  
    // Split file into chunks
    async splitIntoChunks(file: File | Blob, chunkSize: number): Promise<Blob[]> {
      const chunks: Blob[] = [];
      const fileSize = file.size;
      
      for (let offset = 0; offset < fileSize; offset += chunkSize) {
        const chunk = file.slice(offset, Math.min(offset + chunkSize, fileSize));
        chunks.push(chunk);
      }
      
      return chunks;
    },
  
    // Merge files
    async mergeFiles(files: (File | Blob)[], filename: string, mimeType: string): Promise<File> {
      const parts: BlobPart[] = [];
      
      for (const file of files) {
        parts.push(file);
      }
      
      const blob = new Blob(parts, { type: mimeType });
      return new File([blob], filename, { type: mimeType });
    },
  };
  
  // File download utilities
  export const fileDownload = {
    // Download file
    download(file: File | Blob, filename?: string): void {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = filename || (file instanceof File ? file.name : 'download');
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
  
    // Download from URL
    async downloadFromUrl(url: string, filename: string): Promise<void> {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        this.download(blob, filename);
      } catch (error) {
        throw new Error('Failed to download file');
      }
    },
  
    // Download as text
    downloadAsText(content: string, filename: string): void {
      const file = fileManipulation.createFromText(content, filename);
      this.download(file);
    },
  
    // Download as JSON
    downloadAsJSON(data: any, filename: string): void {
      const json = JSON.stringify(data, null, 2);
      const file = fileManipulation.createFromText(json, filename, 'application/json');
      this.download(file);
    },
  
    // Download as CSV
    downloadAsCSV(data: any[][], filename: string): void {
      const csv = data.map(row => row.join(',')).join('\n');
      const file = fileManipulation.createFromText(csv, filename, 'text/csv');
      this.download(file);
    },
  };
  
  // File system utilities (using File System Access API)
  export const fileSystem = {
    // Check if File System Access API is supported
    isSupported(): boolean {
      return 'showOpenFilePicker' in window;
    },
  
    // Open file picker
    async openFile(options?: {
      multiple?: boolean;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }): Promise<File[]> {
      if (!this.isSupported()) {
        throw new Error('File System Access API is not supported');
      }
      
      try {
        const handles = await (window as any).showOpenFilePicker(options);
        const files: File[] = [];
        
        for (const handle of handles) {
          const file = await handle.getFile();
          files.push(file);
        }
        
        return files;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return [];
        }
        throw error;
      }
    },
  
    // Save file
    async saveFile(
      file: File | Blob,
      options?: {
        suggestedName?: string;
        types?: Array<{
          description: string;
          accept: Record<string, string[]>;
        }>;
      }
    ): Promise<void> {
      if (!this.isSupported()) {
        // Fallback to download
        fileDownload.download(file, options?.suggestedName);
        return;
      }
      
      try {
        const handle = await (window as any).showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(file);
        await writable.close();
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          throw error;
        }
      }
    },
  };
  
  // Export all file utilities
  export default {
    types: fileTypes,
    size: fileSize,
    reading: fileReading,
    validation: fileValidation,
    manipulation: fileManipulation,
    download: fileDownload,
    system: fileSystem,
  };