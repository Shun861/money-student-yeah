import type { Option } from "@/types";

export const studentTypeOptions: Option[] = [
  { value: "daytime", label: "昼間制", description: "通常の大学・専門学校" },
  { value: "evening", label: "定時制", description: "夜間の大学・専門学校" },
  { value: "correspondence", label: "通信制", description: "通信教育" },
  { value: "leave", label: "休学中", description: "現在休学中" },
  { value: "graduate", label: "卒業予定", description: "今年度中に卒業予定" }
];

export const insuranceOptions: Option[] = [
  { value: "parent_dependent", label: "親の扶養", description: "親の健康保険の被扶養者" },
  { value: "national_health", label: "国民健康保険", description: "自分で国民健康保険に加入" },
  { value: "employee_health", label: "社会保険", description: "勤務先の社会保険に加入" },
  { value: "none", label: "未加入", description: "現在保険に加入していない" }
];

export const parentInsuranceOptions: Option[] = [
  { value: "health_union", label: "健康保険組合", description: "会社の健康保険組合" },
  { value: "national_health", label: "国民健康保険", description: "親が国民健康保険" },
  { value: "other", label: "その他", description: "共済組合など" }
];

export const livingStatusOptions: Option[] = [
  { value: "living_together", label: "同居", description: "親と一緒に住んでいる" },
  { value: "living_separately", label: "別居", description: "親と別々に住んでいる" }
];

export const employerSizeOptions: Option[] = [
  { value: "small", label: "小規模", description: "従業員50人未満" },
  { value: "medium", label: "中規模", description: "従業員50〜500人" },
  { value: "large", label: "大規模", description: "従業員500人以上" }
];

export const bracketOptions = [
  { value: 103, label: "103万円", description: "扶養控除の壁" },
  { value: 130, label: "130万円", description: "社会保険の壁" },
  { value: 150, label: "150万円", description: "住民税の壁" }
] as const;
