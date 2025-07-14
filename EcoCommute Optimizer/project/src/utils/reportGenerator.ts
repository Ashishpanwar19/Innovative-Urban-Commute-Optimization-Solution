import { CommuteData } from '../types/commute';

export const generatePDFReport = async (
  commuteData: CommuteData[],
  insights: any,
  period: string
) => {
  // Create a simplified PDF report using canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  canvas.width = 800;
  canvas.height = 1000;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('EcoCommute Report', canvas.width / 2, 50);

  // Period
  ctx.font = '16px Arial';
  ctx.fillText(`Period: ${period.toUpperCase()}`, canvas.width / 2, 80);

  // Stats
  ctx.textAlign = 'left';
  ctx.font = '18px Arial';
  ctx.fillText('Summary Statistics', 50, 130);

  ctx.font = '14px Arial';
  ctx.fillText(`Total Commutes: ${commuteData.length}`, 50, 160);
  ctx.fillText(`Total Distance: ${commuteData.reduce((sum, c) => sum + c.distance, 0).toFixed(1)} km`, 50, 180);
  ctx.fillText(`CO₂ Saved: ${(insights.totalCarbonSaved / 1000).toFixed(2)} kg`, 50, 200);
  ctx.fillText(`Average Air Quality: ${insights.averageAirQuality.toFixed(0)}`, 50, 220);

  // Insights
  ctx.font = '18px Arial';
  ctx.fillText('Key Insights', 50, 270);

  ctx.font = '14px Arial';
  ctx.fillText(`Best Transport Mode: ${insights.bestTransportMode}`, 50, 300);
  ctx.fillText(`Peak Commute Time: ${insights.peakCommuteTime}`, 50, 320);
  ctx.fillText(`Recommendation: ${insights.recommendation}`, 50, 340);

  // Chart placeholder
  ctx.strokeStyle = '#e5e7eb';
  ctx.strokeRect(50, 380, 700, 300);
  ctx.fillStyle = '#6b7280';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Commute Data Visualization', canvas.width / 2, 540);

  // Convert canvas to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecocommute-report-${period}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
};