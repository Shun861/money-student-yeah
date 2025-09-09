/**
 * API型定義
 * リクエスト・レスポンスの型安全性を保証
 */

import { UserProfile } from './index'

// ========================================
// Profile API Types
// ========================================

/**
 * GET /api/profile レスポンス
 */
export interface ProfileGetResponse {
  success: true
  profile: UserProfile | null
}

/**
 * PUT /api/profile リクエスト
 */
export interface ProfileUpdateRequest {
  // 基本情報
  birthDate?: string
  studentType?: 'daytime' | 'evening' | 'correspondence' | 'leave' | 'graduate'
  residenceCity?: string
  
  // 保険情報
  insuranceStatus?: 'parent_dependent' | 'national_health' | 'employee_health' | 'none'
  parentInsuranceType?: 'health_union' | 'national_health' | 'other'
  livingStatus?: 'living_together' | 'living_separately'
  monthlyAllowance?: number
  
  // その他の情報
  grade?: string
  isParentDependent?: boolean
  employerSize?: 'small' | 'medium' | 'large' | 'unknown'
  defaultHourlyWage?: number
  bracket?: 103 | 130 | 150
  otherIncome?: number
  
  // 利用規約同意
  termsAccepted?: boolean
  
  // オンボーディング完了フラグ
  onboardingCompleted?: boolean
}

/**
 * PUT /api/profile レスポンス
 */
export interface ProfileUpdateResponse {
  success: true
  profile: UserProfile
}

/**
 * POST /api/profile リクエスト
 */
export interface ProfileCreateRequest {
  // 新規作成時は最小限の情報で開始
  displayName?: string
  grade?: string
}

/**
 * POST /api/profile レスポンス
 */
export interface ProfileCreateResponse {
  success: true
  profile: UserProfile
}

// ========================================
// Error Response Types
// ========================================

/**
 * API エラーレスポンス
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: string | Record<string, unknown>
  }
}

/**
 * 一般的なエラーコード
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FORBIDDEN = 'FORBIDDEN'
}

// ========================================
// Union Types
// ========================================

/**
 * すべてのプロフィールAPIレスポンス
 */
export type ProfileApiResponse = 
  | ProfileGetResponse 
  | ProfileUpdateResponse 
  | ProfileCreateResponse 
  | ApiErrorResponse

/**
 * レスポンス型ガード
 */
export function isApiError(response: ProfileApiResponse): response is ApiErrorResponse {
  return response.success === false
}

export function isProfileGetResponse(response: ProfileApiResponse): response is ProfileGetResponse {
  return response.success === true && 'profile' in response && !('message' in response)
}

export function isProfileUpdateResponse(response: ProfileApiResponse): response is ProfileUpdateResponse {
  return response.success === true && 'profile' in response && !('message' in response)
}

export function isProfileCreateResponse(response: ProfileApiResponse): response is ProfileCreateResponse {
  return response.success === true && 'profile' in response && !('message' in response)
}
