import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CommuteData, UserPreferences, RouteOption } from '../types/commute';

interface CommuteContextType {
  currentLocation: GeolocationPosition | null;
  commuteData: CommuteData[];
  userPrefs: UserPreferences;
  isTracking: boolean;
  routeOptions: RouteOption[];
  setCurrentLocation: (location: GeolocationPosition | null) => void;
  addCommuteData: (data: CommuteData) => void;
  updateUserPrefs: (prefs: Partial<UserPreferences>) => void;
  startTracking: () => void;
  stopTracking: () => void;
  setRouteOptions: (options: RouteOption[]) => void;
}

const CommuteContext = createContext<CommuteContextType | undefined>(undefined);

export function CommuteProvider({ 
  children, 
  userPrefs: initialUserPrefs 
}: { 
  children: ReactNode;
  userPrefs: UserPreferences;
}) {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [commuteData, setCommuteData] = useState<CommuteData[]>([]);
  const [userPrefs, setUserPrefs] = useState<UserPreferences>(initialUserPrefs);
  const [isTracking, setIsTracking] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCommuteData = localStorage.getItem('ecocommute-data');
    const savedUserPrefs = localStorage.getItem('ecocommute-prefs');
    
    if (savedCommuteData) {
      setCommuteData(JSON.parse(savedCommuteData));
    }
    
    if (savedUserPrefs) {
      setUserPrefs(JSON.parse(savedUserPrefs));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('ecocommute-data', JSON.stringify(commuteData));
  }, [commuteData]);

  useEffect(() => {
    localStorage.setItem('ecocommute-prefs', JSON.stringify(userPrefs));
  }, [userPrefs]);

  const addCommuteData = (data: CommuteData) => {
    setCommuteData(prev => [...prev, data]);
  };

  const updateUserPrefs = (prefs: Partial<UserPreferences>) => {
    setUserPrefs(prev => ({ ...prev, ...prefs }));
  };

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  const value: CommuteContextType = {
    currentLocation,
    commuteData,
    userPrefs,
    isTracking,
    routeOptions,
    setCurrentLocation,
    addCommuteData,
    updateUserPrefs,
    startTracking,
    stopTracking,
    setRouteOptions
  };

  return (
    <CommuteContext.Provider value={value}>
      {children}
    </CommuteContext.Provider>
  );
}

export function useCommute() {
  const context = useContext(CommuteContext);
  if (context === undefined) {
    throw new Error('useCommute must be used within a CommuteProvider');
  }
  return context;
}