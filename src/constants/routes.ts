/**
 * アプリケーション内のルート定数
 */

export const ROUTES = {
  // 認証関連
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // ダッシュボード
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  BUDGET: '/dashboard/budget',
  EXPENSES: '/dashboard/expenses',
  
  // マーケティング
  HOME: '/',
  ABOUT: '/about',
  PRICING: '/pricing',
  
  // エラーページ
  ERROR: '/error',
  NOT_FOUND: '/404'
} as const

export type RouteKey = keyof typeof ROUTES
export type RoutePath = typeof ROUTES[RouteKey]
