# Issue #45: Zustandストアの永続化とSSR/CSR統合

## 問題の概要
Zustandストアにデータ永続化設定がなく、ページリロード時にストアデータが初期化される可能性があります。また、SSR/CSR間での状態不整合によるハイドレーションエラーのリスクがあります。

## 現在の状況
- Zustandストアの永続化設定なし
- ページリロード時のデータ初期化リスク
- `profile.birthDate`などの状態がクライアントサイドでのみ初期化
- サーバー側とクライアント側で異なる状態レンダリング

## 問題の影響
- ユーザーの入力データが予期せず失われる可能性
- ページリロード時の一瞬の内容切り替え（フラッシュ）
- SEOに悪影響（サーバー側レンダリング内容が空）

## 解決方針
1. **Zustand永続化**: `zustand/middleware`の`persist`を使用
2. **SSR対応**: サーバー側での適切な初期状態設定
3. **ハイドレーション対応**: 状態の一貫性確保
4. **localStorage統合**: クライアントサイド永続化

## 実装タスク
### Phase 1: ストア永続化
- [ ] Zustand `persist` middleware導入
- [ ] ローカルストレージとの同期設定
- [ ] 永続化対象データの選定（profile, incomes等）
- [ ] マイグレーション機能実装（スキーマ変更対応）

### Phase 2: SSR/CSR統合
- [ ] サーバーサイドでの初期状態設定
- [ ] `useState`と`useEffect`を使った適切なハイドレーション対応
- [ ] `typeof window !== 'undefined'` チェックの統一化
- [ ] 初期ローディング状態の改善

### Phase 3: データ同期強化
- [ ] データベースとローカルストレージの同期メカニズム
- [ ] オフライン対応（必要に応じて）
- [ ] データ整合性チェック機能
- [ ] エラー時のフォールバック機能

## 関連ファイル
- `src/lib/store.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/app/layout.tsx`
- 各種コンポーネントファイル

## 設定例
```typescript
import { persist } from 'zustand/middleware'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // existing store implementation
    }),
    {
      name: 'money-student-store',
      partialize: (state) => ({
        profile: state.profile,
        incomes: state.incomes,
        // 永続化したい状態のみ選択
      }),
    }
  )
)
```

## テスト項目
- [ ] ページリロード後のデータ保持確認
- [ ] ブラウザタブ間でのデータ同期
- [ ] ローカルストレージデータの適切な復元
- [ ] SSRとCSRでの一貫した表示
- [ ] 大量データ時のパフォーマンス確認

## 優先度
**中** - ユーザーエクスペリエンス向上として重要

## 関連Issue
- #42 プロフィール判定ロジックの統一化
- #43 API Route実装完成

## Parent Issue
- #40 潜在的問題調査レポート
