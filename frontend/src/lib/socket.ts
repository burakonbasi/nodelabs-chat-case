import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types';
import { tokenManager } from './api';

class SocketManager {
  private socket: Socket<SocketEvents> | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const token = tokenManager.getAccessToken();
    if (!token) {
      console.error('No token available for socket connection');
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupBaseListeners();
  }

  private setupBaseListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('connected', true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('connected', false);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (!this.socket) return;
    this.socket.on(event as any, callback as any);
  }

  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off(event as any, callback as any);
    } else {
      this.socket.off(event as any);
    }
  }

  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>) {
    if (!this.socket) return;
    this.socket.emit(event as any, ...args);
  }

  joinRoom(conversationId: string) {
    this.emit('join_room', conversationId);
  }

  sendMessage(receiverId: string, content: string) {
    this.emit('send_message', { receiverId, content });
  }

  startTyping(conversationId: string, receiverId: string) {
    this.emit('typing_start', { conversationId, receiverId });
  }

  stopTyping(conversationId: string, receiverId: string) {
    this.emit('typing_stop', { conversationId, receiverId });
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketManager = new SocketManager();
