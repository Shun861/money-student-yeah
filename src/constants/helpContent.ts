export const helpContent = {
  birthDate: {
    title: "なぜ必要？",
    description: "年齢によって扶養控除の適用可否が変わります。16歳未満は扶養控除の対象外、16歳以上23歳未満は特定扶養控除の対象となります。"
  },
  studentType: {
    title: "なぜ重要？",
    description: "在学区分によって勤労学生控除の適用や、扶養控除の判定基準が変わります。特に定時制・通信制は勤労学生控除の対象外となる場合があります。"
  },
  residenceCity: {
    title: "なぜ必要？",
    description: "住民税の非課税基準は自治体によって異なります。正確な判定のために居住地の情報が必要です。"
  },
  insuranceStatus: {
    title: "なぜ重要？",
    description: "保険加入状況によって社会保険の加入要件が変わります。親の扶養に入っている場合は、収入制限が厳しくなります。"
  },
  parentInsuranceType: {
    title: "なぜ必要？",
    description: "親の保険種別によって被扶養者の認定基準が変わります。健康保険組合は比較的緩やか、国民健康保険は厳しい基準が適用されることが多いです。"
  },
  livingStatus: {
    title: "なぜ重要？",
    description: "同居・別居によって扶養控除の判定基準が変わります。別居の場合は仕送り額も考慮されます。"
  },
  monthlyAllowance: {
    title: "なぜ必要？",
    description: "別居の場合、仕送り額は扶養控除の判定に影響します。仕送り額が多いほど扶養控除の対象外になりやすくなります。"
  }
} as const;
