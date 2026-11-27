/**
 * Public portfolio dataset. Larkmoor Athletic is fictional and every value is synthetic.
 */

import reference from "../../data/processed/public-reference.json";
import reconciliation from "../../data/processed/reconciliation.json";

export type FinancialPeriod = {
  id: "FY24" | "FY25";
  label: string;
  startDate: string;
  endDate: string;
  transactions: number;
  inflow: number;
  outflow: number;
  netCash: number;
  sourceFile: string;
  sha256: string;
};

export type CashCategory = { name: string; amount: number };
export type StaffRole = { role: string; coverage: "Covered" | "Open"; publicTreatment: string };
export type MatchdayNeed = { scope: "Home" | "Away"; item: string; quantity: number | null };
export type FieldCostCategory = CashCategory & { evidence: string };
export type ManagementCost = {
  item: string;
  minimum: number;
  maximum: number;
  basis: string;
  treatment: string;
};
export type ManagementSeasonCommitment = {
  item: string;
  amount: number;
  basis: string;
  confidence: "Synthetic fixed assumption" | "Approximate — confirm";
};

export const financialPeriods: FinancialPeriod[] = reference.financialPeriods.map((row) => ({
  ...row,
  id: row.id as "FY24" | "FY25",
  netCash: row.inflow - row.outflow,
  sourceFile: "data/raw/financial_periods.json",
  sha256: reconciliation.sourceSha256["financial_periods.json"],
}));
export const fy25IncomeCategories: CashCategory[] = reference.incomeCategories;
export const fy25ExpenseCategories: CashCategory[] = reference.expenseCategories;
export const fy25MonthlyCashFlow = reference.monthly;

export const fy25FieldCosts: FieldCostCategory[] = [
  { name: "Match fields", amount: 950, evidence: "Synthetic monthly aggregates" },
  { name: "Practice fields", amount: 3100, evidence: "Synthetic category total" },
];

const menBaseline = reference.operating.find((r) => r.program === "Men")!;
const womenBaseline = reference.operating.find((r) => r.program === "Women")!;
export const managementOperatingBaseline = {
  evidenceLabel: "Synthetic operating assumptions",
  appliesTo: "Men and Women",
  averageAttendance: menBaseline.averageAttendance,
  ticketPrice: menBaseline.ticketPrice,
  concessionSaleMinimum: 7,
  concessionSaleMaximum: 10,
  seasonStart: "May 10",
  seasonEnd: "July 20",
  baseMatchesPerProgram: menBaseline.baseMatches,
  matchesIncludingPlayoffs: {
    Men: menBaseline.playoffMatches,
    Women: womenBaseline.playoffMatches,
  },
  homeAwaySplit: "Not established in the public dataset",
} as const;

export const managementMatchdayCosts: ManagementCost[] = [
  {
    item: "Streaming",
    minimum: 0,
    maximum: 240,
    basis: "Per home match, when used",
    treatment: "Conditional paid role",
  },
  { item: "Announcer", minimum: 75, maximum: 75, basis: "Per home match", treatment: "Paid role" },
  {
    item: "Photography",
    minimum: 90,
    maximum: 90,
    basis: "Per home match",
    treatment: "Paid role",
  },
  {
    item: "Concession inventory",
    minimum: 260,
    maximum: 420,
    basis: "Per home match",
    treatment: "Estimated inventory cost",
  },
  {
    item: "Event support labor",
    minimum: 0,
    maximum: 0,
    basis: "Per home match",
    treatment: "Volunteer-supported",
  },
  {
    item: "Athletic trainer",
    minimum: 0,
    maximum: 0,
    basis: "Per home match",
    treatment: "Partner-supported",
  },
];

export const managementConcessionPrices = [
  { item: "Drinks", minimum: 4, maximum: 7 },
  { item: "Snacks", minimum: 3, maximum: 6 },
];

export const managementSeasonCommitments: ManagementSeasonCommitment[] = [
  {
    item: "Officials",
    amount: 4900,
    basis: "Synthetic club-wide commitment",
    confidence: "Synthetic fixed assumption",
  },
  {
    item: "Game fields",
    amount: 9500,
    basis: "Synthetic combined-program commitment",
    confidence: "Synthetic fixed assumption",
  },
  {
    item: "Practice fields",
    amount: 8100,
    basis: "Illustrative planning estimate",
    confidence: "Approximate — confirm",
  },
];

export const reportedSponsorReceipts = [
  {
    name: "Community partner A",
    amount: 6200,
    transactions: 1,
    latestReceipt: "2025-02-01",
    evidence: "Synthetic receipt",
  },
  {
    name: "Community partner B",
    amount: 4800,
    transactions: 2,
    latestReceipt: "2025-03-15",
    evidence: "Synthetic receipts",
  },
  {
    name: "Other sponsorship receipts",
    amount: 27000,
    transactions: 34,
    latestReceipt: "2025-09-30",
    evidence: "Synthetic aggregated receipts",
  },
];

// Only role coverage is public; the source roster schema is not reproduced here.
export const staffRoles: StaffRole[] = [
  "Women's head coach",
  "Men's head coach",
  "Assistant coach",
  "Matchday operations lead",
  "Business analyst",
  "Streaming lead",
  "Public-address announcer",
  "Security lead",
  "Medical lead",
  "Physical-therapy partner",
  "Photographer",
  "Social-media lead",
].map((role) => ({
  role,
  coverage: "Covered",
  publicTreatment: "Role-only record; identity and contact fields are not published",
}));

export const openStaffRoles = [
  "Matchday operations support",
  "Logistics support",
  "Social media support",
  "Business operations intern",
  "Content intern",
];

export const matchdayNeeds: MatchdayNeed[] = [
  { scope: "Home", item: "Water cases", quantity: 4 },
  { scope: "Home", item: "Ice coolers", quantity: 3 },
  { scope: "Home", item: "Banners", quantity: null },
  { scope: "Home", item: "Payment kit", quantity: null },
  { scope: "Home", item: "Officials table", quantity: 1 },
  { scope: "Away", item: "Water cases", quantity: 2 },
  { scope: "Away", item: "Snack packs", quantity: 4 },
  { scope: "Away", item: "Ice", quantity: 2 },
];

export const sourceDocuments = [
  {
    name: "Synthetic financial model",
    file: "data/processed/fact_finance.csv",
    coverage:
      "FY25 monthly facts; FY24/FY25 annual metadata in data/raw/financial_periods.json. No bank rows or payees",
    sha256: "Produced in data/processed/reconciliation.json",
  },
  {
    name: "Synthetic operating assumptions",
    file: "data/raw/operating_assumptions.csv",
    coverage: "Invented matchday drivers",
    sha256: "Produced in data/processed/reconciliation.json",
  },
  {
    name: "Synthetic staffing coverage",
    file: "data/raw/staffing_roles.csv",
    coverage: "Role coverage only; names and contact channels withheld",
    sha256: "Produced in data/processed/reconciliation.json",
  },
];
