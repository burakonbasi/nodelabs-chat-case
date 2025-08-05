import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FiUploadCloud, FiFile, FiImage, FiFilm, FiMusic } from 'react-icons/fi';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
}

export function FileUpload({ 
  onFileSelect, 
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.ogg'],
    'audio/*': ['.mp3', '.wav', '.ogg'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = true 
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileSelect(acceptedFiles);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FiImage className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <FiFilm className="w-8 h-8" />;
    if (file.type.startsWith('audio/')) return <FiMusic className="w-8 h-8" />;
    return <FiFile className="w-8 h-8" />;
  };

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive && !isDragReject && "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
          isDragReject && "border-red-500 bg-red-50 dark:bg-red-900/20",
          !isDragActive && "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={{
            scale: isDragActive ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          <FiUploadCloud className={cn(
            "w-12 h-12 mb-4",
            isDragActive && !isDragReject && "text-blue-600 dark:text-blue-400",
            isDragReject && "text-red-600 dark:text-red-400",
            !isDragActive && "text-gray-400 dark:text-gray-500"
          )} />
          
          {isDragActive && !isDragReject ? (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Drop files here...
            </p>
          ) : isDragReject ? (
            <p className="text-red-600 dark:text-red-400 font-medium">
              Some files will be rejected
            </p>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                Drag & drop files here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to select files
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
              </p>
            </>
          )}
        </motion.div>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {file.name}
              </p>
              {errors.map((error) => (
                <p key={error.code} className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error.message}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 