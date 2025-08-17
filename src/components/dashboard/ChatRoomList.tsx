'use client';

import { Clock, TrendingUp, Users, Trash2 } from 'lucide-react';
import { safeFormatTime } from '@/utils/dateUtils';
import useStore from '@/store';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ChatRoom {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface ChatRoomListProps {
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  onSelectChatRoom: (chatRoom: ChatRoom) => void;
}

export default function ChatRoomList({ chatRooms, currentChatRoom, onSelectChatRoom }: ChatRoomListProps) {
  const { isDarkMode, deleteChatRoom } = useStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<ChatRoom | null>(null);

  // Get room icon based on title
  const getRoomIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('tech') || lowerTitle.includes('support')) return '🔧';
    if (lowerTitle.includes('creative') || lowerTitle.includes('writing')) return '✍️';
    if (lowerTitle.includes('general') || lowerTitle.includes('question')) return '❓';
    if (lowerTitle.includes('business') || lowerTitle.includes('work')) return '💼';
    if (lowerTitle.includes('personal') || lowerTitle.includes('life')) return '🌟';
    return '💬';
  };

  // Get room color based on title - more subtle and aesthetic
  const getRoomColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('tech') || lowerTitle.includes('support')) {
      return isDarkMode 
        ? 'bg-blue-500/10 border-blue-400/20' 
        : 'bg-blue-50 border-blue-200';
    }
    if (lowerTitle.includes('creative') || lowerTitle.includes('writing')) {
      return isDarkMode 
        ? 'bg-purple-500/10 border-purple-400/20' 
        : 'bg-purple-50 border-purple-200';
    }
    if (lowerTitle.includes('general') || lowerTitle.includes('question')) {
      return isDarkMode 
        ? 'bg-emerald-500/10 border-emerald-400/20' 
        : 'bg-emerald-50 border-emerald-200';
    }
    if (lowerTitle.includes('business') || lowerTitle.includes('work')) {
      return isDarkMode 
        ? 'bg-amber-500/10 border-amber-400/20' 
        : 'bg-amber-50 border-amber-200';
    }
    if (lowerTitle.includes('personal') || lowerTitle.includes('life')) {
      return isDarkMode 
        ? 'bg-indigo-500/10 border-indigo-400/20' 
        : 'bg-indigo-50 border-indigo-200';
    }
    return isDarkMode 
      ? 'bg-slate-500/10 border-slate-400/20' 
      : 'bg-slate-50 border-slate-200';
  };

  const handleDeleteClick = (e: React.MouseEvent, room: ChatRoom) => {
    e.stopPropagation();
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    setDeletingId(roomToDelete.id);
    try {
      deleteChatRoom(roomToDelete.id);
      toast.success(`Chat room "${roomToDelete.title}" deleted successfully!`);
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (error) {
      toast.error('Failed to delete chat room');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {chatRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectChatRoom(room)}
            className={`group relative overflow-hidden rounded-3xl border shadow-lg cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-xl active:scale-95 ${
              currentChatRoom?.id === room.id 
                ? 'ring-2 ring-blue-400/50 scale-105' 
                : ''
            } ${getRoomColor(room.title)}`}
          >
            {/* Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-4xl flex-shrink-0">{getRoomIcon(room.title)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-bold truncate transition-all duration-500 ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{room.title}</h3>
                    <p className={`text-sm transition-all duration-500 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>Created {safeFormatTime(room.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  {room.unreadCount > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{room.unreadCount}</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDeleteClick(e, room)}
                    className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/20' 
                        : 'text-slate-500 hover:text-red-500 hover:bg-red-100'
                    }`}
                    title="Delete chat room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Last message preview */}
              {room.lastMessage && (
                <div className="mb-4">
                  <p className={`text-sm line-clamp-2 leading-relaxed transition-all duration-500 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {room.lastMessage}
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer with stats */}
            <div className={`p-6 border-t transition-all duration-500 ${
              isDarkMode ? 'border-slate-600/30 bg-slate-700/20' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className={`flex items-center justify-between text-sm transition-all duration-500 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {room.lastMessageTime ? safeFormatTime(room.lastMessageTime) : 'No messages'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>1</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
              isDarkMode ? 'bg-white/5' : 'bg-slate-900/5'
            }`}></div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          
          {/* Modal */}
          <div className={`relative w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all duration-500 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-slate-200'
          }`}>
            {/* Header */}
            <div className={`relative p-6 border-b transition-all duration-500 ${
              isDarkMode 
                ? 'bg-red-600/20 border-slate-700' 
                : 'bg-red-50 border-slate-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-red-600' 
                    : 'bg-red-500'
                }`}>
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-bold transition-all duration-500 ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Delete Chat Room</h2>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <p className={`text-base transition-all duration-500 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Are you sure you want to delete <span className="font-semibold text-red-500">&ldquo;{roomToDelete.title}&rdquo;</span>?
                </p>
                <p className={`text-sm transition-all duration-500 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  This action cannot be undone. All messages in this chat room will be permanently deleted.
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4 pt-6">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className={`flex-1 px-6 py-3 font-medium rounded-2xl transition-all duration-300 border flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingId === roomToDelete.id}
                  className={`flex-1 px-6 py-3 font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 border disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                    isDarkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-500/30' 
                      : 'bg-red-500 hover:bg-red-600 text-white border-red-400/30'
                  }`}
                >
                  {deletingId === roomToDelete.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
