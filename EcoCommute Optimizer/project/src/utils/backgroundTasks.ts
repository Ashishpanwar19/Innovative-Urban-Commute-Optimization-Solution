import { CommuteData } from '../types/commute';

export const processFootprintData = (commuteData: CommuteData[]) => {
  const processData = (data: CommuteData[]) => {
    // Perform heavy calculations during idle time
    const totalEmissions = data.reduce((sum, commute) => sum + commute.carbonFootprint, 0);
    const avgAirQuality = data.reduce((sum, commute) => sum + commute.airQualityIndex, 0) / data.length;
    
    console.log('Background processing complete:', {
      totalEmissions,
      avgAirQuality,
      commuteCount: data.length
    });
    
    return { totalEmissions, avgAirQuality };
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      processData(commuteData);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      processData(commuteData);
    }, 0);
  }
};

export const scheduleBackgroundSync = (data: any) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    // Register for background sync
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('background-sync');
    });
  } else {
    // Fallback: store data locally
    localStorage.setItem('pending-sync', JSON.stringify(data));
  }
};