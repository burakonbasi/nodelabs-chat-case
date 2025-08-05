import api from '../lib/api';
import { Message, MessageReaction, MessageStatus } from '../types';

interface SendMessageData {
  conversationId: string;
  content?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  attachments?: File[];
  replyTo?: string;
  mentions?: string[];
}

interface UpdateMessageData {
  content?: string;
  edited?: boolean;
}

interface MessageSearchParams {
  query: string;
  conversationId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface PaginationParams {
  limit?: number;
  before?: string;
  after?: string;
}

interface ForwardMessageData {
  messageIds: string[];
  conversationIds: string[];
}

class MessageService {
  private readonly MESSAGE_ENDPOINTS = {
    SEND: '/messages',
    GET: '/messages/:id',
    UPDATE: '/messages/:id',
    DELETE: '/messages/:id',
    CONVERSATION_MESSAGES: '/conversations/:conversationId/messages',
    REACT: '/messages/:id/reactions',
    REMOVE_REACTION: '/messages/:id/reactions/:reaction',
    MARK_READ: '/messages/:id/read',
    SEARCH: '/messages/search',
    FORWARD: '/messages/forward',
    PIN: '/messages/:id/pin',
    UNPIN: '/messages/:id/unpin',
    REPORT: '/messages/:id/report',
  };

  async sendMessage(data: SendMessageData): Promise<Message> {
    const formData = new FormData();
    
    if (data.content) formData.append('content', data.content);
    formData.append('conversationId', data.conversationId);
    formData.append('type', data.type);
    if (data.replyTo) formData.append('replyTo', data.replyTo);
    if (data.mentions) formData.append('mentions', JSON.stringify(data.mentions));
    
    // Attach files if any
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await api.post<Message>(
      this.MESSAGE_ENDPOINTS.SEND,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async getMessage(messageId: string): Promise<Message> {
    const response = await api.get<Message>(
      this.MESSAGE_ENDPOINTS.GET.replace(':id', messageId)
    );
    return response.data;
  }

  async getConversationMessages(
    conversationId: string,
    params?: PaginationParams
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    const response = await api.get<{ messages: Message[]; hasMore: boolean }>(
      this.MESSAGE_ENDPOINTS.CONVERSATION_MESSAGES.replace(
        ':conversationId',
        conversationId
      ),
      { params }
    );
    return response.data;
  }

  async updateMessage(
    messageId: string,
    data: UpdateMessageData
  ): Promise<Message> {
    const response = await api.patch<Message>(
      this.MESSAGE_ENDPOINTS.UPDATE.replace(':id', messageId),
      { ...data, edited: true }
    );
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(
      this.MESSAGE_ENDPOINTS.DELETE.replace(':id', messageId)
    );
  }

  async reactToMessage(
    messageId: string,
    reaction: string
  ): Promise<MessageReaction> {
    const response = await api.post<MessageReaction>(
      this.MESSAGE_ENDPOINTS.REACT.replace(':id', messageId),
      { reaction }
    );
    return response.data;
  }

  async removeReaction(
    messageId: string,
    reaction: string
  ): Promise<void> {
    await api.delete(
      this.MESSAGE_ENDPOINTS.REMOVE_REACTION
        .replace(':id', messageId)
        .replace(':reaction', reaction)
    );
  }

  async markAsRead(messageId: string): Promise<MessageStatus> {
    const response = await api.post<MessageStatus>(
      this.MESSAGE_ENDPOINTS.MARK_READ.replace(':id', messageId)
    );
    return response.data;
  }

  async searchMessages(
    params: MessageSearchParams
  ): Promise<{ messages: Message[]; total: number }> {
    const response = await api.get<{ messages: Message[]; total: number }>(
      this.MESSAGE_ENDPOINTS.SEARCH,
      { params }
    );
    return response.data;
  }

  async forwardMessages(data: ForwardMessageData): Promise<Message[]> {
    const response = await api.post<Message[]>(
      this.MESSAGE_ENDPOINTS.FORWARD,
      data
    );
    return response.data;
  }

  async pinMessage(messageId: string): Promise<Message> {
    const response = await api.post<Message>(
      this.MESSAGE_ENDPOINTS.PIN.replace(':id', messageId)
    );
    return response.data;
  }

  async unpinMessage(messageId: string): Promise<Message> {
    const response = await api.post<Message>(
      this.MESSAGE_ENDPOINTS.UNPIN.replace(':id', messageId)
    );
    return response.data;
  }

  async reportMessage(
    messageId: string,
    reason: string,
    description?: string
  ): Promise<void> {
    await api.post(
      this.MESSAGE_ENDPOINTS.REPORT.replace(':id', messageId),
      { reason, description }
    );
  }

  // Utility methods
  formatMessageTime(timestamp: string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Encryption helpers (for E2E encryption)
  async encryptMessage(content: string, publicKey: string): Promise<string> {
    // Implement E2E encryption logic here
    // This is a placeholder - implement actual encryption
    return btoa(content);
  }

  async decryptMessage(encryptedContent: string, privateKey: string): Promise<string> {
    // Implement E2E decryption logic here
    // This is a placeholder - implement actual decryption
    return atob(encryptedContent);
  }
}

export default new MessageService();