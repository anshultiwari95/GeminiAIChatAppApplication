'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store';
import Dashboard from '@/components/dashboard/Dashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isDarkMode } = useStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Redirecting...</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
