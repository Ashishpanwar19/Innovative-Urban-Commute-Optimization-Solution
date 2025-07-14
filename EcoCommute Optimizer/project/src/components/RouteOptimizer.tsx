import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, Leaf, DollarSign, Activity, Route } from 'lucide-react';
import { useCommute } from '../context/CommuteContext';
import { RouteOption } from '../types/commute';
import { calculateCarbonFootprint } from '../utils/emissions';

const RouteOptimizer: React.FC = () => {
  const { setRouteOptions, userPrefs, currentLocation } = useCommute();
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const transportModes = [
    { id: 'bike', label: 'Bike', icon: '🚲', color: 'green' },
    { id: 'ev', label: 'Electric Car', icon: '🔋', color: 'blue' },
    { id: 'public', label: 'Public Transit', icon: '🚌', color: 'purple' },
    { id: 'walk', label: 'Walking', icon: '🚶', color: 'orange' }
  ];

  useEffect(() => {
    if (currentLocation) {
      // Auto-fill current location
      setStartAddress(`${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`);
    }
  }, [currentLocation]);

  const generateRouteOptions = async () => {
    if (!startAddress || !endAddress) return;
    
    setIsLoading(true);
    
    // Simulate API call to route optimization service
    setTimeout(() => {
      const baseDistance = 5 + Math.random() * 10; // 5-15 km
      const baseTime = 20 + Math.random() * 30; // 20-50 minutes
      
      const mockRoutes: RouteOption[] = [
        {
          id: '1',
          type: 'bike',
          distance: baseDistance * 0.9,
          duration: baseTime * 1.2,
          carbonFootprint: calculateCarbonFootprint(baseDistance * 0.9, 'bike'),
          cost: 0,
          difficulty: 'moderate',
          airQualityScore: 85,
          route: generateMockRoute(baseDistance * 0.9),
          instructions: [
            'Head east on Main St',
            'Turn left on Green Avenue',
            'Take the bike path through Central Park',
            'Continue straight for 2.5 km',
            'Arrive at destination'
          ]
        },
        {
          id: '2',
          type: 'public',
          distance: baseDistance * 1.1,
          duration: baseTime * 0.8,
          carbonFootprint: calculateCarbonFootprint(baseDistance * 1.1, 'public'),
          cost: 3.50,
          difficulty: 'easy',
          airQualityScore: 92,
          route: generateMockRoute(baseDistance * 1.1),
          instructions: [
            'Walk to Metro Station (5 min)',
            'Take Green Line to City Center (15 min)',
            'Transfer to Blue Line (18 min)',
            'Walk to destination (3 min)'
          ]
        },
        {
          id: '3',
          type: 'ev',
          distance: baseDistance,
          duration: baseTime * 0.6,
          carbonFootprint: calculateCarbonFootprint(baseDistance, 'ev'),
          cost: 2.20,
          difficulty: 'easy',
          airQualityScore: 78,
          route: generateMockRoute(baseDistance),
          instructions: [
            'Head north on Highway 101',
            'Take Exit 23 toward Downtown',
            'Turn right on Business District Ave',
            'Destination on the right'
          ]
        },
        {
          id: '4',
          type: 'walk',
          distance: baseDistance * 0.8,
          duration: baseTime * 3,
          carbonFootprint: 0,
          cost: 0,
          difficulty: 'hard',
          airQualityScore: 90,
          route: generateMockRoute(baseDistance * 0.8),
          instructions: [
            'Head south on pedestrian path',
            'Cross at Main Street intersection',
            'Continue through Riverside Park',
            'Follow scenic route along the river',
            'Arrive at destination'
          ]
        }
      ];
      
      // Sort by eco-friendliness if preferred
      const sortedRoutes = userPrefs.ecoFriendlyPriority
        ? mockRoutes.sort((a, b) => a.carbonFootprint - b.carbonFootprint)
        : mockRoutes.sort((a, b) => a.duration - b.duration);
      
      setRoutes(sortedRoutes);
      setRouteOptions(sortedRoutes);
      setIsLoading(false);
    }, 1500);
  };

  const generateMockRoute = (distance: number) => {
    const points = [];
    const numPoints = Math.floor(distance * 2); // 2 points per km
    
    for (let i = 0; i < numPoints; i++) {
      points.push({
        lat: 37.7749 + (Math.random() - 0.5) * 0.1, // Around San Francisco
        lng: -122.4194 + (Math.random() - 0.5) * 0.1
      });
    }
    
    return points;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAirQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Route Input */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center space-x-2 mb-6">
          <Route className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Route Optimizer</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                placeholder="Enter starting location"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={endAddress}
                onChange={(e) => setEndAddress(e.target.value)}
                placeholder="Enter destination"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={generateRouteOptions}
            disabled={!startAddress || !endAddress || isLoading}
            className="w-full btn-primary py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Optimizing Routes...</span>
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" />
                <span>Find Best Routes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Route Options */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Route Options</h3>
          
          {routes.map((route) => {
            const modeInfo = transportModes.find(m => m.id === route.type);
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`glass-card-light rounded-xl p-6 cursor-pointer transition-all card-hover ${
                  selectedRoute === route.id ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{modeInfo?.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{modeInfo?.label}</h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {route.difficulty} difficulty
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatDuration(route.duration)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {route.distance.toFixed(1)} km
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {route.carbonFootprint.toFixed(0)}g CO₂
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Carbon</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        ${route.cost.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Cost</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Activity className={`h-4 w-4 ${getDifficultyColor(route.difficulty)}`} />
                      <span className={`text-sm font-medium ${getDifficultyColor(route.difficulty)}`}>
                        {route.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Difficulty</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${getAirQualityColor(route.airQualityScore).replace('text-', 'bg-')}`}></div>
                      <span className={`text-sm font-medium ${getAirQualityColor(route.airQualityScore)}`}>
                        {route.airQualityScore}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Air Quality</div>
                  </div>
                </div>
                
                {selectedRoute === route.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Route Instructions</h5>
                    <div className="space-y-2">
                      {route.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start space-x-3 text-sm">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{instruction}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <button className="flex-1 btn-primary py-2 rounded-lg font-medium">
                        Start Navigation
                      </button>
                      <button className="flex-1 btn-secondary py-2 rounded-lg font-medium">
                        Save Route
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Eco Benefits Summary */}
      {routes.length > 0 && (
        <div className="glass-card rounded-xl p-6 gradient-overlay card-hover">
          <div className="flex items-center space-x-2 mb-4">
            <Leaf className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-primary-dark neon-green">Environmental Impact</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 neon-green">
                {Math.max(...routes.map(r => calculateCarbonFootprint(r.distance, 'car') - r.carbonFootprint)).toFixed(0)}g
              </div>
              <div className="text-sm text-secondary-dark">CO₂ Saved vs. Car</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 neon-green">
                {Math.max(...routes.map(r => r.airQualityScore))}
              </div>
              <div className="text-sm text-secondary-dark">Best Air Quality Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 neon-green">
                ${Math.max(...routes.map(r => 5.50 - r.cost)).toFixed(2)}
              </div>
              <div className="text-sm text-secondary-dark">Money Saved vs. Car</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteOptimizer;