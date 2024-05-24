import amortize from 'amortize';

interface AmortizationResult {
  interest: number;
  principal: number;
  balance: number;
  payment: number;
  interestRound: string;
  principalRound: string;
  balanceRound: string;
  paymentRound: string;
}

interface PossibleEquityResult {
  baseMonthlyPayment: string;
  upfrontMIP?: string;
  monthlyMIP?: string;
  monthlyTax: string;
  combinedMonthlyPayment: string;
  valueAndEquityRange: {
    valueRange5Years: { min: number; max: number };
    possibleEquity5Years: { min: number; max: number };
    valueRange10Years: { min: number; max: number };
    possibleEquity10Years: { min: number; max: number };
    valueRange15Years: { min: number; max: number };
    possibleEquity15Years: { min: number; max: number };
  };
  appreciationRateRange: {
    min: number;
    max: number;
  };
}

const interestRate = 0.075; // Assuming a fixed interest rate of 7.5%
const fhaDownPaymentRate = 0.035; // FHA down payment rate of 3.5%
const nonFhaDownPaymentRate = 0.2; // Non-FHA down payment rate of 20%
const fhaUpfrontMIPRate = 0.0175; // FHA upfront MIP rate of 1.75%
const fhaMonthlyMIPRate = 0.0055; // FHA monthly MIP rate of 0.55%
const minAppreciationRate = 0.03; // Minimum appreciation rate of 3%
const maxAppreciationRate = 0.05; // Maximum appreciation rate of 5%

const calculateAmortization = (amount: number, term: number): AmortizationResult => {
  return amortize({
    amount,
    rate: interestRate,
    totalTerm: 30 * 12,
    amortizeTerm: term
  });
};

const calculateCompoundedValue = (initialValue: number, years: number, minRate: number, maxRate: number): { min: number; max: number } => {
  let minValue = initialValue;
  let maxValue = initialValue;

  for (let i = 0; i < years; i++) {
    minValue *= 1 + minRate;
    maxValue *= 1 + maxRate;
  }

  return { min: minValue, max: maxValue };
};

const calculatePossibleEquity = (valueRange: { min: number; max: number }, amortization: AmortizationResult): { min: number; max: number } => {
  return {
    min: valueRange.min - parseFloat(amortization.balanceRound),
    max: valueRange.max - parseFloat(amortization.balanceRound)
  };
};

const calculateValueAndEquityRange = (listingPrice: number, mortgageAmount: number, isFHA: boolean): PossibleEquityResult => {
  const amortization5Years = calculateAmortization(mortgageAmount, 5 * 12);
  const amortization10Years = calculateAmortization(mortgageAmount, 10 * 12);
  const amortization15Years = calculateAmortization(mortgageAmount, 15 * 12);

  const valueRange5Years = calculateCompoundedValue(listingPrice, 5, minAppreciationRate, maxAppreciationRate);
  const valueRange10Years = calculateCompoundedValue(listingPrice, 10, minAppreciationRate, maxAppreciationRate);
  const valueRange15Years = calculateCompoundedValue(listingPrice, 15, minAppreciationRate, maxAppreciationRate);

  const possibleEquity5Years = calculatePossibleEquity(valueRange5Years, amortization5Years);
  const possibleEquity10Years = calculatePossibleEquity(valueRange10Years, amortization10Years);
  const possibleEquity15Years = calculatePossibleEquity(valueRange15Years, amortization15Years);

  const baseMonthlyPayment = amortization5Years.paymentRound;
  const monthlyTax = ''; // Assuming monthly tax is not provided

  const upfrontMIP = isFHA ? (mortgageAmount * fhaUpfrontMIPRate).toFixed(2) : undefined;
  const monthlyMIP = isFHA ? (mortgageAmount * fhaMonthlyMIPRate).toFixed(2) : undefined;

  const combinedMonthlyPayment = isFHA
    ? (parseFloat(baseMonthlyPayment) + parseFloat((mortgageAmount * fhaMonthlyMIPRate).toFixed(2))).toFixed(2)
    : baseMonthlyPayment;

  return {
    baseMonthlyPayment,
    upfrontMIP,
    monthlyMIP,
    monthlyTax,
    combinedMonthlyPayment,
    valueAndEquityRange: {
      valueRange5Years,
      possibleEquity5Years,
      valueRange10Years,
      possibleEquity10Years,
      valueRange15Years,
      possibleEquity15Years
    },
    appreciationRateRange: {
      min: minAppreciationRate,
      max: maxAppreciationRate
    }
  };
};

export function getMortgageAndEquity(listingPrice: number): { fhaLoan: PossibleEquityResult; nonFhaLoan: PossibleEquityResult } {
  const fhaDownPayment = listingPrice * fhaDownPaymentRate;
  const fhaMortgageAmount = listingPrice - fhaDownPayment;

  const nonFhaDownPayment = listingPrice * nonFhaDownPaymentRate;
  const nonFhaMortgageAmount = listingPrice - nonFhaDownPayment;

  const fhaLoan = calculateValueAndEquityRange(listingPrice, fhaMortgageAmount, true);
  const nonFhaLoan = calculateValueAndEquityRange(listingPrice, nonFhaMortgageAmount, false);

  return {
    fhaLoan,
    nonFhaLoan
  };
}