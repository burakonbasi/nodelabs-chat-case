import { motion } from 'framer-motion';
import { FiX, FiDownload, FiShare2, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useState } from 'react';

interface ImagePreviewProps {
  src: string;
  onClose: () => void;
}

export function ImagePreview({ src, onClose }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Image',
          url: src,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <FiDownload className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-5 h-5" />
            ) : (
              <FiMaximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Image */}
      <motion.img
        src={src}
        alt="Preview"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
        drag
        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
        dragElastic={0.2}
        style={{
          scale,
          x: position.x,
          y: position.y,
          cursor: scale > 1 ? 'grab' : 'default',
        }}
        onWheel={(e) => {
          e.stopPropagation();
          const delta = e.deltaY * -0.01;
          const newScale = Math.min(Math.max(0.5, scale + delta), 3);
          setScale(newScale);
        }}
        whileDrag={{ cursor: 'grabbing' }}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale(Math.max(0.5, scale - 0.25));
          }}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <span className="text-xl">−</span>
        </button>
        <span className="text-white text-sm font-medium min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale(Math.min(3, scale + 0.25));
          }}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </motion.div>
  );
} 