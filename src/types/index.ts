export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  dialCode: string;
  flag: string;
}

export interface User {
  id: string;
  phone: string;
  countryCode: string;
  name?: string;
  avatar?: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatRoomId: string;
  content: string;
  type: 'text' | 'image';
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatState {
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
}

export interface UIState {
  isDarkMode: boolean;
  searchQuery: string;
  showTypingIndicator: boolean;
}
