import { useState, useEffect } from 'react';
import { NetworkInfo } from '../types/commute';

export function useNetworkStatus(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    type: 'unknown',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          type: connection.type || 'unknown',
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50
        });
      }
    };

    updateNetworkInfo();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}