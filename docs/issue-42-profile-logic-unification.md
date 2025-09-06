# Issue #42: プロフィール判定ロジックの統一化

## 問題の概要
複数箇所で異なる基準でプロフィール完了状態を判定しており、一貫性のない動作により予期しないリダイレクトが発生しています。

## 現在の状況

| 箇所 | 判定基準 | データソース |
|------|----------|--------------|
| Middleware | `profiles.onboarding_completed` | データベース |
| ログインページ | `profile.birthDate` | Zustandストア |
| ダッシュボード | `profile.birthDate` | Zustandストア |
| 収入ページ | `profile.birthDate` | Zustandストア |

## 問題の影響
- 一貫性のない判定により、予期しないリダイレクト発生
- デバッグが困難
- ユーザー体験の不安定性

## 解決方針
1. **単一ソースの真実**: データベース(`profiles.onboarding_completed`)を唯一の判定基準とする
2. **統一関数の作成**: プロフィール完了状態を判定する共通関数を作成
3. **各コンポーネントの統一**: 全ての判定箇所で共通関数を使用

## 実装タスク
- [ ] プロフィール完了判定の共通関数作成 (`lib/profileUtils.ts`)
- [ ] Middlewareの判定ロジック見直し
- [ ] ログインページの判定ロジック統一
- [ ] ダッシュボードページの判定ロジック統一  
- [ ] 収入ページの判定ロジック統一
- [ ] 他の関連ページの判定ロジック統一

## 関連ファイル
- `middleware.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/income/page.tsx`
- その他プロフィール判定を行うコンポーネント

## 優先度
**高** - Issue #29修正後の構造的改善として重要

## Parent Issue
- #40 潜在的問題調査レポート
