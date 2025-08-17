'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-3 max-w-[80%]">
        <div className="typing-indicator">
          <span>Gemini is typing</span>
          <div className="flex space-x-1">
            <div className="typing-dot"></div>
            <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
            <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
