export interface UserPreferences {
  transportMode: 'bike' | 'ev' | 'public';
  avoidTolls: boolean;
  maxTimeIncrease: number;
  ecoFriendlyPriority: boolean;
}

export interface CommuteData {
  id: string;
  timestamp: number;
  startLocation: {
    lat: number;
    lng: number;
  };
  endLocation: {
    lat: number;
    lng: number;
  };
  distance: number;
  duration: number;
  transportMode: string;
  carbonFootprint: number;
  route: Array<{
    lat: number;
    lng: number;
  }>;
  airQualityIndex: number;
  networkType: string;
}

export interface RouteOption {
  id: string;
  type: 'bike' | 'ev' | 'public' | 'walk';
  distance: number;
  duration: number;
  carbonFootprint: number;
  cost: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  airQualityScore: number;
  route: Array<{
    lat: number;
    lng: number;
  }>;
  instructions: string[];
}

export interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export interface PollutionData {
  aqi: number;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  so2: number;
}