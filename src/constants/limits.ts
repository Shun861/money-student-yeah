export const DEPENDENCY_LIMITS = {
  TAX_DEDUCTION: 1030000, // 103万円 - 扶養控除の壁
  SOCIAL_INSURANCE: 1300000, // 130万円 - 社会保険の壁
  RESIDENT_TAX: 1500000, // 150万円 - 住民税の壁
} as const;

export const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
] as const;

export const WEEKS_PER_MONTH = 4.33; // 月平均週数
