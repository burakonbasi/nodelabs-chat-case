import { create } from 'zustand';

export interface MediaFile {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  uploadedAt: Date;
  messageId?: string;
  conversationId: string;
  senderId: string;
}

export interface MediaGalleryState {
  currentMedia: MediaFile | null;
  currentIndex: number;
  isOpen: boolean;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface MediaState {
  // Media files organized by conversation
  mediaByConversation: Record<string, MediaFile[]>;
  
  // Gallery state
  gallery: MediaGalleryState;
  
  // Upload progress tracking
  uploadProgress: Record<string, UploadProgress>;
  
  // Download cache
  downloadCache: Record<string, Blob>;
  
  // Actions
  addMedia: (media: MediaFile) => void;
  removeMedia: (mediaId: string) => void;
  getConversationMedia: (conversationId: string, type?: MediaFile['type']) => MediaFile[];
  
  // Gallery actions
  openGallery: (media: MediaFile, conversationMediaList?: MediaFile[]) => void;
  closeGallery: () => void;
  nextMedia: () => void;
  previousMedia: () => void;
  
  // Upload actions
  setUploadProgress: (fileId: string, progress: number, status: UploadProgress['status'], error?: string) => void;
  clearUploadProgress: (fileId: string) => void;
  
  // Download actions
  cacheDownload: (url: string, blob: Blob) => void;
  getCachedDownload: (url: string) => Blob | null;
  clearDownloadCache: () => void;
  
  // Utility actions
  getMediaStats: (conversationId?: string) => {
    total: number;
    images: number;
    videos: number;
    audio: number;
    documents: number;
    totalSize: number;
  };
}

export const useMediaStore = create<MediaState>((set, get) => ({
  mediaByConversation: {},
  gallery: {
    currentMedia: null,
    currentIndex: 0,
    isOpen: false,
  },
  uploadProgress: {},
  downloadCache: {},

  addMedia: (media) =>
    set((state) => {
      const conversationMedia = state.mediaByConversation[media.conversationId] || [];
      return {
        mediaByConversation: {
          ...state.mediaByConversation,
          [media.conversationId]: [...conversationMedia, media],
        },
      };
    }),

  removeMedia: (mediaId) =>
    set((state) => {
      const newMediaByConversation = { ...state.mediaByConversation };
      
      Object.keys(newMediaByConversation).forEach((conversationId) => {
        newMediaByConversation[conversationId] = newMediaByConversation[conversationId].filter(
          (media) => media.id !== mediaId
        );
      });
      
      return { mediaByConversation: newMediaByConversation };
    }),

  getConversationMedia: (conversationId, type) => {
    const state = get();
    const media = state.mediaByConversation[conversationId] || [];
    
    if (type) {
      return media.filter((m) => m.type === type);
    }
    
    return media;
  },

  openGallery: (media, conversationMediaList) => {
    const state = get();
    let mediaList = conversationMediaList;
    
    if (!mediaList && media.conversationId) {
      // Get all media of the same type from the conversation
      mediaList = state.getConversationMedia(media.conversationId, media.type);
    }
    
    const currentIndex = mediaList?.findIndex((m) => m.id === media.id) || 0;
    
    set({
      gallery: {
        currentMedia: media,
        currentIndex,
        isOpen: true,
      },
    });
  },

  closeGallery: () =>
    set({
      gallery: {
        currentMedia: null,
        currentIndex: 0,
        isOpen: false,
      },
    }),

  nextMedia: () => {
    const state = get();
    const { currentMedia, currentIndex } = state.gallery;
    
    if (!currentMedia || !currentMedia.conversationId) return;
    
    const mediaList = state.getConversationMedia(currentMedia.conversationId, currentMedia.type);
    const nextIndex = (currentIndex + 1) % mediaList.length;
    
    set({
      gallery: {
        ...state.gallery,
        currentMedia: mediaList[nextIndex],
        currentIndex: nextIndex,
      },
    });
  },

  previousMedia: () => {
    const state = get();
    const { currentMedia, currentIndex } = state.gallery;
    
    if (!currentMedia || !currentMedia.conversationId) return;
    
    const mediaList = state.getConversationMedia(currentMedia.conversationId, currentMedia.type);
    const previousIndex = currentIndex === 0 ? mediaList.length - 1 : currentIndex - 1;
    
    set({
      gallery: {
        ...state.gallery,
        currentMedia: mediaList[previousIndex],
        currentIndex: previousIndex,
      },
    });
  },

  setUploadProgress: (fileId, progress, status, error) =>
    set((state) => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: {
          fileId,
          progress,
          status,
          error,
        },
      },
    })),

  clearUploadProgress: (fileId) =>
    set((state) => {
      const newProgress = { ...state.uploadProgress };
      delete newProgress[fileId];
      return { uploadProgress: newProgress };
    }),

  cacheDownload: (url, blob) =>
    set((state) => ({
      downloadCache: {
        ...state.downloadCache,
        [url]: blob,
      },
    })),

  getCachedDownload: (url) => {
    const state = get();
    return state.downloadCache[url] || null;
  },

  clearDownloadCache: () => set({ downloadCache: {} }),

  getMediaStats: (conversationId) => {
    const state = get();
    let media: MediaFile[] = [];
    
    if (conversationId) {
      media = state.mediaByConversation[conversationId] || [];
    } else {
      // Get all media
      media = Object.values(state.mediaByConversation).flat();
    }
    
    const stats = {
      total: media.length,
      images: 0,
      videos: 0,
      audio: 0,
      documents: 0,
      totalSize: 0,
    };
    
    media.forEach((file) => {
      stats.totalSize += file.size;
      
      switch (file.type) {
        case 'image':
          stats.images++;
          break;
        case 'video':
          stats.videos++;
          break;
        case 'audio':
          stats.audio++;
          break;
        case 'document':
          stats.documents++;
          break;
      }
    });
    
    return stats;
  },
}));

// Selectors
export const useMediaGallery = () => useMediaStore((state) => state.gallery);
export const useUploadProgress = (fileId: string) => 
  useMediaStore((state) => state.uploadProgress[fileId]);
export const useConversationMedia = (conversationId: string, type?: MediaFile['type']) =>
  useMediaStore((state) => state.getConversationMedia(conversationId, type));