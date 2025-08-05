import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, Download, Play, ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/date';
import { downloadFile } from '../../lib/media';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Message } from '../../types';

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  messages: Message[];
  initialMediaId?: string;
}

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
  caption?: string;
  timestamp: Date;
  senderName: string;
  messageId: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  isOpen,
  onClose,
  chatId,
  messages,
  initialMediaId
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [groupByDate, setGroupByDate] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const galleryRef = useRef<HTMLDivElement>(null);

  // Extract media items from messages
  const mediaItems = useMemo(() => {
    const items: MediaItem[] = [];
    
    messages.forEach(message => {
      if (message.media) {
        message.media.forEach(media => {
          if (media.type === 'image' || media.type === 'video') {
            items.push({
              id: media.id,
              url: media.url,
              thumbnailUrl: media.thumbnailUrl,
              type: media.type,
              caption: media.caption,
              timestamp: message.timestamp,
              senderName: message.senderName,
              messageId: message.id
            });
          }
        });
      }
    });

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [messages]);

  // Filter media items
  const filteredMedia = useMemo(() => {
    if (filter === 'all') return mediaItems;
    return mediaItems.filter(item => 
      filter === 'images' ? item.type === 'image' : item.type === 'video'
    );
  }, [mediaItems, filter]);

  // Group by date
  const groupedMedia = useMemo(() => {
    if (!groupByDate) return { 'All Media': filteredMedia };

    const groups: Record<string, MediaItem[]> = {};
    
    filteredMedia.forEach(item => {
      const dateKey = formatDate(item.timestamp, 'MMM yyyy');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  }, [filteredMedia, groupByDate]);

  // Set initial media
  useEffect(() => {
    if (initialMediaId && isOpen) {
      const index = filteredMedia.findIndex(item => item.id === initialMediaId);
      if (index !== -1) {
        setSelectedMediaIndex(index);
      }
    }
  }, [initialMediaId, filteredMedia, isOpen]);

  const handlePrevious = useCallback(() => {
    if (selectedMediaIndex === null) return;
    const newIndex = selectedMediaIndex - 1;
    if (newIndex >= 0) {
      setSelectedMediaIndex(newIndex);
    }
  }, [selectedMediaIndex]);

  const handleNext = useCallback(() => {
    if (selectedMediaIndex === null) return;
    const newIndex = selectedMediaIndex + 1;
    if (newIndex < filteredMedia.length) {
      setSelectedMediaIndex(newIndex);
    }
  }, [selectedMediaIndex, filteredMedia.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedMediaIndex === null) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        setSelectedMediaIndex(null);
        break;
    }
  }, [selectedMediaIndex, handlePrevious, handleNext]);

  useEffect(() => {
    if (selectedMediaIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedMediaIndex, handleKeyDown]);

  const handleDownload = useCallback((media: MediaItem) => {
    const filename = `${media.type}_${media.timestamp.getTime()}.${
      media.type === 'image' ? 'jpg' : 'mp4'
    }`;
    downloadFile(media.url, filename);
  }, []);

  if (!isOpen) return null;

  const selectedMedia = selectedMediaIndex !== null ? filteredMedia[selectedMediaIndex] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-white font-semibold">Media Gallery</h2>
            <span className="text-white/70">
              {filteredMedia.length} {filter === 'all' ? 'items' : filter}
            </span>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/10 rounded-lg p-1">
              {(['all', 'images', 'videos'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setGroupByDate(!groupByDate)}
              className={`p-2 rounded-lg transition-colors ${
                groupByDate
                  ? 'bg-white/20 text-white'
                  : 'hover:bg-white/10 text-white/70'
              }`}
              title="Group by date"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedMedia ? (
        // Lightbox View
        <div className="fixed inset-0 flex items-center justify-center">
          {/* Navigation */}
          {selectedMediaIndex! > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          
          {selectedMediaIndex! < filteredMedia.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Media Display */}
          <div className="max-w-[90vw] max-h-[90vh] relative">
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption || 'Image'}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh]"
              />
            )}
          </div>

          {/* Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="font-medium">{selectedMedia.senderName}</p>
                <p className="text-sm text-white/70">
                  {formatDate(selectedMedia.timestamp)}
                </p>
                {selectedMedia.caption && (
                  <p className="mt-2">{selectedMedia.caption}</p>
                )}
              </div>
              <button
                onClick={() => handleDownload(selectedMedia)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedMediaIndex(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      ) : (
        // Grid View
        <div 
          ref={galleryRef}
          className="mt-16 p-4 overflow-y-auto h-[calc(100vh-4rem)]"
        >
          {Object.entries(groupedMedia).map(([date, items]) => (
            <div key={date} className="mb-8">
              {groupByDate && (
                <h3 className="text-white/70 font-medium mb-4 sticky top-0 bg-black/95 py-2">
                  {date}
                </h3>
              )}
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1">
                {items.map((item, index) => (
                  <MediaThumbnail
                    key={item.id}
                    item={item}
                    onClick={() => {
                      const globalIndex = filteredMedia.findIndex(m => m.id === item.id);
                      setSelectedMediaIndex(globalIndex);
                    }}
                    onLoad={() => {
                      setImageLoadingStates(prev => ({
                        ...prev,
                        [item.id]: false
                      }));
                    }}
                    isLoading={imageLoadingStates[item.id] !== false}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Thumbnail Component
interface MediaThumbnailProps {
  item: MediaItem;
  onClick: () => void;
  onLoad: () => void;
  isLoading: boolean;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  item,
  onClick,
  onLoad,
  isLoading
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(ref, {
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="relative aspect-square bg-gray-900 cursor-pointer overflow-hidden rounded-sm hover:opacity-80 transition-opacity"
    >
      {isIntersecting && (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
            </div>
          )}
          
          {item.type === 'image' ? (
            <img
              src={item.thumbnailUrl || item.url}
              alt=""
              onLoad={onLoad}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <>
              <img
                src={item.thumbnailUrl || ''}
                alt=""
                onLoad={onLoad}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-8 h-8 text-white" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};