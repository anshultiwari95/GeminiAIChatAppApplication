'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useStore from '@/store';

const createChatRoomSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title must be less than 50 characters'),
});

type CreateChatRoomFormData = z.infer<typeof createChatRoomSchema>;

interface CreateChatRoomModalProps {
  onClose: () => void;
  onSubmit: (title: string) => void;
}

export default function CreateChatRoomModal({ onClose, onSubmit }: CreateChatRoomModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateChatRoomFormData>({
    resolver: zodResolver(createChatRoomSchema),
  });

  const handleFormSubmit = async (data: CreateChatRoomFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data.title);
      reset();
      onClose();
      toast.success('Chat room created successfully!');
    } catch (error) {
      toast.error('Failed to create chat room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
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
            ? 'bg-blue-600/20 border-slate-700' 
            : 'bg-blue-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isDarkMode 
                  ? 'bg-blue-600' 
                  : 'bg-blue-500'
              }`}>
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold transition-all duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Create New Chat</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="title" className={`block text-sm font-medium transition-all duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-700'
              }`}>
                Chat Room Title
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                placeholder="Enter chat room title..."
                className={`w-full px-4 py-4 border rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-400/50 focus:border-blue-400/50' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-400">{errors.title.message}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-6 py-3 font-medium rounded-2xl transition-all duration-300 border flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-6 py-3 font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 border disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Chat</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
