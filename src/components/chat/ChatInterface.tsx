'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon, Copy, Download, Loader2 } from 'lucide-react';
import useStore from '@/store';
import { generateGeminiResponse, generateGeminiResponseWithContext } from '@/lib/gemini';
import toast from 'react-hot-toast';

const MESSAGES_PER_PAGE = 20;

export default function ChatInterface() {
  const { currentChatRoom, messages, addMessage, setLoading, isLoading } = useStore();
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate older messages for infinite scroll
  const generateOlderMessages = useCallback(() => {
    const olderMessages = [];
    const baseTime = new Date();
    
    for (let i = 0; i < MESSAGES_PER_PAGE; i++) {
      const messageTime = new Date(baseTime.getTime() - (currentPage * MESSAGES_PER_PAGE + i) * 60000);
      olderMessages.push({
        id: `old-${currentPage}-${i}`,
        content: `This is an older message from ${messageTime.toLocaleTimeString()}. It demonstrates the infinite scroll functionality with simulated historical data.`,
        sender: (Math.random() > 0.5 ? 'user' : 'ai') as 'user' | 'ai',
        timestamp: messageTime,
        imageUrl: Math.random() > 0.8 ? `https://picsum.photos/300/200?random=${currentPage * MESSAGES_PER_PAGE + i}` : undefined
      });
    }
    
    return olderMessages;
  }, [currentPage]);

  // Load older messages (simulated)
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMoreMessages) return;
    
    setIsLoadingOlder(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const olderMessages = generateOlderMessages();
    
    // Add older messages to the beginning of the messages array
    olderMessages.forEach(msg => {
      addMessage(msg.content, msg.sender, msg.imageUrl);
    });
    
    setCurrentPage(prev => prev + 1);
    
    // Stop loading more after 5 pages (simulate limited history)
    if (currentPage >= 5) {
      setHasMoreMessages(false);
    }
    
    setIsLoadingOlder(false);
    toast.success(`Loaded ${MESSAGES_PER_PAGE} older messages`);
  }, [isLoadingOlder, hasMoreMessages, currentPage, generateOlderMessages, addMessage]);

  // Handle scroll to detect when to load older messages
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop } = chatContainerRef.current;
    
    // Load older messages when user scrolls near the top
    if (scrollTop < 100 && hasMoreMessages && !isLoadingOlder) {
      loadOlderMessages();
    }
  }, [hasMoreMessages, isLoadingOlder, loadOlderMessages]);

  // Throttled scroll handler
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 100);
    const chatContainer = chatContainerRef.current;
    
    if (chatContainer) {
      chatContainer.addEventListener('scroll', throttledScroll);
      return () => chatContainer.removeEventListener('scroll', throttledScroll);
    }
  }, [handleScroll]);

  // Throttle function
  const throttle = (func: (...args: unknown[]) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    
    return function (this: unknown, ...args: unknown[]) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    
    const messageContent = inputMessage.trim();
    const imageUrl = selectedImage;
    
    // Add user message
    addMessage(messageContent || 'Image shared', 'user', imageUrl || undefined);
    setInputMessage('');
    setSelectedImage(null);
    
    // Simulate AI thinking delay (throttling)
    setLoading(true);
    
    // Simulate thinking time (1-3 seconds)
    const thinkingTime = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    try {
      let response: string;
      
      if (messageContent.trim()) {
        // Get chat history for context
        const userMessages = messages;
        
        try {
          const contextResponse = await generateGeminiResponseWithContext(messageContent, userMessages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'ai',
            content: msg.content
          })));
          
          if (typeof contextResponse === 'string') {
            response = contextResponse;
          } else if (contextResponse && typeof contextResponse === 'object' && 'content' in contextResponse) {
            response = contextResponse.content;
          } else {
            throw new Error('Invalid response format from context API');
          }
        } catch (error) {
          console.warn('Context API failed, falling back to simple response:', error);
          // Fallback to simple response
          const simpleResponse = await generateGeminiResponse(messageContent);
          if (typeof simpleResponse === 'string') {
            response = simpleResponse;
          } else if (simpleResponse && typeof simpleResponse === 'object' && 'content' in simpleResponse) {
            response = simpleResponse.content;
          } else {
            throw new Error('Invalid response format from simple API');
          }
        }
      } else {
        // Image-only message
        response = "I can see you've shared an image! While I can't process images in this demo, I'd be happy to help you with any questions or tasks you might have. What would you like to discuss?";
      }
      
      if (typeof response === 'string' && response.trim()) {
        addMessage(response, 'ai');
      } else {
        console.warn('Invalid response format received:', response);
        addMessage('Sorry, I received an invalid response. Please try again.', 'ai');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your request.';
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY')) {
          errorMessage = 'API key not configured. Please check your environment variables.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      addMessage(errorMessage, 'ai');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentChatRoom) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Select a chat room to start chatting
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Choose from your existing chat rooms or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {currentChatRoom.title}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Container with Infinite Scroll */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Load More Messages Button */}
        {hasMoreMessages && (
          <div className="text-center">
            <button
              onClick={loadOlderMessages}
              disabled={isLoadingOlder}
              className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingOlder ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading older messages...</span>
                </div>
              ) : (
                'Load Older Messages'
              )}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 relative group ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {/* Message Content */}
              {message.content && (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              
              {/* Image Display */}
              {message.imageUrl && (
                <div className="mt-2">
                  <img
                    src={message.imageUrl}
                    alt="Shared image"
                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.imageUrl, '_blank')}
                  />
                </div>
              )}
              
              {/* Timestamp */}
              <div className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
              
              {/* Copy Button (appears on hover) */}
              <button
                onClick={() => handleCopyMessage(message.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-black/20 hover:bg-black/30 text-white"
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Gemini is typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          {/* Image Upload */}
          <label className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <ImageIcon className="w-5 h-5" />
          </label>
          
          {/* Message Input */}
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={1}
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: 'auto'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mt-3 relative inline-block">
            <img
              src={selectedImage}
              alt="Selected image"
              className="max-w-32 h-auto rounded-lg border-2 border-blue-300"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
