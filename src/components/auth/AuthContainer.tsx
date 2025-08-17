'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function AuthContainer() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="w-full max-w-lg">
      {/* Auth Mode Toggle */}
      <div className="card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0 mb-8">
        <div className="flex rounded-xl p-2 bg-gray-100 dark:bg-gray-700">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-lg transition-all duration-300 ease-out ${
              authMode === 'login'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span className="font-semibold text-lg">Login</span>
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-lg transition-all duration-300 ease-out ${
              authMode === 'signup'
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-md transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-semibold text-lg">Sign Up</span>
          </button>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="relative">
        {authMode === 'login' ? (
          <div className="slide-in-left">
            <LoginForm />
          </div>
        ) : (
          <div className="slide-in-right">
            <SignupForm />
          </div>
        )}
      </div>

      {/* Auth Mode Info */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center space-x-3 text-base text-gray-500 dark:text-gray-400">
          <Sparkles className="w-5 h-5" />
          <span>
            {authMode === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "
            }
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline transition-colors hover:no-underline"
            >
              {authMode === 'login' ? 'Sign up here' : 'Login here'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
