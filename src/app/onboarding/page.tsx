"use client";
import { useState } from "react";
import { useAppStore, type EmployerSize, type StudentType, type InsuranceType, type ParentInsuranceType, type LivingStatus, type Employer } from "@/lib/store";
import { 
  UserIcon, 
  ShieldCheckIcon, 
  CurrencyYenIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from "@heroicons/react/24/outline";

type Step = 1 | 2 | 3;

const studentTypeOptions = [
  { value: "daytime", label: "昼間制", description: "通常の大学・専門学校" },
  { value: "evening", label: "定時制", description: "夜間の大学・専門学校" },
  { value: "correspondence", label: "通信制", description: "通信教育" },
  { value: "leave", label: "休学中", description: "現在休学中" },
  { value: "graduate", label: "卒業予定", description: "今年度中に卒業予定" }
];

const insuranceOptions = [
  { value: "parent_dependent", label: "親の扶養", description: "親の健康保険の被扶養者" },
  { value: "national_health", label: "国民健康保険", description: "自分で国民健康保険に加入" },
  { value: "employee_health", label: "社会保険", description: "勤務先の社会保険に加入" },
  { value: "none", label: "未加入", description: "現在保険に加入していない" }
];

const parentInsuranceOptions = [
  { value: "health_union", label: "健康保険組合", description: "会社の健康保険組合" },
  { value: "national_health", label: "国民健康保険", description: "親が国民健康保険" },
  { value: "other", label: "その他", description: "共済組合など" }
];

const livingStatusOptions = [
  { value: "living_together", label: "同居", description: "親と一緒に住んでいる" },
  { value: "living_separately", label: "別居", description: "親と別々に住んでいる" }
];

const employerSizeOptions = [
  { value: "small", label: "小規模", description: "従業員50人未満" },
  { value: "medium", label: "中規模", description: "従業員50〜500人" },
  { value: "large", label: "大規模", description: "従業員500人以上" }
];

export default function OnboardingPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const addEmployer = useAppStore((s) => s.addEmployer);
  const removeEmployer = useAppStore((s) => s.removeEmployer);
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showAllowanceInput, setShowAllowanceInput] = useState(false);
  
  // ヘルプ表示の状態管理
  const [showBirthDateHelp, setShowBirthDateHelp] = useState(false);
  const [showStudentTypeHelp, setShowStudentTypeHelp] = useState(false);
  const [showResidenceHelp, setShowResidenceHelp] = useState(false);
  const [showInsuranceHelp, setShowInsuranceHelp] = useState(false);
  const [showParentInsuranceHelp, setShowParentInsuranceHelp] = useState(false);
  const [showLivingStatusHelp, setShowLivingStatusHelp] = useState(false);
  const [showAllowanceHelp, setShowAllowanceHelp] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const addNewEmployer = () => {
    const newEmployer: Employer = {
      id: Date.now().toString(),
      name: "",
      weeklyHours: 0,
      monthlyIncome: 0,
      commutingAllowance: 0,
      bonus: 0,
      employerSize: "unknown"
    };
    addEmployer(newEmployer);
  };

  const updateEmployer = (id: string, updates: Partial<Employer>) => {
    setProfile({
      employers: profile.employers.map(emp => 
        emp.id === id ? { ...emp, ...updates } : emp
      )
    });
  };

  const removeEmployerById = (id: string) => {
    removeEmployer(id);
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  const isStep1Complete = profile.birthDate && profile.studentType && profile.residenceCity;
  const isStep2Complete = profile.insuranceStatus && profile.parentInsuranceType && profile.livingStatus;
  const isStep3Complete = profile.employers.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">初回設定</h1>
        <p className="text-gray-600">2025年度の最新制度に基づいて、あなたの扶養状況を正確に判定します</p>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">進捗: {currentStep}/3</span>
          <span className="text-sm text-gray-500">{Math.round(getStepProgress())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${getStepProgress()}%` }}
          />
        </div>
      </div>

      {/* ステップインジケーター */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className={`text-center p-4 rounded-lg ${currentStep >= 1 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
          <UserIcon className={`w-8 h-8 mx-auto mb-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`} />
          <div className="font-medium text-sm">基本情報</div>
          <div className="text-xs text-gray-500">年齢・在学状況</div>
        </div>
        <div className={`text-center p-4 rounded-lg ${currentStep >= 2 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
          <ShieldCheckIcon className={`w-8 h-8 mx-auto mb-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`} />
          <div className="font-medium text-sm">保険情報</div>
          <div className="text-xs text-gray-500">加入状況・扶養</div>
        </div>
        <div className={`text-center p-4 rounded-lg ${currentStep >= 3 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} border`}>
          <CurrencyYenIcon className={`w-8 h-8 mx-auto mb-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`} />
          <div className="font-medium text-sm">収入情報</div>
          <div className="text-xs text-gray-500">勤務先・収入</div>
        </div>
      </div>

      {/* ステップ1: 基本情報 */}
      {currentStep === 1 && (
        <div className="alumnote-card p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-blue-600" />
            基本情報
          </h2>
          
          <div className="grid gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  生年月日 <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => setShowBirthDateHelp(!showBirthDateHelp)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showBirthDateHelp ? '解説を隠す' : '解説を見る'}
                </button>
              </div>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={profile.birthDate || ""}
                onChange={(e) => setProfile({ birthDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">年齢に基づいて扶養控除の適用可否を判定します</p>
              {showBirthDateHelp && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p><strong>なぜ必要？</strong></p>
                  <p>年齢によって扶養控除の適用可否が変わります。16歳未満は扶養控除の対象外、16歳以上23歳未満は特定扶養控除の対象となります。</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  在学区分 <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => setShowStudentTypeHelp(!showStudentTypeHelp)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showStudentTypeHelp ? '解説を隠す' : '解説を見る'}
                </button>
              </div>
              <div className="grid gap-3">
                {studentTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="studentType"
                      value={option.value}
                      checked={profile.studentType === option.value}
                      onChange={(e) => setProfile({ studentType: e.target.value as StudentType })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              {showStudentTypeHelp && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p><strong>なぜ重要？</strong></p>
                  <p>在学区分によって勤労学生控除の適用や、扶養控除の判定基準が変わります。特に定時制・通信制は勤労学生控除の対象外となる場合があります。</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  居住自治体 <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => setShowResidenceHelp(!showResidenceHelp)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showResidenceHelp ? '解説を隠す' : '解説を見る'}
                </button>
              </div>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: 東京都新宿区"
                value={profile.residenceCity || ""}
                onChange={(e) => setProfile({ residenceCity: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">住民税の非課税基準判定に使用します</p>
              {showResidenceHelp && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p><strong>なぜ必要？</strong></p>
                  <p>住民税の非課税基準は自治体によって異なります。正確な判定のために居住地の情報が必要です。</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ステップ2: 保険情報 */}
      {currentStep === 2 && (
        <div className="alumnote-card p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            保険情報
          </h2>
          
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在の保険加入状況 <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3">
                {insuranceOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="insuranceStatus"
                      value={option.value}
                      checked={profile.insuranceStatus === option.value}
                      onChange={(e) => setProfile({ insuranceStatus: e.target.value as InsuranceType })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {profile.insuranceStatus === "parent_dependent" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  親の保険種別 <span className="text-red-500">*</span>
                </label>
                <div className="grid gap-3">
                  {parentInsuranceOptions.map((option) => (
                    <label key={option.value} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="parentInsuranceType"
                        value={option.value}
                        checked={profile.parentInsuranceType === option.value}
                        onChange={(e) => setProfile({ parentInsuranceType: e.target.value as ParentInsuranceType })}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                親との同居状況 <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3">
                {livingStatusOptions.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="livingStatus"
                      value={option.value}
                      checked={profile.livingStatus === option.value}
                      onChange={(e) => {
                        setProfile({ livingStatus: e.target.value as LivingStatus });
                        setShowAllowanceInput(e.target.value === "living_separately");
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {showAllowanceInput && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  月額仕送り <span className="text-gray-500">（任意）</span>
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: 50000"
                  value={profile.monthlyAllowance || ""}
                  onChange={(e) => setProfile({ monthlyAllowance: Number(e.target.value) || undefined })}
                />
                <p className="text-xs text-gray-500 mt-1">扶養控除の判定に影響する場合があります</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ステップ3: 収入情報 */}
      {currentStep === 3 && (
        <div className="alumnote-card p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <CurrencyYenIcon className="w-6 h-6 text-blue-600" />
            収入情報
          </h2>
          
          <div className="grid gap-6">
            {/* 勤務先情報 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  勤務先情報 <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={addNewEmployer}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  勤務先を追加
                </button>
              </div>
              
              {profile.employers.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <CurrencyYenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">勤務先を追加してください</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {profile.employers.map((employer, index) => (
                    <div key={employer.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">勤務先 {index + 1}</h4>
                        <button
                          onClick={() => removeEmployerById(employer.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            勤務先名
                          </label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="例: コンビニエンスストア"
                            value={employer.name}
                            onChange={(e) => updateEmployer(employer.id, { name: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            勤務先規模
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={employer.employerSize}
                            onChange={(e) => updateEmployer(employer.id, { employerSize: e.target.value as EmployerSize })}
                          >
                            {employerSizeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            週労働時間
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="例: 20"
                            value={employer.weeklyHours}
                            onChange={(e) => updateEmployer(employer.id, { weeklyHours: Number(e.target.value) })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            月収見込み
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="例: 80000"
                            value={employer.monthlyIncome}
                            onChange={(e) => updateEmployer(employer.id, { monthlyIncome: Number(e.target.value) })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            通勤手当
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="例: 5000"
                            value={employer.commutingAllowance}
                            onChange={(e) => updateEmployer(employer.id, { commutingAllowance: Number(e.target.value) })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            賞与見込み
                          </label>
                          <input
                            type="number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="例: 100000"
                            value={employer.bonus}
                            onChange={(e) => updateEmployer(employer.id, { bonus: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* その他の所得 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                その他の所得 <span className="text-gray-500">（任意）</span>
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="例: 奨学金、副業収入など"
                value={profile.otherIncome || ""}
                onChange={(e) => setProfile({ otherIncome: Number(e.target.value) || undefined })}
              />
              <p className="text-xs text-gray-500 mt-1">奨学金、副業収入、投資収入などを含みます</p>
            </div>
          </div>
        </div>
      )}

      {/* ナビゲーションボタン */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          前へ
        </button>
        
        <div className="flex items-center gap-4">
          {currentStep === 1 && isStep1Complete && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">完了</span>
            </div>
          )}
          {currentStep === 2 && isStep2Complete && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">完了</span>
            </div>
          )}
          {currentStep === 3 && isStep3Complete && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckIcon className="w-4 h-4" />
              <span className="text-sm">完了</span>
            </div>
          )}
        </div>
        
        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !isStep1Complete) ||
              (currentStep === 2 && !isStep2Complete)
            }
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/'}
            disabled={!isStep3Complete}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            完了
            <CheckIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}


