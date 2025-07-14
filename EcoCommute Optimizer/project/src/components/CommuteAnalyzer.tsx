import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, MapPin, Clock } from 'lucide-react';
import { useCommute } from '../context/CommuteContext';
import { generatePDFReport } from '../utils/reportGenerator';

const CommuteAnalyzer: React.FC = () => {
  const { commuteData } = useCommute();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [filteredData, setFilteredData] = useState(commuteData);
  const [insights, setInsights] = useState({
    mostEfficientRoute: '',
    bestTransportMode: '',
    peakCommuteTime: '',
    averageAirQuality: 0,
    totalCarbonSaved: 0,
    recommendation: ''
  });

  useEffect(() => {
    filterDataByPeriod();
    generateInsights();
  }, [commuteData, selectedPeriod]);

  const filterDataByPeriod = () => {
    const now = Date.now();
    let cutoff = now;
    
    switch (selectedPeriod) {
      case 'week':
        cutoff = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoff = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        cutoff = now - (365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    const filtered = commuteData.filter(c => c.timestamp >= cutoff);
    setFilteredData(filtered);
  };

  const generateInsights = () => {
    if (filteredData.length === 0) return;
    
    // Most efficient route analysis
    const routeEfficiency = filteredData.reduce((acc, commute) => {
      const efficiency = commute.distance / commute.duration;
      return efficiency > acc.efficiency ? { route: commute.id, efficiency } : acc;
    }, { route: '', efficiency: 0 });
    
    // Best transport mode
    const modeStats = filteredData.reduce((acc, commute) => {
      if (!acc[commute.transportMode]) {
        acc[commute.transportMode] = { count: 0, totalCarbon: 0 };
      }
      acc[commute.transportMode].count++;
      acc[commute.transportMode].totalCarbon += commute.carbonFootprint;
      return acc;
    }, {} as any);
    
    const bestMode = Object.entries(modeStats).reduce((best, [mode, stats]: [string, any]) => {
      const avgCarbon = stats.totalCarbon / stats.count;
      return avgCarbon < best.avgCarbon ? { mode, avgCarbon } : best;
    }, { mode: '', avgCarbon: Infinity });
    
    // Peak commute time
    const hourCounts = filteredData.reduce((acc, commute) => {
      const hour = new Date(commute.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as any);
    
    const peakHour = Object.entries(hourCounts).reduce((peak, [hour, count]: [string, any]) => {
      return count > peak.count ? { hour: parseInt(hour), count } : peak;
    }, { hour: 0, count: 0 });
    
    // Average air quality
    const avgAirQuality = filteredData.reduce((sum, c) => sum + c.airQualityIndex, 0) / filteredData.length;
    
    // Total carbon saved (vs car)
    const totalCarbon = filteredData.reduce((sum, c) => sum + c.carbonFootprint, 0);
    const carEquivalent = filteredData.reduce((sum, c) => sum + (c.distance * 120), 0);
    const carbonSaved = Math.max(0, carEquivalent - totalCarbon);
    
    // Generate recommendation
    let recommendation = '';
    if (avgAirQuality < 50) {
      recommendation = 'Consider routes with better air quality to improve your health during commutes.';
    } else if (bestMode.mode === 'bike') {
      recommendation = 'Great job! Continue using bike transportation for maximum environmental benefits.';
    } else if (carbonSaved > 5000) {
      recommendation = 'Excellent carbon savings! You\'re making a real difference for the environment.';
    } else {
      recommendation = 'Try incorporating more eco-friendly transport modes to increase your positive impact.';
    }
    
    setInsights({
      mostEfficientRoute: routeEfficiency.route,
      bestTransportMode: bestMode.mode,
      peakCommuteTime: `${peakHour.hour}:00`,
      averageAirQuality: avgAirQuality,
      totalCarbonSaved: carbonSaved,
      recommendation
    });
  };

  const handleDownloadReport = async () => {
    try {
      await generatePDFReport(filteredData, insights, selectedPeriod);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Commute Analysis</h2>
          <div className="flex space-x-2">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'btn-primary text-white'
                    : 'btn-secondary hover:bg-gray-300'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
            <div className="text-sm text-gray-500">Total Commutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.reduce((sum, c) => sum + c.distance, 0).toFixed(1)} km
            </div>
            <div className="text-sm text-gray-500">Total Distance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(insights.totalCarbonSaved / 1000).toFixed(2)} kg
            </div>
            <div className="text-sm text-gray-500">CO₂ Saved</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Most Efficient Route</div>
                <div className="text-sm text-gray-600">
                  {insights.mostEfficientRoute || 'No data available'}
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Peak Commute Time</div>
                <div className="text-sm text-gray-600">{insights.peakCommuteTime}</div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Best Transport Mode</div>
                <div className="text-sm text-gray-600 capitalize">
                  {insights.bestTransportMode || 'No data available'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 glass-card rounded-lg">
              <div className="font-medium text-blue-400 neon-blue">Air Quality Score</div>
              <div className="text-2xl font-bold text-blue-400 neon-blue">
                {insights.averageAirQuality.toFixed(0)}
              </div>
              <div className="text-sm text-secondary-dark">
                {insights.averageAirQuality >= 80 ? 'Excellent' : 
                 insights.averageAirQuality >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg">
              <div className="font-medium text-green-400 neon-green">Recommendation</div>
              <div className="text-sm text-secondary-dark mt-1">
                {insights.recommendation}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Commutes */}
      <div className="glass-card-light rounded-xl p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Commutes</h3>
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 btn-primary px-4 py-2 rounded-lg transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Mode</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Distance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">CO₂</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Air Quality</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 10).map((commute) => (
                <tr key={commute.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(commute.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 capitalize">
                    {commute.transportMode}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {commute.distance.toFixed(1)} km
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {Math.floor(commute.duration / 60000)} min
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {commute.carbonFootprint.toFixed(0)} g
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      commute.airQualityIndex >= 80 ? 'bg-green-100 text-green-800' :
                      commute.airQualityIndex >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {commute.airQualityIndex}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-secondary-dark">No commute data available for the selected period.</p>
            <p className="text-sm text-muted-dark mt-2">Start tracking your commutes to see analysis here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommuteAnalyzer;