/**
 * APIクライアント - 統一されたAPI通信とエラーハンドリング
 */

import { ApiErrorResponse } from '@/types/api';
import { AppError, ErrorType, fromApiError, fromError } from './errorHandling';

// ========================================
// API 設定
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// ========================================
// APIクライアント関数
// ========================================

/**
 * 統一されたAPI呼び出し関数
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // デフォルトヘッダーを設定
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    // レスポンスJSONを解析
    const data = await response.json();

    // エラーレスポンスの処理
    if (!response.ok) {
      const apiError = data as ApiErrorResponse;
      throw fromApiError(apiError, url);
    }

    // 成功レスポンスの処理
    if (data.success === false) {
      const apiError = data as ApiErrorResponse;
      throw fromApiError(apiError, url);
    }

    return data;

  } catch (error) {
    // ネットワークエラーや解析エラーの処理
    if (error instanceof Error && error.name === 'TypeError') {
      // fetchのネットワークエラー
      throw {
        type: ErrorType.NETWORK,
        message: 'ネットワークエラーが発生しました',
        details: error.message,
        originalError: error,
        timestamp: new Date().toISOString(),
        url,
      } as AppError;
    }

    // 既にAppErrorの場合はそのまま投げる
    if (error && typeof error === 'object' && 'type' in error) {
      throw error;
    }

    // その他のエラー
    throw fromError(error instanceof Error ? error : new Error(String(error)), url);
  }
}

// ========================================
// 便利関数
// ========================================

/**
 * GET リクエスト
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}

/**
 * POST リクエスト
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT リクエスト
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE リクエスト
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
}

// ========================================
// React Hook形式のAPIクライアント
// ========================================

import { useState, useCallback } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

/**
 * API呼び出し用React Hook
 */
export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const appError = error && typeof error === 'object' && 'type' in error
        ? error as AppError
        : fromError(error instanceof Error ? error : new Error(String(error)));
      
      setState({ data: null, loading: false, error: appError });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// ========================================
// プロフィールAPI 専用関数
// ========================================

import {
  ProfileGetResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  ProfileCreateRequest,
  ProfileCreateResponse,
} from '@/types/api';

/**
 * プロフィール取得
 */
export async function getProfile(): Promise<ProfileGetResponse> {
  return apiGet<ProfileGetResponse>('/profile');
}

/**
 * プロフィール更新
 */
export async function updateProfile(data: ProfileUpdateRequest): Promise<ProfileUpdateResponse> {
  return apiPut<ProfileUpdateResponse>('/profile', data);
}

/**
 * プロフィール作成
 */
export async function createProfile(data?: ProfileCreateRequest): Promise<ProfileCreateResponse> {
  return apiPost<ProfileCreateResponse>('/profile', data);
}
