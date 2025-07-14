import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Activity, BarChart3, Settings, Leaf } from 'lucide-react';
import GeolocationTracker from './components/GeolocationTracker';
import RouteOptimizer from './components/RouteOptimizer';
import EcoDashboard from './components/EcoDashboard';
import CommuteAnalyzer from './components/CommuteAnalyzer';
import NetworkStatus from './components/NetworkStatus';
import { CommuteProvider } from './context/CommuteContext';
import { UserPreferences } from './types/commute';

function App() {
  const [activeTab, setActiveTab] = useState<'track' | 'optimize' | 'dashboard' | 'analyze'>('track');
  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    transportMode: 'bike',
    avoidTolls: true,
    maxTimeIncrease: 20,
    ecoFriendlyPriority: true
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const tabs = [
    { id: 'track', label: 'Track', icon: MapPin },
    { id: 'optimize', label: 'Optimize', icon: Navigation },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analyze', label: 'Analyze', icon: Activity }
  ];

  return (
    <CommuteProvider userPrefs={userPrefs}>
      <div className="min-h-screen animated-grid">
        {/* Header */}
        <header className="glass-card sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <Leaf className="h-8 w-8 text-green-400 animate-glow" />
                <h1 className="text-xl font-bold text-primary-dark neon-green">EcoCommute Optimizer</h1>
              </div>
              <div className="flex items-center space-x-4">
                <NetworkStatus />
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isOnline 
                    ? 'status-online text-white' 
                    : 'status-offline text-white'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <Settings className="h-5 w-5 text-secondary-dark cursor-pointer hover:text-green-400 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="glass-card border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-400 text-green-400 neon-green'
                        : 'border-transparent text-secondary-dark hover:text-primary-dark hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fadeIn">
            {activeTab === 'track' && <GeolocationTracker />}
            {activeTab === 'optimize' && <RouteOptimizer />}
            {activeTab === 'dashboard' && <EcoDashboard />}
            {activeTab === 'analyze' && <CommuteAnalyzer />}
          </div>
        </main>

        {/* Footer */}
        <footer className="glass-card mt-20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-muted-dark text-sm">
              <p>© 2025 EcoCommute Optimizer. Making cities greener, one commute at a time.</p>
            </div>
          </div>
        </footer>
      </div>
    </CommuteProvider>
  );
}

export default App;