import Decimal from 'decimal.js';

interface AmortizationResult {
  interest: Decimal;
  principal: Decimal;
  balance: Decimal;
  payment: Decimal;
}

interface PossibleEquityResult {
  baseMonthlyPayment: string;
  upfrontMIP?: string;
  monthlyMIP?: string;
  monthlyTax: string;
  combinedMonthlyPayment: string;
  valueAndEquityRange: {
    ownershipYear: number;
    valueRange: { estimatedMin: string; estimatedMax: string };
    equityRange: { estimatedMinEquity: string; estimatedMaxEquity: string };
  }[]; // Updated to array of objects
  appreciationRateRange: {
    min: number;
    max: number;
  };
}

interface InvestmentResult {
  netOperatingIncome: string;
  capRate: string;
  cashFlow: string;
  grossRentMultiplier: string;
  debtServiceCoverageRatio: string;
  internalRateOfReturn: string;
  returnOnInvestment: string;
  pricePerSquareFoot: string;
  breakEvenOccupancy: string;
}

const interestRate = new Decimal(0.075); // Assuming a fixed interest rate of 7.5%
const fhaDownPaymentRate = new Decimal(0.035); // FHA down payment rate of 3.5%
const nonFhaDownPaymentRate = new Decimal(0.2); // Non-FHA down payment rate of 20%
const fhaUpfrontMIPRate = new Decimal(0.0175); // FHA upfront MIP rate of 1.75%
const fhaMonthlyMIPRate = new Decimal(0.0055); // FHA monthly MIP rate of 0.55%
const minAppreciationRate = new Decimal(0.03); // Minimum appreciation rate of 3%
const maxAppreciationRate = new Decimal(0.05); // Maximum appreciation rate of 5%

const calculateAmortization = (amount: Decimal, term: number): AmortizationResult => {
  const monthlyRate = interestRate.dividedBy(12);
  const numberOfPayments = new Decimal(term);
  const payment = amount.times(
    monthlyRate.times(
      new Decimal(1).plus(monthlyRate).pow(numberOfPayments)
    ).dividedBy(
      new Decimal(1).plus(monthlyRate).pow(numberOfPayments).minus(1)
    )
  );

  let balance = amount;
  let totalInterest = new Decimal(0);
  let totalPrincipal = new Decimal(0);

  for (let i = 0; i < term; i++) {
    const monthlyInterest = balance.times(monthlyRate);
    const monthlyPrincipal = payment.minus(monthlyInterest);
    balance = balance.minus(monthlyPrincipal);

    totalInterest = totalInterest.plus(monthlyInterest);
    totalPrincipal = totalPrincipal.plus(monthlyPrincipal);
  }

  return {
    interest: totalInterest.toDecimalPlaces(2),
    principal: totalPrincipal.toDecimalPlaces(2),
    balance: balance.toDecimalPlaces(2),
    payment: payment.toDecimalPlaces(2),
  };
};

const calculateCompoundedValue = (initialValue: Decimal, years: number, rate: Decimal): Decimal => {
  return initialValue.times(new Decimal(1).plus(rate).pow(years)).toDecimalPlaces(2);
};

const calculatePossibleEquity = (value: Decimal, amortization: AmortizationResult): Decimal => {
  return value.minus(amortization.balance).toDecimalPlaces(2);
};

const calculateValueAndEquityRange = (listingPrice: number, mortgageAmount: number, isFHA: boolean): PossibleEquityResult => {
  const decimalListingPrice = new Decimal(listingPrice);
  const decimalMortgageAmount = new Decimal(mortgageAmount);

  const valueAndEquityRange: { ownershipYear: number; valueRange: { estimatedMin: string; estimatedMax: string }; equityRange: { estimatedMinEquity: string; estimatedMaxEquity: string } }[] = []; // Changed to array

  for (let years = 1; years <= 30; years++) {
    const months = years * 12;
    const amortization = calculateAmortization(decimalMortgageAmount, months);

    const valueRange = {
      estimatedMin: calculateCompoundedValue(decimalListingPrice, years, minAppreciationRate).toString(),
      estimatedMax: calculateCompoundedValue(decimalListingPrice, years, maxAppreciationRate).toString(),
    };

    const equityRange = {
      estimatedMinEquity: calculatePossibleEquity(new Decimal(valueRange.estimatedMin), amortization).toString(),
      estimatedMaxEquity: calculatePossibleEquity(new Decimal(valueRange.estimatedMax), amortization).toString(),
    };

    valueAndEquityRange.push({ ownershipYear: years, valueRange, equityRange }); // Pushing data to array
  }

  const baseMonthlyPayment = calculateAmortization(decimalMortgageAmount, 60).payment.toString(); // Based on 5-year amortization
  const monthlyTax = ''; // Assuming monthly tax is not provided

  const upfrontMIP = isFHA ? decimalMortgageAmount.times(fhaUpfrontMIPRate).toDecimalPlaces(2).toString() : undefined;
  const monthlyMIP = isFHA ? decimalMortgageAmount.times(fhaMonthlyMIPRate).toDecimalPlaces(2).toString() : undefined;

  const combinedMonthlyPayment = isFHA
    ? calculateAmortization(decimalMortgageAmount, 60).payment.plus(new Decimal(monthlyMIP || '0')).toDecimalPlaces(2).toString()
    : baseMonthlyPayment;

  return {
    baseMonthlyPayment,
    upfrontMIP,
    monthlyMIP,
    monthlyTax,
    combinedMonthlyPayment,
    valueAndEquityRange, // Now an array
    appreciationRateRange: {
      min: minAppreciationRate.toNumber(),
      max: maxAppreciationRate.toNumber()
    }
  };
};

export function getMortgageAndEquity(listingPrice: number): { fhaLoan: PossibleEquityResult; nonFhaLoan: PossibleEquityResult } {
  const fhaDownPayment = new Decimal(listingPrice).times(fhaDownPaymentRate);
  const fhaMortgageAmount = new Decimal(listingPrice).minus(fhaDownPayment);

  const nonFhaDownPayment = new Decimal(listingPrice).times(nonFhaDownPaymentRate);
  const nonFhaMortgageAmount = new Decimal(listingPrice).minus(nonFhaDownPayment);

  const fhaLoan = calculateValueAndEquityRange(listingPrice, fhaMortgageAmount.toNumber(), true);
  const nonFhaLoan = calculateValueAndEquityRange(listingPrice, nonFhaMortgageAmount.toNumber(), false);

  return {
    fhaLoan,
    nonFhaLoan
  };
}

export function getInvestmentCalculations(
  listingPrice: number,
  estimatedMonthlyRent: number,
  annualPropertyTaxes: number,
  annualInsurance: number,
  annualMaintenance: number,
  vacancyRate: number,
  annualMortgagePayment: number,
  holdingPeriodYears: number,
  futureSellingPrice: number,
  squareFootage: number,
): InvestmentResult {
  const grossAnnualIncome = new Decimal(estimatedMonthlyRent * 12);
  const annualVacancy = grossAnnualIncome.times(vacancyRate / 100);
  const effectiveGrossIncome = grossAnnualIncome.minus(annualVacancy);
  const annualOperatingExpenses = new Decimal(annualPropertyTaxes + annualInsurance + annualMaintenance);
  const netOperatingIncome = effectiveGrossIncome.minus(annualOperatingExpenses).toDecimalPlaces(2);

  const capRate = netOperatingIncome.dividedBy(listingPrice).times(100).toDecimalPlaces(2);
  const cashFlow = netOperatingIncome.minus(annualMortgagePayment).toDecimalPlaces(2);
  const grossRentMultiplier = new Decimal(listingPrice).dividedBy(grossAnnualIncome).toDecimalPlaces(2);
  const debtServiceCoverageRatio = netOperatingIncome.dividedBy(annualMortgagePayment).toDecimalPlaces(2);

  // Calculate Internal Rate of Return (IRR)
  const initialInvestment = new Decimal(listingPrice);
  const cashFlows = [];
  for (let i = 0; i < holdingPeriodYears; i++) {
    cashFlows.push(
      new Decimal(estimatedMonthlyRent * 12)
        .minus(annualPropertyTaxes)
        .minus(annualInsurance)
        .minus(annualMaintenance)
        .minus(annualMortgagePayment)
    );
  }
  cashFlows.push(new Decimal(futureSellingPrice));
  const irr = calculateIRR(initialInvestment, cashFlows).times(100).toDecimalPlaces(2);

  // Calculate Return on Investment (ROI)
  const totalProfit = new Decimal(futureSellingPrice).minus(listingPrice);
  const roi = totalProfit.dividedBy(listingPrice).times(100).toDecimalPlaces(2);

  // Calculate Price Per Square Foot
  const pricePerSquareFoot = new Decimal(listingPrice).dividedBy(squareFootage).toDecimalPlaces(2);

  // Calculate Break-Even Occupancy
  const breakEvenOccupancy =
    annualOperatingExpenses.plus(annualMortgagePayment).dividedBy(grossAnnualIncome).times(100).toDecimalPlaces(2);

  return {
    netOperatingIncome: netOperatingIncome.toString(),
    capRate: capRate.toString(),
    cashFlow: cashFlow.toString(),
    grossRentMultiplier: grossRentMultiplier.toString(),
    debtServiceCoverageRatio: debtServiceCoverageRatio.toString(),
    internalRateOfReturn: irr.toString(),
    returnOnInvestment: roi.toString(),
    pricePerSquareFoot: pricePerSquareFoot.toString(),
    breakEvenOccupancy: breakEvenOccupancy.toString(),
  };
}

// Helper function to calculate IRR (robust version)
function calculateIRR(initialInvestment: Decimal, cashFlows: Decimal[]): Decimal {
  let guess = calculateInitialIRRGuess(cashFlows);
  const tolerance = new Decimal(1e-6);
  const maxIterations = 1000;

  for (let i = 0; i < maxIterations; i++) {
    let npv = initialInvestment.negated();
    let npvDerivative = new Decimal(0);
    for (let j = 0; j < cashFlows.length; j++) {
      const factor = new Decimal(1).plus(guess).pow(j + 1);
      npv = npv.plus(cashFlows[j].dividedBy(factor));
      npvDerivative = npvDerivative.minus(cashFlows[j].times(new Decimal(j + 1)).dividedBy(factor.pow(2)));
    }

    if (npv.abs().lessThan(tolerance)) {
      return guess;
    }

    const newGuess = guess.minus(npv.dividedBy(npvDerivative));
    if (newGuess.equals(guess)) {
      return new Decimal(NaN);
    }

    guess = newGuess;
  }

  return new Decimal(NaN);
}

// Helper function to calculate an initial guess for IRR
function calculateInitialIRRGuess(cashFlows: Decimal[]): Decimal {
  const totalCashFlow = cashFlows.reduce((sum, cf) => sum.plus(cf), new Decimal(0));
  const averageCashFlow = totalCashFlow.dividedBy(cashFlows.length);
  return averageCashFlow.dividedBy(cashFlows[0].abs());
}