export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
  retirementGoal: number;
  contributionIncrease: number;
  inflation: number;
}

export type RetirementFormValues = { [K in keyof RetirementInput]: string };
export type RetirementValidation = Partial<Record<keyof RetirementInput | 'calculation', string>>;
export interface RetirementYear {
  age: number;
  balance: number;
  contributions: number;
  growth: number;
}
export interface RetirementProjection {
  yearsToRetirement: number;
  projectedBalance: number;
  futureContributions: number;
  totalContributions: number;
  investmentGrowth: number;
  currentSavingsAtRetirement: number;
  purchasingPower: number;
  goalProgress: number;
  progressBarValue: number;
  shortfall: number;
  surplus: number;
  status: 'On track' | 'Close to your goal' | 'Needs adjustment';
  yearly: RetirementYear[];
  milestones: RetirementYear[];
  contributionShare: number;
  growthShare: number;
  recommendedContribution: number;
}
