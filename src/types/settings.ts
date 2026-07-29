export interface AppSettings {
  vatRate: number; // percentage, e.g. 18
  organizationFeeRate: number; // percentage, default for new incomes
  incomeTaxRate: number; // percentage
  businessReserveRate: number; // percentage
  goalsRate: number; // percentage of net to distribute
  homeRate: number; // percentage of net to distribute kept for personal/home use
  includePendingInForecast: boolean;
  currency: "ILS";
  numberFormatLocale: "he-IL";
}

export const DEFAULT_SETTINGS: AppSettings = {
  vatRate: 18,
  organizationFeeRate: 12,
  incomeTaxRate: 15,
  businessReserveRate: 0,
  goalsRate: 20,
  homeRate: 65,
  includePendingInForecast: true,
  currency: "ILS",
  numberFormatLocale: "he-IL",
};
