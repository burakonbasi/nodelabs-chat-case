import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  X, 
  Image, 
  FileText,
  Film,
  Music,
  StopCircle,
  Pause,
  Play
} from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { ReplyPreview } from './ReplyPreview';
import { FileUpload } from './FileUpload';
import { useChatStore } from '../../stores/chatStore';
import { useKeyPress } from '../../hooks/useKeyPress';
import { IconTooltip } from '../common/Tooltip';
import { Message } from '../../types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showAttachments?: boolean;
  showEmoji?: boolean;
  showVoiceRecorder?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000,
  showAttachments = true,
  showEmoji = true,
  showVoiceRecorder = true,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { replyingTo, setReplyingTo, editingMessageId, editingMessage, setEditingMessage } = useChatStore();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Load editing message
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || '');
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onStopTyping?.();
    }, 1000);
  };

  // Handle send message
  const handleSend = () => {
    if ((!message.trim() && attachedFiles.length === 0) || disabled) return;

    onSendMessage(message.trim(), attachedFiles);
    setMessage('');
    setAttachedFiles([]);
    setReplyingTo(null);
    setEditingMessage(null);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Keyboard shortcuts
  useKeyPress('Enter', (e) => {
    if (!e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, { target: textareaRef.current });

  useKeyPress('Escape', () => {
    if (replyingTo) setReplyingTo(null);
    if (editingMessage) setEditingMessage(null);
  });

  // Handle file selection
  const handleFileSelect = (type: 'image' | 'video' | 'file') => {
    const accept = {
      image: 'image/*',
      video: 'video/*',
      file: '*',
    };

    if (fileInputRef.current) {
      fileInputRef.current.accept = accept[type];
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    const position = textareaRef.current?.selectionStart || message.length;
    const newMessage = message.slice(0, position) + emoji + message.slice(position);
    setMessage(newMessage);
    
    // Move cursor after emoji
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = position + emoji.length;
        textareaRef.current.selectionEnd = position + emoji.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle voice recording
  const handleVoiceRecording = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
    setAttachedFiles([...attachedFiles, audioFile]);
    setIsRecording(false);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <ReplyPreview
            message={replyingTo}
            onClose={() => setReplyingTo(null)}
          />
        )}
      </AnimatePresence>

      {/* Attached Files Preview */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 flex gap-2 overflow-x-auto"
          >
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group flex-shrink-0"
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs truncate rounded-b-lg">
                  {file.name}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4">
        {/* Attachment Button */}
        {showAttachments && !isRecording && (
          <div className="relative">
            <IconTooltip text="Attach">
              <button
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </IconTooltip>

            {/* Attachment Menu */}
            <AnimatePresence>
              {showAttachmentMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[160px]"
                >
                  <button
                    onClick={() => handleFileSelect('image')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Image className="w-5 h-5 text-blue-500" />
                    <span>Photo</span>
                  </button>
                  <button
                    onClick={() => handleFileSelect('video')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Film className="w-5 h-5 text-purple-500" />
                    <span>Video</span>
                  </button>
                  <button
                    onClick={() => handleFileSelect('file')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-green-500" />
                    <span>Document</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Text Input or Voice Recorder */}
        {isRecording ? (
          <VoiceRecorder
            onStop={handleVoiceRecording}
            onCancel={() => setIsRecording(false)}
          />
        ) : (
          <>
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={placeholder}
                disabled={disabled}
                maxLength={maxLength}
                rows={1}
                className="w-full resize-none outline-none bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 pr-10 max-h-32 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
              />
              
              {/* Character Count */}
              {message.length > maxLength * 0.8 && (
                <div className="absolute bottom-1 right-12 text-xs text-gray-500">
                  {message.length}/{maxLength}
                </div>
              )}

              {/* Emoji Button */}
              {showEmoji && (
                <div className="absolute bottom-1 right-1">
                  <IconTooltip text="Emoji">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </IconTooltip>
                </div>
              )}
            </div>

            {/* Send/Voice Button */}
            {message.trim() || attachedFiles.length > 0 ? (
              <IconTooltip text="Send">
                <button
                  onClick={handleSend}
                  disabled={disabled}
                  className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </IconTooltip>
            ) : showVoiceRecorder ? (
              <IconTooltip text="Voice Message">
                <button
                  onClick={() => setIsRecording(true)}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Mic className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </IconTooltip>
            ) : null}
          </>
        )}
      </div>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-4 mb-2"
          >
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};