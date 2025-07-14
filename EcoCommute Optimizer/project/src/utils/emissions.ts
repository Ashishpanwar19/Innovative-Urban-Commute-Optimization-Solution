export const calculateCarbonFootprint = (distance: number, transportMode: string): number => {
  // Carbon footprint in grams CO2 per kilometer
  const emissionFactors = {
    car: 120,      // gasoline car
    ev: 45,        // electric vehicle
    bike: 0,       // bicycle
    public: 35,    // public transport
    walk: 0        // walking
  };

  const factor = emissionFactors[transportMode as keyof typeof emissionFactors] || 120;
  return distance * factor;
};

export const calculateEmissionsSaved = (distance: number, chosenMode: string): number => {
  const carEmissions = calculateCarbonFootprint(distance, 'car');
  const chosenEmissions = calculateCarbonFootprint(distance, chosenMode);
  return Math.max(0, carEmissions - chosenEmissions);
};

export const getEmissionCategory = (emissions: number): string => {
  if (emissions === 0) return 'Zero Emissions';
  if (emissions <= 30) return 'Very Low';
  if (emissions <= 60) return 'Low';
  if (emissions <= 100) return 'Medium';
  return 'High';
};