import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const NetworkStatus: React.FC = () => {
  const networkInfo = useNetworkStatus();
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

  const getSignalStrength = () => {
    if (!networkInfo.effectiveType) return 'Unknown';
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
        return 'Very Low';
      case '2g':
        return 'Low';
      case '3g':
        return 'Medium';
      case '4g':
        return 'High';
      default:
        return 'Unknown';
    }
  };

  const getSignalColor = () => {
    if (!isOnline) return 'text-red-600';
    
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'text-red-600';
      case '3g':
        return 'text-yellow-600';
      case '4g':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`p-1 rounded transition-colors ${getSignalColor()}`}>
        {isOnline ? (
          networkInfo.effectiveType === '4g' ? (
            <Signal className="h-4 w-4" />
          ) : (
            <Wifi className="h-4 w-4" />
          )
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
      </div>
      <div className="text-xs text-secondary-dark">
        {isOnline ? (
          <span>
            {networkInfo.effectiveType?.toUpperCase() || 'Connected'} 
            {networkInfo.downlink && ` • ${networkInfo.downlink.toFixed(1)} Mbps`}
          </span>
        ) : (
          'Offline'
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;