interface TypingIndicatorProps {
    username: string;
  }
  
  export function TypingIndicator({ username }: TypingIndicatorProps) {
    return (
      <div className="px-6 py-2">
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <span>{username} is typing</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }