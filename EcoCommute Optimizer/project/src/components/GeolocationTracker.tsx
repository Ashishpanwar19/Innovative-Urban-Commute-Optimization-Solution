import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, MapPin, Navigation, AlertTriangle, Leaf } from 'lucide-react';
import { useCommute } from '../context/CommuteContext';
import { CommuteData } from '../types/commute';
import { trackCommute } from '../utils/geolocation';
import { calculateCarbonFootprint } from '../utils/emissions';

const GeolocationTracker: React.FC = () => {
  const { 
    currentLocation, 
    setCurrentLocation, 
    isTracking, 
    startTracking, 
    stopTracking,
    addCommuteData,
    userPrefs
  } = useCommute();
  
  const [route, setRoute] = useState<Array<{lat: number; lng: number}>>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [airQuality, setAirQuality] = useState(50);
  const [isHotspot, setIsHotspot] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [startLocation, setStartLocation] = useState<{lat: number; lng: number} | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isTracking]);

  const startLocationTracking = async () => {
    try {
      if ('geolocation' in navigator) {
        const position = await trackCommute();
        setCurrentLocation(position as GeolocationPosition);
        setStartLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStartTime(Date.now());

        // Watch position changes
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentLocation(position);
            updateRoute(position);
            checkAirQuality(position);
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );

        // Update duration every second
        intervalRef.current = setInterval(() => {
          if (startTime) {
            setDuration(Date.now() - startTime);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save commute data
    if (startLocation && currentLocation && route.length > 0) {
      const carbonFootprint = calculateCarbonFootprint(distance, userPrefs.transportMode);
      
      const commuteData: CommuteData = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        startLocation,
        endLocation: {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude
        },
        distance,
        duration,
        transportMode: userPrefs.transportMode,
        carbonFootprint,
        route,
        airQualityIndex: airQuality,
        networkType: getNetworkType()
      };

      addCommuteData(commuteData);
    }
  };

  const updateRoute = (position: GeolocationPosition) => {
    const newPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    setRoute(prev => [...prev, newPoint]);
    
    // Calculate distance (simplified)
    if (route.length > 0) {
      const lastPoint = route[route.length - 1];
      const newDistance = calculateDistance(lastPoint, newPoint);
      setDistance(prev => prev + newDistance);
    }
  };

  const calculateDistance = (point1: {lat: number; lng: number}, point2: {lat: number; lng: number}) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkAirQuality = (position: GeolocationPosition) => {
    // Simulate air quality check
    const simulatedAQI = Math.floor(Math.random() * 100) + 1;
    setAirQuality(simulatedAQI);
    setIsHotspot(simulatedAQI > 75);
  };

  const getNetworkType = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection?.effectiveType || '4g';
    }
    return '4g';
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
      setRoute([]);
      setDistance(0);
      setDuration(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Live Tracking</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isTracking 
              ? 'status-online text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isTracking ? 'Active' : 'Inactive'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{distance.toFixed(2)} km</div>
            <div className="text-sm text-gray-500">Distance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatDuration(duration)}</div>
            <div className="text-sm text-gray-500">Duration</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${airQuality > 75 ? 'text-red-600' : airQuality > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
              {airQuality}
            </div>
            <div className="text-sm text-gray-500">Air Quality</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userPrefs.transportMode}</div>
            <div className="text-sm text-gray-500">Mode</div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleToggleTracking}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isTracking
                ? 'bg-red-600 text-white hover:bg-red-700 hover:transform hover:-translate-y-1'
                : 'btn-primary hover:transform hover:-translate-y-1'
            }`}
          >
            {isTracking ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
          </button>
        </div>
      </div>

      {/* Location Info */}
      {currentLocation && (
        <div className="glass-card-light rounded-xl p-6 card-hover">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Current Location</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Latitude</div>
              <div className="text-lg font-mono">{currentLocation.coords.latitude.toFixed(6)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Longitude</div>
              <div className="text-lg font-mono">{currentLocation.coords.longitude.toFixed(6)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="text-lg">±{currentLocation.coords.accuracy.toFixed(0)}m</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Speed</div>
              <div className="text-lg">
                {currentLocation.coords.speed 
                  ? `${(currentLocation.coords.speed * 3.6).toFixed(1)} km/h`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {isHotspot && (
        <div className="glass-card border border-red-400/30 rounded-xl p-4 animate-pulse-custom">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="font-medium text-red-400">Pollution Hotspot Detected</div>
              <div className="text-sm text-red-300">
                Consider taking an alternative route to avoid high pollution areas.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Preview */}
      {route.length > 0 && (
        <div className="glass-card-light rounded-xl p-6 card-hover">
          <div className="flex items-center space-x-2 mb-4">
            <Navigation className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Route Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Points tracked:</span>
              <span className="font-medium">{route.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Carbon saved:</span>
              <span className="font-medium text-green-600">
                {calculateCarbonFootprint(distance, 'car') - calculateCarbonFootprint(distance, userPrefs.transportMode)} g CO₂
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mini Map Placeholder */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center space-x-2 mb-4">
          <Leaf className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Route Map</h3>
        </div>
        <div className="h-64 chart-container rounded-lg flex items-center justify-center">
          <div className="text-secondary-dark text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p>Interactive map will appear here</p>
            <p className="text-sm">Showing tracked route and pollution hotspots</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeolocationTracker;