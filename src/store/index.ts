import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name?: string;
  email?: string;
  phone: string;
  countryCode: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatState {
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  messages: Message[];
  isLoading: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface UIState {
  isDarkMode: boolean;
}

export interface Store extends AuthState, ChatState, UIState {
  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  
  // Chat actions
  createChatRoom: (title: string) => void;
  deleteChatRoom: (id: string) => void;
  selectChatRoom: (chatRoom: ChatRoom) => void;
  clearCurrentChatRoom: () => void;
  addMessage: (content: string, sender: 'user' | 'ai', imageUrl?: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  
  // UI actions
  toggleDarkMode: () => void;
}

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      chatRooms: [],
      currentChatRoom: null,
      messages: [],
      isLoading: false,
      isDarkMode: false,

      // Auth actions
      login: (user: User) => {
        set({
          isAuthenticated: true,
          user,
          // Initialize with welcome message for new users
          messages: user.name ? [
            {
              id: 'welcome',
              content: `Hello ${user.name}! Welcome to Gemini AI. I'm here to help you with any questions or tasks you might have. How can I assist you today?`,
              sender: 'ai',
              timestamp: new Date(),
            }
          ] : [
            {
              id: 'welcome',
              content: 'Hello! Welcome to Gemini AI. I\'m here to help you with any questions or tasks you might have. How can I assist you today?',
              sender: 'ai',
              timestamp: new Date(),
            }
          ]
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          chatRooms: [],
          currentChatRoom: null,
          messages: [],
          isLoading: false,
        });
      },

      // Chat actions
      createChatRoom: (title: string) => {
        const newChatRoom: ChatRoom = {
          id: Date.now().toString(),
          title,
          createdAt: new Date(),
          unreadCount: 0,
        };

        set((state) => ({
          chatRooms: [newChatRoom, ...state.chatRooms],
          currentChatRoom: newChatRoom,
          messages: [],
        }));
      },

      deleteChatRoom: (id: string) => {
        set((state) => {
          const updatedChatRooms = state.chatRooms.filter(room => room.id !== id);
          const newCurrentChatRoom = state.currentChatRoom?.id === id 
            ? (updatedChatRooms[0] || null) 
            : state.currentChatRoom;
          
          return {
            chatRooms: updatedChatRooms,
            currentChatRoom: newCurrentChatRoom,
            messages: newCurrentChatRoom?.id === id ? [] : state.messages,
          };
        });
      },

      selectChatRoom: (chatRoom: ChatRoom) => {
        set((state) => ({
          currentChatRoom: chatRoom,
          messages: [], // Clear messages when switching chat rooms
        }));
      },

      clearCurrentChatRoom: () => {
        set({ currentChatRoom: null });
      },

      addMessage: (content: string, sender: 'user' | 'ai', imageUrl?: string) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          content,
          sender,
          timestamp: new Date(),
          imageUrl,
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
          // Update last message in current chat room
          chatRooms: state.chatRooms.map(room => 
            room.id === state.currentChatRoom?.id
              ? {
                  ...room,
                  lastMessage: content,
                  lastMessageTime: new Date(),
                  unreadCount: room.unreadCount + (sender === 'ai' ? 1 : 0),
                }
              : room
          ),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // UI actions
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },
    }),
    {
      name: 'gemini-clone-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        chatRooms: state.chatRooms,
        currentChatRoom: state.currentChatRoom,
        isDarkMode: state.isDarkMode,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str, (key, value) => {
            if (value && typeof value === 'object' && value.__type === 'Date') {
              return new Date(value.value);
            }
            return value;
          });
        },
        setItem: (name, value) => {
          const serialized = JSON.stringify(value, (key, value) => {
            if (value instanceof Date) {
              return { __type: 'Date', value: value.toISOString() };
            }
            return value;
          });
          localStorage.setItem(name, serialized);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useStore;
