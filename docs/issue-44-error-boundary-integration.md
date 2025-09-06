# Issue #44: ErrorBoundaryの統合とエラーハンドリング強化

## 問題の概要
Reactレベルのエラーバウンダリが実装されているが、レイアウトで使用されておらず、API エラー処理が各コンポーネントで分散しています。

## 現在の状況
- `ErrorBoundary.tsx`は実装済みだが、`layout.tsx`で使用されていない
- 各コンポーネントで個別にエラーハンドリング
- 非同期エラーのキャッチ漏れ（Middlewareやオンボーディング処理）

## 問題の影響
- 予期しないエラー時のアプリケーション全体クラッシュリスク
- ユーザーエクスペリエンスの不安定性
- エラー処理の一貫性欠如

## 解決方針
1. **ErrorBoundary統合**: レイアウトレベルでの統合
2. **統一エラーハンドリング**: 共通のエラー処理パターンの確立
3. **非同期エラー対応**: Promise rejection等の適切なキャッチ
4. **エラーログ機能**: 開発・本番での適切なログ出力

## 実装タスク
### Phase 1: ErrorBoundary統合
- [ ] ルートレイアウト(`app/layout.tsx`)にErrorBoundary追加
- [ ] ダッシュボードレイアウトにErrorBoundary追加
- [ ] 認証レイアウトにErrorBoundary追加
- [ ] ErrorBoundaryのフォールバックUI改善

### Phase 2: 統一エラーハンドリング
- [ ] エラーハンドリング共通関数作成 (`lib/errorHandling.ts`)
- [ ] APIエラー処理の統一化
- [ ] 非同期処理エラーの統一対応
- [ ] トーストメッセージ機能の実装

### Phase 3: エラーログ強化
- [ ] クライアントサイドエラーログ機能
- [ ] サーバーサイドエラーログ機能
- [ ] 開発環境での詳細エラー表示
- [ ] 本番環境でのユーザーフレンドリーエラー表示

## 関連ファイル
- `src/components/ui/ErrorBoundary.tsx`
- `src/app/layout.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(auth)/layout.tsx`
- `src/lib/errorHandling.ts` (新規作成)
- `src/hooks/useToast.ts`

## テスト項目
- [ ] コンポーネントエラー時のErrorBoundary動作確認
- [ ] API エラー時の統一エラー表示
- [ ] 非同期処理エラーの適切なキャッチ
- [ ] ページリロード時のエラー状態復旧
- [ ] ネットワークエラー時の適切な表示

## 優先度
**中** - アプリケーションの安定性確保として重要

## 関連Issue
- #43 API Route実装完成（エラーレスポンス統一）

## Parent Issue
- #40 潜在的問題調査レポート
