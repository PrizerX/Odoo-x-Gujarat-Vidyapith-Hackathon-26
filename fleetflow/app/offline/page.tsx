'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f3f4f6' }}>
          <WifiOff className="w-10 h-10" style={{ color: '#714b67' }} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          No internet connection detected. FleetFlow works offline, but some features may be limited.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">What you can do offline:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ View all your data</li>
            <li>✓ Add vehicles and drivers</li>
            <li>✓ Create trips and expenses</li>
            <li>✓ View analytics</li>
            <li>✓ All changes are saved locally</li>
          </ul>
        </div>

        <button
          onClick={handleRetry}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: '#714b67' }}
        >
          <RefreshCw className="w-5 h-5" />
          Retry Connection
        </button>

        <p className="text-sm text-gray-500 mt-4">
          FleetFlow is designed to work offline. Your data is stored securely in your browser.
        </p>
      </div>
    </div>
  );
}
