import { create } from 'zustand';
import type { Conversation, Message, Reaction } from '../types';
import api from '../lib/api';
import { socketManager } from '../lib/socket';

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
  
  // Additional actions
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  fetchOlderMessages: (conversationId: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
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

  addReaction: async (messageId, emoji) => {
    try {
      await api.post(`/messages/${messageId}/reactions`, { emoji });
      
      // Update local state
      set((state) => ({
        messages: state.messages.map(msg => {
          if (msg._id === messageId) {
            const existingReaction = msg.reactions?.find((r: Reaction) => r.emoji === emoji);
            if (existingReaction) {
              return {
                ...msg,
                reactions: msg.reactions?.map((r: Reaction) => 
                  r.emoji === emoji 
                    ? { ...r, users: [...r.users, 'current-user-id'] }
                    : r
                )
              };
            } else {
              return {
                ...msg,
                reactions: [...(msg.reactions || []), { emoji, users: ['current-user-id'] }]
              };
            }
          }
          return msg;
        })
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  removeReaction: async (messageId, emoji) => {
    try {
      await api.delete(`/messages/${messageId}/reactions/${emoji}`);
      
      // Update local state
      set((state) => ({
        messages: state.messages.map(msg => {
          if (msg._id === messageId) {
            return {
              ...msg,
              reactions: msg.reactions?.map((r: Reaction) => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter((id: string) => id !== 'current-user-id') }
                  : r
              ).filter((r: Reaction) => r.users.length > 0)
            };
          }
          return msg;
        })
      }));
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  fetchOlderMessages: async (conversationId) => {
    const state = get();
    if (state.isLoadingMessages || state.messages.length === 0) return;

    try {
      const oldestMessageId = state.messages[0]._id;
      const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
        params: { before: oldestMessageId, limit: 20 }
      });
      
      set((state) => ({
        messages: [...response.data.data.messages, ...state.messages]
      }));
    } catch (error) {
      console.error('Error fetching older messages:', error);
    }
  },

  updateMessage: async (messageId, content) => {
    try {
      await api.patch(`/messages/${messageId}`, { content });
      
      // Update local state
      set((state) => ({
        messages: state.messages.map(msg => 
          msg._id === messageId 
            ? { ...msg, content, editedAt: new Date().toISOString() }
            : msg
        )
      }));
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      
      // Update local state
      set((state) => ({
        messages: state.messages.filter(msg => msg._id !== messageId)
      }));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },
}));