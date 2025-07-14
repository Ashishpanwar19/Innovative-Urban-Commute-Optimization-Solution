import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, TrendingUp, Leaf, Award, Calendar, Target } from 'lucide-react';
import { useCommute } from '../context/CommuteContext';
import { processFootprintData } from '../utils/backgroundTasks';

const EcoDashboard: React.FC = () => {
  const { commuteData } = useCommute();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalCommutes: 0,
    totalDistance: 0,
    co2Saved: 0,
    moneySaved: 0,
    averageAirQuality: 0
  });

  useEffect(() => {
    if (commuteData.length > 0) {
      processFootprintData(commuteData);
      calculateStats();
      generateWeeklyChart();
    }
  }, [commuteData]);

  const calculateStats = () => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const recentCommutes = commuteData.filter(c => c.timestamp > thirtyDaysAgo);
    
    const totalDistance = recentCommutes.reduce((sum, c) => sum + c.distance, 0);
    const totalCO2 = recentCommutes.reduce((sum, c) => sum + c.carbonFootprint, 0);
    const carCO2 = recentCommutes.reduce((sum, c) => sum + (c.distance * 120), 0); // 120g CO2/km for car
    const co2Saved = Math.max(0, carCO2 - totalCO2);
    
    const avgAirQuality = recentCommutes.length > 0 
      ? recentCommutes.reduce((sum, c) => sum + c.airQualityIndex, 0) / recentCommutes.length 
      : 0;

    setMonthlyStats({
      totalCommutes: recentCommutes.length,
      totalDistance,
      co2Saved,
      moneySaved: co2Saved * 0.05, // $0.05 per gram CO2 saved
      averageAirQuality: avgAirQuality
    });
  };

  const generateWeeklyChart = () => {
    const now = Date.now();
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i * 24 * 60 * 60 * 1000);
      const dayEnd = dayStart + (24 * 60 * 60 * 1000);
      
      const dayCommutes = commuteData.filter(c => 
        c.timestamp >= dayStart && c.timestamp < dayEnd
      );
      
      const dayCO2 = dayCommutes.reduce((sum, c) => sum + c.carbonFootprint, 0);
      weeklyData.push(dayCO2);
    }
    
    setWeeklyData(weeklyData);
  };

  const renderCO2Chart = () => {
    const canvas = canvasRef.current;
    if (!canvas || weeklyData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const maxValue = Math.max(...weeklyData, 100);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height * i) / 5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw bars
    const barWidth = width / weeklyData.length;
    weeklyData.forEach((value, index) => {
      const barHeight = (value / maxValue) * height * 0.8;
      const x = index * barWidth + barWidth * 0.1;
      const y = height - barHeight;
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(0, y, 0, height);
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(1, '#16a34a');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth * 0.8, barHeight);
      
      // Value labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        value.toFixed(0) + 'g',
        x + (barWidth * 0.8) / 2,
        y - 5
      );
    });
    
    // Days labels
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    
    weeklyData.forEach((_, index) => {
      const dayIndex = (today - 6 + index + 7) % 7;
      const x = index * barWidth + barWidth * 0.5;
      ctx.fillText(days[dayIndex], x, height - 5);
    });
  };

  useEffect(() => {
    renderCO2Chart();
  }, [weeklyData]);

  const achievementBadges = [
    { id: 'eco-warrior', title: 'Eco Warrior', description: '100 eco-friendly commutes', earned: monthlyStats.totalCommutes >= 100 },
    { id: 'carbon-saver', title: 'Carbon Saver', description: '1kg CO₂ saved', earned: monthlyStats.co2Saved >= 1000 },
    { id: 'clean-air', title: 'Clean Air Champion', description: 'Avg air quality >80', earned: monthlyStats.averageAirQuality >= 80 },
    { id: 'distance-master', title: 'Distance Master', description: '500km total distance', earned: monthlyStats.totalDistance >= 500 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card-light rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Commutes</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalCommutes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="glass-card-light rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Distance</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalDistance.toFixed(1)} km</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+8% from last month</span>
          </div>
        </div>

        <div className="glass-card-light rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">CO₂ Saved</p>
              <p className="text-2xl font-bold text-gray-900">{(monthlyStats.co2Saved / 1000).toFixed(2)} kg</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+15% from last month</span>
          </div>
        </div>

        <div className="glass-card-light rounded-xl p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Money Saved</p>
              <p className="text-2xl font-bold text-gray-900">${monthlyStats.moneySaved.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">+20% from last month</span>
          </div>
        </div>
      </div>

      {/* Weekly CO2 Chart */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Weekly CO₂ Emissions</h3>
          </div>
          <div className="text-sm text-gray-500">Last 7 days</div>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={600}
            height={250}
            className="w-full h-64 chart-container rounded-lg"
          />
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center space-x-2 mb-6">
          <Award className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievementBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 ${
                badge.earned
                  ? 'achievement-badge'
                  : 'glass-card border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  badge.earned ? 'bg-yellow-500' : 'bg-gray-400'
                }`}>
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className={`font-medium ${
                    badge.earned ? 'text-yellow-900' : 'text-secondary-dark'
                  }`}>
                    {badge.title}
                  </h4>
                  <p className={`text-sm ${
                    badge.earned ? 'text-yellow-800' : 'text-muted-dark'
                  }`}>
                    {badge.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="glass-card rounded-xl p-6 gradient-overlay card-hover floating">
        <h3 className="text-lg font-semibold mb-4 text-primary-dark neon-green">Your Environmental Impact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-primary-dark">
              {Math.floor(monthlyStats.co2Saved / 1000 * 4)} 🌳
            </div>
            <div className="text-sm text-secondary-dark">Trees equivalent saved</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-primary-dark">
              {Math.floor(monthlyStats.totalDistance / 100)} 🌍
            </div>
            <div className="text-sm text-secondary-dark">Earth circuits completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-primary-dark">
              {Math.floor(monthlyStats.averageAirQuality)}% 💨
            </div>
            <div className="text-sm text-secondary-dark">Average air quality</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoDashboard;