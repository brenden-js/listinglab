declare module 'amortize' {
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

  interface AmortizeOptions {
    amount: number;
    rate: number;
    totalTerm: number;
    amortizeTerm?: number;
    repaymentType?: 'equal-principal-payment';
    partialMonthOffset?: number;
  }

  function amortize(options: AmortizeOptions): AmortizationResult;

  export = amortize;
}
