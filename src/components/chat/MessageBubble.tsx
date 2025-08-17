'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { formatDate } from '@/utils';
import { Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onCopy: () => void;
}

export default function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative group max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Content */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}
        >
          {message.type === 'image' && message.imageUrl ? (
            <div className="space-y-2">
              <img
                src={message.imageUrl}
                alt="Uploaded image"
                className="max-w-full h-auto rounded-lg max-h-64 object-cover"
              />
              <p className="text-sm opacity-90">{message.content}</p>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {formatDate(message.timestamp)}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`absolute top-2 ${
            isUser ? '-left-10' : '-right-10'
          } opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
          title="Copy message"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
}
