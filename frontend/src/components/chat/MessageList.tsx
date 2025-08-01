import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, cn } from '@/lib/utils';
import { Message } from '@/types';

export function MessageList() {
  const user = useAuthStore((state) => state.user);
  const { messages, isLoadingMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === user?._id || 
      (typeof message.senderId === 'object' && message.senderId._id === user?._id);
    
    const showDate = index === 0 || 
      new Date(messages[index - 1].createdAt).toDateString() !== 
      new Date(message.createdAt).toDateString();

    return (
      <div key={message._id}>
        {showDate && (
          <div className="flex items-center justify-center my-4">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}
        
        <div className={cn('flex mb-4', isOwn ? 'justify-end' : 'justify-start')}>
          <div
            className={cn(
              'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
              isOwn 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-900'
            )}
          >
            <p className="text-sm">{message.content}</p>
            <p className={cn(
              'text-xs mt-1',
              isOwn ? 'text-primary-200' : 'text-gray-500'
            )}>
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <>
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}