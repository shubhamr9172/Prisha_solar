export const MIN_BILL = 500;
export const MAX_BILL = 50000;

export const WHITELISTED_PINCODES = [
  '400701', // Kopar Khairane
  '400702', // Vashi
  '400703', // Sanpada
  '400705', // Nerul
  '400706', // Karave / Nerul
  '400708', // Airoli
  '400709', // Kopar Khairane sector 8
  '400710', // Ghansoli (Prisha Headquarters)
  '400601', // Thane West
  '400602', // Thane
  '400603', // Thane
  '400604', // Thane
  '400607', // Thane
  '400610', // Thane East
  '400615'  // Kalwa / Thane
];

export interface SolarCalculationResult {
  recommendedCapacitykW: number;
  estimatedCost: number;
  subsidy: number;
  netCost: number;
  monthlySavings: number;
  paybackYears: number;
  emiOptions: { tenure: number; emi: number }[];
}

/**
 * Calculates solar parameters based on monthly electric bill in INR.
 * Strict type safety and boundary checking.
 */
export function calculateSolarDetails(monthlyBill: number): SolarCalculationResult {
  const bill = Math.max(MIN_BILL, Math.min(MAX_BILL, monthlyBill));
  
  // Estimation rules:
  // Avg electricity cost in Mumbai is ~Rs. 10 per unit
  // 1 kW solar system produces ~120 units per month, saving ~Rs 1,200 per month
  const unitsConsumed = bill / 10;
  const recommendedCapacitykW = Math.min(20, parseFloat((unitsConsumed / 120).toFixed(1)));
  
  // Baseline cost of solar is ~Rs 60,000 per kW in India
  const costPerkW = 60000;
  const estimatedCost = recommendedCapacitykW * costPerkW;

  // PM Surya Ghar Muft Bijli Yojana Subsidy Structure:
  // Up to 2 kW: Rs. 30,000 per kW (max Rs. 60,000)
  // Additional 3rd kW: Rs. 18,000 (total max Rs. 78,000 for 3 kW and above)
  let subsidy = 0;
  if (recommendedCapacitykW >= 3) {
    subsidy = 78000;
  } else if (recommendedCapacitykW > 0) {
    // Linear calculation for fractional capacities
    if (recommendedCapacitykW <= 2) {
      subsidy = recommendedCapacitykW * 30000;
    } else {
      subsidy = 60000 + (recommendedCapacitykW - 2) * 18000;
    }
  }
  subsidy = Math.round(subsidy);

  const netCost = Math.max(0, estimatedCost - subsidy);
  const monthlySavings = recommendedCapacitykW * 120 * 10; // Rs. 1,200 savings per kW
  const paybackYears = parseFloat((netCost / (monthlySavings * 12)).toFixed(1));

  // EMI calculation (assume 10.5% interest rate per annum)
  const annualRate = 0.105;
  const monthlyRate = annualRate / 12;
  const tenures = [12, 24, 36, 60];
  const emiOptions = tenures.map(tenure => {
    // EMI = [P x R x (1+R)^N]/[((1+R)^N)-1]
    const p = netCost;
    const r = monthlyRate;
    const n = tenure;
    let emi = 0;
    if (p > 0) {
      emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    }
    return { tenure, emi };
  });

  return {
    recommendedCapacitykW,
    estimatedCost,
    subsidy,
    netCost,
    monthlySavings,
    paybackYears,
    emiOptions
  };
}
