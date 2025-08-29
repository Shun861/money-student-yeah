"use client";
import { useAppStore, type StudentType, type InsuranceType, type ParentInsuranceType, type LivingStatus } from "@/lib/store";
import { calculateWalls } from "@/lib/rules";
import { useState } from "react";
import { 
  CurrencyYenIcon, 
  ChartBarIcon, 
  Cog6ToothIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

type BracketType = 103 | 130 | 150;

interface BracketInfo {
  value: BracketType;
  title: string;
  subtitle: string;
  description: string;
  pros: string[];
  cons: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const bracketInfo: Record<BracketType, BracketInfo> = {
  103: {
    value: 103,
    title: "103万円の壁",
    subtitle: "所得税・住民税の目安",
    description: "最も一般的で安全な選択肢。短期バイトやシフト調整で最も意識される基準です。",
    pros: [
      "所得税・住民税の負担が軽い",
      "親の扶養控除が受けられる",
      "最も安全で確実な選択"
    ],
    cons: [
      "収入に制限がある",
      "大きな買い物や旅行の資金が限られる"
    ],
    icon: ShieldCheckIcon,
    color: "bg-green-50 border-green-200 text-green-800"
  },
  130: {
    value: 130,
    title: "130万円の壁",
    subtitle: "社会保険の目安",
    description: "より多くの収入を得られるが、社会保険の加入が必要になる可能性があります。",
    pros: [
      "より多くの収入を得られる",
      "社会保険の保障が受けられる",
      "将来の年金積立になる"
    ],
    cons: [
      "社会保険料の負担が増える",
      "親の被扶養者から外れる可能性",
      "手取り額が予想より少なくなる場合がある"
    ],
    icon: CalculatorIcon,
    color: "bg-blue-50 border-blue-200 text-blue-800"
  },
  150: {
    value: 150,
    title: "150万円の壁",
    subtitle: "配偶者特別控除などの目安",
    description: "最も高い収入を得られるが、税制上の優遇措置が段階的に縮小されます。",
    pros: [
      "最も高い収入を得られる",
      "経済的な自立度が高い",
      "将来のキャリアに有利"
    ],
    cons: [
      "税制上の優遇措置が減少",
      "親の扶養控除に影響",
      "複雑な税制の理解が必要"
    ],
    icon: AcademicCapIcon,
    color: "bg-purple-50 border-purple-200 text-purple-800"
  }
};

export default function ProfilePage() {
  const profile = useAppStore((s) => s.profile);
  const incomes = useAppStore((s) => s.incomes);
  const setProfile = useAppStore((s) => s.setProfile);
  const addEmployer = useAppStore((s) => s.addEmployer);
  const updateEmployer = useAppStore((s) => s.updateEmployer);
  const removeEmployer = useAppStore((s) => s.removeEmployer);
  const r = calculateWalls(profile, incomes);
  
  const [selectedBracket, setSelectedBracket] = useState<BracketType>(profile.bracket ?? 103);
  const [showDetails, setShowDetails] = useState<BracketType | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'settings'>('report');

  const handleBracketSelect = (bracket: BracketType) => {
    setSelectedBracket(bracket);
    setProfile({ bracket });
  };

  // 月別収入データの計算
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthIncomes = incomes.filter(income => {
      const date = new Date(income.date);
      return date.getMonth() + 1 === month && date.getFullYear() === new Date().getFullYear();
    });
    return {
      month,
      total: monthIncomes.reduce((sum, income) => sum + income.amount, 0)
    };
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentMonthIncome = monthlyData[currentMonth - 1]?.total || 0;

  return (
    <div className="grid gap-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">マイページ</h1>
          <div className="text-sm text-gray-600 mt-1">収入管理と設定</div>
        </div>
        <Link 
          href="/income" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          収入を記録
        </Link>
      </div>

      {/* タブナビゲーション */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'report' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4" />
            レポート
          </div>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'settings' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="w-4 h-4" />
            設定
          </div>
        </button>
      </div>

      {activeTab === 'report' && (
        <div className="grid gap-6">
          {/* サマリーカード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CurrencyYenIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-gray-600">年間累計</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{r.totalIncomeYTD.toLocaleString()} 円</div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm text-gray-600">今月の収入</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{currentMonthIncome.toLocaleString()} 円</div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600">残り稼げる額</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{r.remainingToLimit.toLocaleString()} 円</div>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-sm text-gray-600">使用率</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{r.percentUsed}%</div>
            </div>
          </div>

          {/* 進捗バー */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">扶養枠の使用状況</div>
              <div className="text-lg font-bold text-blue-600">{r.percentUsed}%</div>
            </div>
            <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-6 ${
                  r.percentUsed < 70 ? 'bg-green-500' : 
                  r.percentUsed < 90 ? 'bg-yellow-500' : 'bg-red-500'
                } rounded-full transition-all duration-500 ease-out`} 
                style={{ width: `${r.percentUsed}%` }} 
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>0%</span>
              <span>{profile.bracket ?? 103}万円</span>
              <span>100%</span>
            </div>
          </div>

          {/* 月別収入グラフ */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">月別収入推移</h3>
            <div className="grid grid-cols-12 gap-1 h-32 items-end">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ 
                      height: `${Math.max(10, (data.total / Math.max(...monthlyData.map(d => d.total))) * 100)}%` 
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">{data.month}月</div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              各月の収入を視覚化しています
            </div>
          </div>

          {/* 個人情報サマリー */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">個人情報サマリー</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">基本情報</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">生年月日:</span>
                    <span className="font-medium">{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString('ja-JP') : '未設定'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">在学区分:</span>
                    <span className="font-medium">
                      {profile.studentType === 'daytime' ? '昼間制' :
                       profile.studentType === 'evening' ? '定時制' :
                       profile.studentType === 'correspondence' ? '通信制' :
                       profile.studentType === 'leave' ? '休学中' :
                       profile.studentType === 'graduate' ? '卒業予定' : '未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">居住自治体:</span>
                    <span className="font-medium">{profile.residenceCity || '未設定'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">保険・扶養情報</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">保険加入状況:</span>
                    <span className="font-medium">
                      {profile.insuranceStatus === 'parent_dependent' ? '親の扶養' :
                       profile.insuranceStatus === 'national_health' ? '国民健康保険' :
                       profile.insuranceStatus === 'employee_health' ? '社会保険' :
                       profile.insuranceStatus === 'none' ? '未加入' : '未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">同居状況:</span>
                    <span className="font-medium">
                      {profile.livingStatus === 'living_together' ? '同居' :
                       profile.livingStatus === 'living_separately' ? '別居' : '未設定'}
                    </span>
                  </div>
                  {profile.monthlyAllowance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">月額仕送り:</span>
                      <span className="font-medium">{profile.monthlyAllowance.toLocaleString()}円</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 勤務先サマリー */}
          {profile.employers.length > 0 && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">勤務先サマリー</h3>
              <div className="grid gap-4">
                {profile.employers.map((employer, index) => (
                  <div key={employer.id} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">勤務先 {index + 1}: {employer.name || '未設定'}</h4>
                    <div className="grid gap-2 md:grid-cols-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">週労働時間:</span>
                        <span className="font-medium">{employer.weeklyHours}時間</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">月収見込み:</span>
                        <span className="font-medium">{employer.monthlyIncome.toLocaleString()}円</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">通勤手当:</span>
                        <span className="font-medium">{employer.commutingAllowance.toLocaleString()}円</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 働ける時間の推定 */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">あと働ける時間（概算）</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{r.estimatedHoursLeftBy103}</div>
                <div className="text-sm text-gray-600">103万基準（時間）</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{r.estimatedHoursLeftBy130}</div>
                <div className="text-sm text-gray-600">130万基準（時間）</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid gap-6">
          {/* 扶養枠設定 */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <InformationCircleIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">扶養の「壁」について学ぼう</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              学生のアルバイト収入には、税制上重要な3つの「壁」があります。それぞれの特徴を理解して、あなたに最適な選択をしましょう。
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              {Object.values(bracketInfo).map((info) => (
                <div
                  key={info.value}
                  className={`rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedBracket === info.value ? 'ring-2 ring-blue-500' : ''
                  } ${info.color}`}
                  onClick={() => setShowDetails(showDetails === info.value ? null : info.value)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <info.icon className="w-6 h-6" />
                    <div>
                      <div className="font-semibold">{info.title}</div>
                      <div className="text-xs opacity-75">{info.subtitle}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{info.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{info.value}万円</span>
                    <button
                      className="text-xs bg-white/50 px-2 py-1 rounded hover:bg-white/70 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBracketSelect(info.value);
                      }}
                    >
                      {selectedBracket === info.value ? '選択中' : '選択'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 詳細情報 */}
          {showDetails && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = bracketInfo[showDetails].icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                  <h3 className="text-lg font-semibold">{bracketInfo[showDetails].title}の詳細</h3>
                </div>
                <button
                  onClick={() => setShowDetails(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    メリット
                  </h4>
                  <ul className="space-y-1">
                    {bracketInfo[showDetails].pros.map((pro, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    注意点
                  </h4>
                  <ul className="space-y-1">
                    {bracketInfo[showDetails].cons.map((con, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  <strong>参考:</strong> これらの数値は目安です。実際の影響は勤務条件や家庭状況により異なります。
                  最終判断は公式情報や専門家にご相談ください。
                </div>
              </div>
            </section>
          )}

          {/* 現在の選択 */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">現在の設定</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{selectedBracket}万円の壁</div>
                <div className="text-sm text-gray-600">{bracketInfo[selectedBracket].subtitle}</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{selectedBracket}万円</div>
            </div>
          </section>

          {/* 基本情報設定 */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">基本情報</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生年月日
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={profile.birthDate || ""}
                  onChange={(e) => setProfile({ birthDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在学区分
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={profile.studentType || ""}
                  onChange={(e) => setProfile({ studentType: e.target.value as StudentType })}
                >
                  <option value="">選択してください</option>
                  <option value="daytime">昼間制</option>
                  <option value="evening">定時制</option>
                  <option value="correspondence">通信制</option>
                  <option value="leave">休学中</option>
                  <option value="graduate">卒業予定</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  居住自治体
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="例: 東京都新宿区"
                  value={profile.residenceCity || ""}
                  onChange={(e) => setProfile({ residenceCity: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* 保険情報設定 */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">保険情報</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保険加入状況
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={profile.insuranceStatus || ""}
                  onChange={(e) => setProfile({ insuranceStatus: e.target.value as InsuranceType })}
                >
                  <option value="">選択してください</option>
                  <option value="parent_dependent">親の扶養</option>
                  <option value="national_health">国民健康保険</option>
                  <option value="employee_health">社会保険</option>
                  <option value="none">未加入</option>
                </select>
              </div>
              
              {profile.insuranceStatus === "parent_dependent" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    親の保険種別
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    value={profile.parentInsuranceType || ""}
                    onChange={(e) => setProfile({ parentInsuranceType: e.target.value as ParentInsuranceType })}
                  >
                    <option value="">選択してください</option>
                    <option value="health_union">健康保険組合</option>
                    <option value="national_health">国民健康保険</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  親との同居状況
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={profile.livingStatus || ""}
                  onChange={(e) => setProfile({ livingStatus: e.target.value as LivingStatus })}
                >
                  <option value="">選択してください</option>
                  <option value="living_together">同居</option>
                  <option value="living_separately">別居</option>
                </select>
              </div>
              
              {profile.livingStatus === "living_separately" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    月額仕送り
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="例: 50000"
                    value={profile.monthlyAllowance || ""}
                    onChange={(e) => setProfile({ monthlyAllowance: Number(e.target.value) || undefined })}
                  />
                </div>
              )}
            </div>
          </section>

          {/* 勤務先情報設定 */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">勤務先情報</h3>
            <div className="grid gap-4">
              {profile.employers.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <CurrencyYenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">勤務先情報がありません</p>
                  <Link 
                    href="/onboarding" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    初回設定で追加
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {profile.employers.map((employer, index) => (
                    <div key={employer.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">勤務先 {index + 1}: {employer.name || '未設定'}</h4>
                        <button
                          onClick={() => removeEmployer(employer.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">勤務先名</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={employer.name}
                            onChange={(e) => updateEmployer(employer.id, { name: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">週労働時間</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={employer.weeklyHours}
                            onChange={(e) => updateEmployer(employer.id, { weeklyHours: Number(e.target.value) })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">月収見込み</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={employer.monthlyIncome}
                            onChange={(e) => updateEmployer(employer.id, { monthlyIncome: Number(e.target.value) })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">通勤手当</label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={employer.commutingAllowance}
                            onChange={(e) => updateEmployer(employer.id, { commutingAllowance: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  その他の所得
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="例: 奨学金、副業収入など"
                  value={profile.otherIncome || ""}
                  onChange={(e) => setProfile({ otherIncome: Number(e.target.value) || undefined })}
                />
              </div>
            </div>
          </section>

          {/* その他の設定 */}
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">その他の設定</h3>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">デフォルト時給</span>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2"
                  placeholder="例: 1200"
                  value={profile.defaultHourlyWage || ''}
                  onChange={(e) => setProfile({ defaultHourlyWage: Number(e.target.value) || undefined })}
                />
                <div className="text-xs text-gray-500">
                  シフト計算や残り時間の推定に使用されます
                </div>
              </label>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
