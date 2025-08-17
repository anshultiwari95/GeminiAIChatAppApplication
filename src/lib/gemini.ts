import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with environment variables
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';
const maxTokens = parseInt(process.env.NEXT_PUBLIC_GEMINI_MAX_TOKENS || '1000');
const temperature = parseFloat(process.env.NEXT_PUBLIC_GEMINI_TEMPERATURE || '0.7');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey || '');

// Get the Gemini model
const model = genAI.getGenerativeModel({ 
  model: modelName,
  generationConfig: {
    maxOutputTokens: maxTokens,
    temperature: temperature,
    topP: 0.8,
    topK: 40,
  }
});

export interface GeminiResponse {
  success: boolean;
  content: string;
  error?: string;
}

export const generateGeminiResponse = async (message: string): Promise<GeminiResponse> => {
  try {
    // Check if API key is available
    if (!apiKey) {
      console.warn('Gemini API key not configured');
      return {
        success: false,
        content: 'Gemini AI API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file. You can copy env.example to .env.local and add your API key.',
        error: 'API_KEY_MISSING'
      };
    }

    // Generate content using Gemini
    const result = await model.generateContent(message);
    const response = await result.response;
    const content = response.text();

    return {
      success: true,
      content: content || 'I apologize, but I couldn\'t generate a response at the moment.'
    };
  } catch (error) {
    console.error('Gemini AI Error Details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0
    });
    
    // Handle specific error cases
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api_key') || errorMessage.includes('authentication')) {
        return {
          success: false,
          content: 'Invalid Gemini AI API key. Please check your configuration in .env.local file. Make sure the key is correct and active.',
          error: 'API_KEY_INVALID'
        };
      } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return {
          success: false,
          content: 'API quota exceeded or rate limited. Please try again later.',
          error: 'QUOTA_EXCEEDED'
        };
      } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
        return {
          success: false,
          content: 'The message was blocked for safety reasons. Please rephrase your question.',
          error: 'SAFETY_BLOCKED'
        };
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return {
          success: false,
          content: 'Network error occurred. Please check your internet connection and try again.',
          error: 'NETWORK_ERROR'
        };
      } else if (errorMessage.includes('timeout')) {
        return {
          success: false,
          content: 'Request timed out. Please try again.',
          error: 'TIMEOUT'
        };
      }
    }

    return {
      success: false,
      content: `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your API configuration.`,
      error: 'UNKNOWN_ERROR'
    };
  }
};

// Enhanced response generation with context
export const generateGeminiResponseWithContext = async (
  message: string, 
  chatHistory: Array<{ role: 'user' | 'ai', content: string }>
): Promise<GeminiResponse> => {
  try {
    if (!apiKey) {
      console.warn('Gemini API key not configured for context response');
      return {
        success: false,
        content: 'Gemini AI API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.',
        error: 'API_KEY_MISSING'
      };
    }

    // Validate chat history format
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
      console.warn('Invalid chat history: first message must be from user, got:', chatHistory[0].role);
      // Fall back to simple response without context
      return generateGeminiResponse(message);
    }

    // Build conversation history with proper format
    const conversation = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
        topP: 0.8,
        topK: 40,
      },
    });

    // Generate response
    const result = await conversation.sendMessage(message);
    const response = await result.response;
    const content = response.text();

    return {
      success: true,
      content: content || 'I apologize, but I couldn\'t generate a response at the moment.'
    };
  } catch (error) {
    console.error('Gemini AI Context Error Details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      apiKeyExists: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      chatHistoryLength: chatHistory.length,
      chatHistoryRoles: chatHistory.map(msg => msg.role)
    });
    
    // Handle specific error cases
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('first content should be with role')) {
        console.warn('Chat history format error, falling back to simple response');
        // Fall back to simple response without context
        return generateGeminiResponse(message);
      } else if (errorMessage.includes('api_key') || errorMessage.includes('authentication')) {
        return {
          success: false,
          content: 'Invalid Gemini AI API key. Please check your configuration in .env.local file.',
          error: 'API_KEY_INVALID'
        };
      } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return {
          success: false,
          content: 'API quota exceeded or rate limited. Please try again later.',
          error: 'QUOTA_EXCEEDED'
        };
      } else if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
        return {
          success: false,
          content: 'The message was blocked for safety reasons. Please rephrase your question.',
          error: 'SAFETY_BLOCKED'
        };
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return {
          success: false,
          content: 'Network error occurred. Please check your internet connection and try again.',
          error: 'NETWORK_ERROR'
        };
      } else if (errorMessage.includes('timeout')) {
        return {
          success: false,
          content: 'Request timed out. Please try again.',
          error: 'TIMEOUT'
        };
      }
    }

    return {
      success: false,
      content: `Sorry, I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your API configuration.`,
      error: 'CONTEXT_ERROR'
    };
  }
};
