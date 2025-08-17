'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store';
import ChatInterface from '@/components/chat/ChatInterface';
import ChatRoomList from '@/components/dashboard/ChatRoomList';
import CreateChatRoomModal from '@/components/dashboard/CreateChatRoomModal';
import { Bot, LogOut, Search, Plus, MessageSquare, User, Zap, Sparkles, Trash2, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeFormatTime } from '@/utils/dateUtils';

export default function Dashboard() {
  const {
    user,
    chatRooms,
    currentChatRoom,
    selectChatRoom, 
    logout, 
    isDarkMode,
    deleteChatRoom,
    clearCurrentChatRoom,
    toggleDarkMode
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  // Filter chat rooms based on search query
  const filteredChatRooms = chatRooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle logout with proper navigation
  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  // Handle create chat room
  const handleCreateChatRoom = (title: string) => {
    // Create a new chat room and select it
    const newRoom = {
      id: `room_${Date.now()}`,
      title,
      createdAt: new Date(),
      lastMessageTime: new Date(),
      lastMessage: 'Start a new conversation!',
      unreadCount: 0
    };
    selectChatRoom(newRoom);
    setShowCreateModal(false);
    toast.success(`Chat room "${title}" created successfully!`);
  };

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Enhanced Header with Glassmorphism */}
      <div className={`backdrop-blur-xl border-b sticky top-0 z-40 shadow-lg transition-all duration-500 ${
        isDarkMode 
          ? 'bg-slate-800/80 border-slate-700/50' 
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}>
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col items-start">
                <h1 className={`text-3xl font-bold transition-all duration-500 ${
                  isDarkMode 
                    ? 'text-white' 
                    : 'text-slate-800'
                }`}>
                  Gemini AI Dashboard
            </h1>
                <p className={`text-lg transition-all duration-500 ${
                  isDarkMode 
                    ? 'text-slate-300' 
                    : 'text-slate-600'
                }`}>
                  Your AI conversation hub
            </p>
          </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`hidden md:flex items-center space-x-3 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-emerald-500/20 border-emerald-400/30' 
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                }`}></div>
                <span className={`font-semibold transition-all duration-500 ${
                  isDarkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}>AI Ready</span>
              </div>
              
              <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-blue-500/20 border-blue-400/30' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-blue-600' 
                    : 'bg-blue-500'
                }`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className={`font-semibold transition-all duration-500 ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  {user?.name ? user.name.split(' ')[0] : 'User'}
                </span>
              </div>
              
              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-yellow-400 hover:text-yellow-300' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-800'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
          <button
            onClick={handleLogout}
                className={`px-8 py-3 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 border flex items-center justify-center space-x-2 ${
                  isDarkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-500/30' 
                    : 'bg-red-500 hover:bg-red-600 text-white border-red-400/30'
                }`}
              >
                <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Enhanced Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentChatRoom ? (
          <div className="slide-in-up">
            {/* Chat Room Header with Actions */}
            <div className={`mb-6 p-4 rounded-2xl border transition-all duration-500 ${
              isDarkMode 
                ? 'bg-slate-800/80 border-slate-700/50' 
                : 'bg-white/80 border-slate-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-blue-600' 
                      : 'bg-blue-500'
                  }`}>
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold transition-all duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {currentChatRoom.title}
                    </h2>
                    <p className={`text-sm transition-all duration-500 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Created {safeFormatTime(currentChatRoom.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => clearCurrentChatRoom()}
                    className={`px-4 py-2 font-medium rounded-xl transition-all duration-300 border flex items-center justify-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>← Back to Dashboard</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${currentChatRoom.title}"? This action cannot be undone.`)) {
                        deleteChatRoom(currentChatRoom.id);
                        clearCurrentChatRoom();
                        toast.success(`Chat room "${currentChatRoom.title}" deleted successfully!`);
                      }
                    }}
                    className={`px-4 py-2 font-medium rounded-xl transition-all duration-300 border flex items-center justify-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-500/30' 
                        : 'bg-red-500 hover:bg-red-600 text-white border-red-400/30'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Chat</span>
                  </button>
                </div>
              </div>
            </div>
            
            <ChatInterface />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Enhanced with Better Colors */}
            <div className="lg:col-span-1 space-y-8">
              {/* User Info Block - Redesigned */}
              <div className={`relative overflow-hidden rounded-3xl border shadow-xl transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className={`p-8 text-center transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                }`}>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-slate-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 border-white'
                  }`}>
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-bold transition-all duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>
                      {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'User'}!
                    </h3>
                    <p className={`text-lg transition-all duration-500 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {user?.phone ? user.phone : 'Welcome!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Redesigned */}
              <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-6 flex items-center transition-all duration-500 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-amber-600' 
                        : 'bg-amber-500'
                    }`}>
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className={`w-full px-6 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 border flex items-center justify-center space-x-3 ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400/30'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Chat</span>
                    </button>
                    
                    <button
                      onClick={() => selectChatRoom(chatRooms[0])}
                      disabled={chatRooms.length === 0}
                      className={`w-full px-6 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 border flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isDarkMode 
                          ? 'bg-slate-600 hover:bg-slate-700 text-white border-slate-500/30 disabled:bg-slate-500' 
                          : 'bg-slate-500 hover:bg-slate-600 text-white border-slate-400/30 disabled:bg-slate-400'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Continue Latest</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Search - Enhanced */}
              <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700/50' 
                  : 'bg-white/80 border-slate-200/50'
              }`}>
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-6 flex items-center transition-all duration-500 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-emerald-600' 
                        : 'bg-emerald-500'
                    }`}>
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    Search Chats
                  </h3>
                  
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-500 ${
                      isDarkMode ? 'text-emerald-300' : 'text-emerald-500'
                    }`}>
                      <Search className="w-5 h-5" />
                    </div>
            <input
              type="text"
              placeholder="Search chatrooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:ring-emerald-400/50 focus:border-emerald-400/50' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-emerald-500/50 focus:border-emerald-500/50'
                      }`}
            />
          </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Enhanced */}
            <div className="lg:col-span-3">
              {filteredChatRooms.length === 0 ? (
                <div className={`rounded-3xl border shadow-xl h-full flex items-center justify-center p-12 transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/50' 
                    : 'bg-white/80 border-slate-200/50'
                }`}>
                  <div className="text-center max-w-md">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl transition-all duration-500 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}>
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h3 className={`text-3xl font-bold transition-all duration-500 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        {searchQuery ? 'No matches found' : 'Welcome to Gemini AI!'}
                      </h3>
                      <p className={`text-lg transition-all duration-500 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {searchQuery 
                          ? `No chat rooms match "${searchQuery}"`
                          : 'Create your first chat room to start amazing conversations with AI'
                        }
                      </p>
                    </div>
                    {!searchQuery && (
                      <div className="mt-8">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className={`px-10 py-5 font-bold text-xl rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 border flex items-center justify-center space-x-3 mx-auto ${
                            isDarkMode 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400/30'
                          }`}
                        >
                          <Plus className="w-6 h-6" />
                          <span>Start Your First Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Section Header - Enhanced */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <h2 className={`text-3xl font-bold flex items-center mb-2 transition-all duration-500 ${
                        isDarkMode ? 'text-white' : 'text-slate-800'
                      }`}>
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-4 transition-all duration-500 ${
                          isDarkMode 
                            ? 'bg-blue-600' 
                            : 'bg-blue-500'
                        }`}>
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        Your Chat Rooms
                      </h2>
                      <p className={`text-lg transition-all duration-500 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {filteredChatRooms.length} chat room{filteredChatRooms.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`hidden md:flex items-center space-x-3 px-6 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
                        isDarkMode 
                          ? 'bg-indigo-500/20 border-indigo-400/30' 
                          : 'bg-indigo-50 border-indigo-200'
                      }`}>
                        <div className={`w-3 h-3 rounded-full animate-pulse transition-all duration-500 ${
                          isDarkMode ? 'bg-indigo-400' : 'bg-indigo-500'
                        }`}></div>
                        <span className={`font-semibold transition-all duration-500 ${
                          isDarkMode ? 'text-indigo-300' : 'text-indigo-700'
                        }`}>Active</span>
                      </div>
                      
          <button
            onClick={() => setShowCreateModal(true)}
                        className={`px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 border flex items-center justify-center space-x-3 ${
                          isDarkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400/30'
                        }`}
                      >
                        <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

                  {/* Enhanced Chat Room List */}
                  <div className="slide-in-up">
      <ChatRoomList
        chatRooms={filteredChatRooms}
                      currentChatRoom={currentChatRoom}
                      onSelectChatRoom={selectChatRoom}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Chat Room Modal */}
      {showCreateModal && (
        <CreateChatRoomModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateChatRoom}
        />
      )}
    </div>
  );
}
