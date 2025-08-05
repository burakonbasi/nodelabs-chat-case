import { useEffect, useRef } from 'react';
import EmojiPickerReact from 'emoji-picker-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const { activeTheme } = useThemeStore();
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-lg overflow-hidden"
    >
      <EmojiPickerReact
        onEmojiClick={(emojiObject) => onSelect(emojiObject.emoji)}
        theme={activeTheme === 'dark' ? 'dark' : 'light' as any}
        width={350}
        height={400}
        searchPlaceholder="Emoji ara..."
        lazyLoadEmojis={true}
        previewConfig={{
          showPreview: false
        }}
      />
    </motion.div>
  );
} 