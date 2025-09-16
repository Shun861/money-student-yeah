"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { markOnboardingCompleted } from "@/lib/profileUtils";
import Link from "next/link";
import type { Step, StudentType, InsuranceType, ParentInsuranceType, LivingStatus, Employer, EmployerSize } from "@/types";

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
import { HelpToggle } from "@/components/ui/HelpToggle";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { 
  studentTypeOptions, 
  insuranceOptions, 
  parentInsuranceOptions, 
  livingStatusOptions, 
  employerSizeOptions 
} from "@/constants/options";
import { helpContent } from "@/constants/helpContent";

export default function OnboardingPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const addEmployer = useAppStore((s) => s.addEmployer);
  const removeEmployer = useAppStore((s) => s.removeEmployer);
  const updateEmployer = useAppStore((s) => s.updateEmployer);
  const router = useRouter();
  
  // すべてのstate hookを先頭で宣言
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showAllowanceInput, setShowAllowanceInput] = useState(
    profile.livingStatus === "living_separately"
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // ローカル雇用者管理（オンボーディング専用）
  const [localEmployers, setLocalEmployers] = useState<Employer[]>([]);
  const [savingEmployers, setSavingEmployers] = useState<Set<string>>(new Set());

  // 同居状況の変更を監視
  useEffect(() => {
    setShowAllowanceInput(profile.livingStatus === "living_separately");
  }, [profile.livingStatus]);

  const steps = [
    {
      id: 1,
      title: "基本情報",
      description: "年齢・在学状況",
      icon: UserIcon
    },
    {
      id: 2,
      title: "保険情報",
      description: "加入状況・扶養",
      icon: ShieldCheckIcon
    },
    {
      id: 3,
      title: "収入情報",
      description: "勤務先・収入",
      icon: CurrencyYenIcon
    }
  ];

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
    // ローカル状態のみに追加（API呼び出しなし）
    setLocalEmployers(prev => [...prev, newEmployer]);
  };

  const removeEmployerById = (id: string) => {
    // ローカル状態から削除
    setLocalEmployers(prev => prev.filter(emp => emp.id !== id));
    // 既に保存済みの場合はstoreからも削除
    const existingEmployer = profile.employers?.find(emp => emp.id === id);
    if (existingEmployer) {
      removeEmployer(id);
    }
  };

  const updateLocalEmployer = (id: string, updates: Partial<Employer>) => {
    setLocalEmployers(prev => 
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    );
  };

  const saveEmployer = async (employer: Employer) => {
    // 必須項目のバリデーション
    if (!employer.name?.trim()) {
      throw new Error('勤務先名は必須です');
    }

    setSavingEmployers(prev => new Set(prev).add(employer.id));
    try {
      // API経由で保存
      await addEmployer(employer);
      // 成功時はローカルから削除（storeに移行済み）
      setLocalEmployers(prev => prev.filter(emp => emp.id !== employer.id));
    } catch (error) {
      console.error('Failed to save employer:', error);
      throw new Error(
        `Failed to save employer "${employer.name ?? employer.id ?? 'unknown'}": ${error instanceof Error ? error.message : String(error)}`,
        { cause: error }
      );
    } finally {
      setSavingEmployers(prev => {
        const newSet = new Set(prev);
        newSet.delete(employer.id);
        return newSet;
      });
    }
  };

  const isStep1Complete = profile.birthDate && profile.studentType && profile.residenceCity;
  const isStep2Complete = profile.insuranceStatus && profile.parentInsuranceType && profile.livingStatus;
  
  // 全ての雇用者（ローカル + 保存済み）を取得（useMemoで最適化）
  const allEmployers = useMemo(() => [...(profile.employers || []), ...localEmployers], [profile.employers, localEmployers]);
  const isStep3Complete = allEmployers.length > 0 && profile.termsAccepted;

  const completeOnboarding = async () => {
    if (!isStep3Complete || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // 未保存のローカル雇用者を先に保存
      const validLocalEmployers = localEmployers.filter(emp => emp.name?.trim());
      const invalidLocalEmployers = localEmployers.filter(emp => !emp.name?.trim());
      
      // バリデーションエラーがある場合は事前に通知
      if (invalidLocalEmployers.length > 0) {
        throw new Error(`${invalidLocalEmployers.length}件の勤務先に名前が入力されていません。すべての勤務先に名前を入力してください。`);
      }
      
      // 一括保存の実行（Promise.allSettledで部分的失敗に対応）
      if (validLocalEmployers.length > 0) {
        const saveResults = await Promise.allSettled(
          validLocalEmployers.map(employer => saveEmployer(employer))
        );
        
        const failedSaves = saveResults
          .map((result, index) => ({ result, employer: validLocalEmployers[index] }))
          .filter(({ result }) => result.status === 'rejected');
        
        if (failedSaves.length > 0) {
          const failedNames = failedSaves.map(({ employer }) => employer.name || employer.id).join(', ');
          throw new Error(`以下の勤務先の保存に失敗しました: ${failedNames}。再度お試しください。`);
        }
      }

      // 現在のユーザーを取得
      const supabase = getSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('ユーザー認証に失敗しました');
      }

      // 統一されたヘルパー関数を使用してオンボーディング完了をマーク
      const success = await markOnboardingCompleted(user.id);
      if (!success) {
        throw new Error('オンボーディング完了の記録に失敗しました');
      }
      
      // 成功したら直接ダッシュボードに遷移
      router.push('/dashboard');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '更新に失敗しました';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">初回設定</h1>
        <p className="text-gray-600">2025年度の最新制度に基づいて、あなたの扶養状況を正確に判定します</p>
      </div>

      <ProgressBar current={currentStep} total={3} />
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* ステップ1: 基本情報 */}
      {currentStep === 1 && (
        <div className="alumnote-card p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-blue-600" />
            基本情報
          </h2>
          
          <div className="grid gap-6">
            <HelpToggle
              label="生年月日"
              helpContent={helpContent.birthDate}
              required
            >
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={profile.birthDate || ""}
                onChange={(e) => setProfile({ birthDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">年齢に基づいて扶養控除の適用可否を判定します</p>
            </HelpToggle>

            <HelpToggle
              label="在学区分"
              helpContent={helpContent.studentType}
              required
            >
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
            </HelpToggle>

            <HelpToggle
              label="居住自治体"
              helpContent={helpContent.residenceCity}
              required
            >
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: 東京都新宿区"
                value={profile.residenceCity || ""}
                onChange={(e) => setProfile({ residenceCity: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">住民税の非課税基準判定に使用します</p>
            </HelpToggle>
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
                      onChange={(e) => setProfile({ livingStatus: e.target.value as LivingStatus })}
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
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setProfile({ monthlyAllowance: value > 0 ? value : undefined });
                  }}
                  min={0}
                  step={1}
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
              
              {allEmployers.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <CurrencyYenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">勤務先を追加してください</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {allEmployers.map((employer, index) => {
                    const isLocal = localEmployers.some(emp => emp.id === employer.id);
                    const isSaving = savingEmployers.has(employer.id);
                    const canSave = isLocal && employer.name?.trim();
                    
                    return (
                      <div key={employer.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">勤務先 {index + 1}</h4>
                            {isLocal && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                未保存
                              </span>
                            )}
                            {isSaving && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                保存中...
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isLocal && canSave && !isSaving && (
                              <button
                                onClick={() => saveEmployer(employer)}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                                disabled={isSaving}
                              >
                                保存
                              </button>
                            )}
                            <button
                              onClick={() => removeEmployerById(employer.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
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
                            onChange={(e) => {
                              if (isLocal) {
                                updateLocalEmployer(employer.id, { name: e.target.value });
                              } else {
                                updateEmployer(employer.id, { name: e.target.value });
                              }
                            }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            勤務先規模
                          </label>
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={employer.employerSize}
                            onChange={(e) => {
                              if (isLocal) {
                                updateLocalEmployer(employer.id, { employerSize: e.target.value as EmployerSize });
                              } else {
                                updateEmployer(employer.id, { employerSize: e.target.value as EmployerSize });
                              }
                            }}
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
                            onChange={(e) => {
                              if (isLocal) {
                                updateLocalEmployer(employer.id, { weeklyHours: Number(e.target.value) });
                              } else {
                                updateEmployer(employer.id, { weeklyHours: Number(e.target.value) });
                              }
                            }}
                            min={0}
                            step={0.5}
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
                            onChange={(e) => {
                              if (isLocal) {
                                updateLocalEmployer(employer.id, { monthlyIncome: Number(e.target.value) });
                              } else {
                                updateEmployer(employer.id, { monthlyIncome: Number(e.target.value) });
                              }
                            }}
                            min={0}
                            step={1}
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
                            onChange={(e) => {
                              if (isLocal) {
                                updateLocalEmployer(employer.id, { commutingAllowance: Number(e.target.value) });
                              } else {
                                updateEmployer(employer.id, { commutingAllowance: Number(e.target.value) });
                              }
                            }}
                            min={0}
                            step={1}
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
                            onChange={(e) => {
                              if (isLocal) {
                                updateLocalEmployer(employer.id, { bonus: Number(e.target.value) });
                              } else {
                                updateEmployer(employer.id, { bonus: Number(e.target.value) });
                              }
                            }}
                            min={0}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                    );
                  })}
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
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setProfile({ otherIncome: value > 0 ? value : undefined });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">奨学金、副業収入、投資収入などを含みます</p>
            </div>

            {/* 利用規約同意 */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={profile.termsAccepted || false}
                  onChange={(e) => setProfile({ termsAccepted: e.target.checked })}
                  className="mt-1"
                  required
                />
                <div>
                  <label htmlFor="termsAccepted" className="text-sm font-medium text-gray-700">
                    利用規約とプライバシーポリシーに同意します <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800" target="_blank">
                      利用規約
                    </Link>
                    と
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800" target="_blank">
                      プライバシーポリシー
                    </Link>
                    を確認し、同意してください。
                  </p>
                </div>
              </div>
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
        
        {submitError && (
          <p className="text-sm text-red-600 mr-auto">{submitError}</p>
        )}
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
            onClick={completeOnboarding}
            disabled={!isStep3Complete || submitting}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '保存中…' : '完了'}
            <CheckIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}


