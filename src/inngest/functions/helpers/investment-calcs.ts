import Decimal from 'decimal.js';

interface MonthlyPaymentParams {
    loanType: 'fha' | 'conventional';
    loanAmount: number;
    interestRate: number;
    loanTermYears: number;
}

interface MonthlyPaymentBreakdown {
    total: string;
    closingCosts: string;
    mip: string;
    tax: string;
    principalAndInterest: string;
}

// Function to calculate monthly mortgage payment
const calculateMonthlyPayment = (params: MonthlyPaymentParams): string => {
    const {loanType, loanAmount, interestRate, loanTermYears} = params;

    let decimalLoanAmount = new Decimal(loanAmount);
    const decimalInterestRate = new Decimal(interestRate).dividedBy(100);
    const loanTermMonths = new Decimal(loanTermYears).times(12);

    const downPaymentRate = loanType === 'fha' ? new Decimal(0.035) : new Decimal(0.20);
    const downPayment = decimalLoanAmount.times(downPaymentRate);

    const principal = decimalLoanAmount.minus(downPayment);
    const monthlyInterestRate = decimalInterestRate.dividedBy(12);

    const monthlyPayment = principal.times(
        monthlyInterestRate
            .times(new Decimal(1).plus(monthlyInterestRate).pow(loanTermMonths))
            .dividedBy(
                new Decimal(1).plus(monthlyInterestRate).pow(loanTermMonths).minus(1)
            )
    );

    return monthlyPayment.toDecimalPlaces(2).toString();
};

// Function to calculate total monthly payment breakdown
export const calculateTotalMonthlyPayment = (
    loanType: 'fha' | 'conventional',
    listingPrice: number,
    interestRate: number
): MonthlyPaymentBreakdown => {
    const loanTermYears = 30;
    let decimalLoanAmount = new Decimal(listingPrice)
        .times(1 - (loanType === 'fha' ? 0.035 : 0.2));

    let monthlyMIP = new Decimal(0);
    if (loanType === 'fha') {
        const upfrontMIPRate = new Decimal(0.0175);
        const annualMIPRate = new Decimal(0.0055);

        const upfrontMIP = decimalLoanAmount.times(upfrontMIPRate);
        const annualMIP = decimalLoanAmount.times(annualMIPRate);
        monthlyMIP = annualMIP.dividedBy(12);

        decimalLoanAmount = decimalLoanAmount.plus(upfrontMIP);
    }

    const monthlyMortgagePayment = new Decimal(
        calculateMonthlyPayment({
            loanType,
            loanAmount: decimalLoanAmount.toNumber(),
            interestRate,
            loanTermYears,
        })
    );

    const annualPropertyTax = listingPrice * 0.01;
    const monthlyPropertyTax = new Decimal(annualPropertyTax).dividedBy(12);

    const closingCosts = new Decimal(decimalLoanAmount).times(0.02);
    const monthlyClosingCosts = closingCosts.dividedBy(loanTermYears * 12);

    const totalMonthlyPayment = monthlyMortgagePayment
        .plus(monthlyPropertyTax)
        .plus(monthlyClosingCosts)
        .plus(monthlyMIP);

    return {
        total: totalMonthlyPayment.toDecimalPlaces(2).toString(),
        closingCosts: monthlyClosingCosts.toDecimalPlaces(2).toString(),
        mip: monthlyMIP.toDecimalPlaces(2).toString(),
        tax: monthlyPropertyTax.toDecimalPlaces(2).toString(),
        principalAndInterest: monthlyMortgagePayment.toDecimalPlaces(2).toString(),
    };
};


