import { create } from 'zustand';
import { Conversation, Message, User } from '@/types';
import api from '@/lib/api';
import { socketManager } from '@/lib/socket';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  onlineUsers: Set<string>;
  typingUsers: Map<string, Set<string>>; // conversationId -> Set of userIds
  isLoading: boolean;
  isLoadingMessages: boolean;
  
  // Actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  addMessage: (message: Message, conversationId: string) => void;
  markAsRead: (messageId: string) => Promise<void>;
  searchMessages: (query: string) => Promise<Message[]>;
  deleteConversation: (conversationId: string) => Promise<void>;
  
  // Socket actions
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setUserTyping: (userId: string, conversationId: string) => void;
  setUserStoppedTyping: (userId: string, conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: new Map(),
  isLoading: false,
  isLoadingMessages: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/messages/conversations');
      set({ conversations: response.data.data.conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true });
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      set({ messages: response.data.data.messages });
      
      // Join the conversation room
      socketManager.joinRoom(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  setActiveConversation: (conversation) => {
    set({ activeConversation: conversation, messages: [] });
    if (conversation) {
      get().fetchMessages(conversation._id);
    }
  },

  sendMessage: async (receiverId, content) => {
    // Send via socket for real-time delivery
    socketManager.sendMessage(receiverId, content);
    
    // Also send via API for persistence
    try {
      await api.post('/messages/send', { receiverId, content });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  addMessage: (message, conversationId) => {
    set((state) => {
      // Update messages if in active conversation
      if (state.activeConversation?._id === conversationId) {
        return { messages: [...state.messages, message] };
      }
      
      // Update conversation list
      const updatedConversations = state.conversations.map(conv => {
        if (conv._id === conversationId) {
          return { ...conv, lastMessage: message };
        }
        return conv;
      });
      
      return { conversations: updatedConversations };
    });
  },

  markAsRead: async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  searchMessages: async (query) => {
    try {
      const response = await api.get('/messages/search', { params: { q: query } });
      return response.data.data.messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      await api.delete(`/messages/conversations/${conversationId}`);
      set((state) => ({
        conversations: state.conversations.filter(c => c._id !== conversationId),
        activeConversation: state.activeConversation?._id === conversationId ? null : state.activeConversation,
      }));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  setUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: new Set(state.onlineUsers).add(userId),
    }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    });
  },

  setUserTyping: (userId, conversationId) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const conversationTyping = newTypingUsers.get(conversationId) || new Set();
      conversationTyping.add(userId);
      newTypingUsers.set(conversationId, conversationTyping);
      return { typingUsers: newTypingUsers };
    });
  },

  setUserStoppedTyping: (userId, conversationId) => {
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      const conversationTyping = newTypingUsers.get(conversationId);
      if (conversationTyping) {
        conversationTyping.delete(userId);
        if (conversationTyping.size === 0) {
          newTypingUsers.delete(conversationId);
        } else {
          newTypingUsers.set(conversationId, conversationTyping);
        }
      }
      return { typingUsers: newTypingUsers };
    });
  },
}));