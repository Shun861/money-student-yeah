# Issue #46: 環境変数管理とデプロイ設定の強化

## 問題の概要
環境変数の検証が不十分で、本番デプロイ時の設定漏れリスクがあります。また、E2Eモード設定が複雑で、環境分離が不明確です。

## 現在の状況
- `console.warn`のみで実行継続する中途半端な検証
- 空文字列での実行継続によるランタイムエラーリスク
- E2Eモード設定の複雑性
- 本番・開発・テストの環境分離が不明確

## 問題の影響
- 本番デプロイ時の予期しない動作
- デバッグ困難な環境差異
- Vercelデプロイ時の設定漏れによる障害

## 解決方針
1. **厳密な環境変数バリデーション**: 起動時エラーでの停止
2. **環境別設定の明確化**: 開発・テスト・本番の分離
3. **デプロイ設定の自動化**: Vercel設定の標準化
4. **型安全な環境変数**: TypeScript型定義

## 実装タスク
### Phase 1: 環境変数バリデーション強化
- [ ] `env.ts`の厳密バリデーション実装
- [ ] 起動時必須環境変数チェック
- [ ] 型安全な環境変数アクセス
- [ ] 開発環境でのデフォルト値設定

### Phase 2: 環境分離の明確化  
- [ ] `.env.example`の完全化
- [ ] `.env.local.example`、`.env.test.example`の追加
- [ ] 環境別設定ドキュメントの作成
- [ ] E2Eモード設定の簡素化

### Phase 3: デプロイ設定標準化
- [ ] Vercel環境変数設定の自動化
- [ ] GitHub Actions での環境変数チェック
- [ ] デプロイ前バリデーションの実装
- [ ] 本番環境ヘルスチェック機能

## 関連ファイル
- `src/lib/env.ts`
- `.env.example`
- `.env.local.example` (新規作成)
- `.env.test.example` (新規作成)
- `playwright.config.ts`
- `next.config.ts`
- `middleware.ts`

## 実装例
```typescript
// src/lib/env.ts
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return { url, anonKey };
}
```

## テスト項目
- [ ] 環境変数未設定時の適切なエラー
- [ ] 各環境での設定値の適切な分離
- [ ] Vercelデプロイ時の環境変数反映確認
- [ ] E2Eテスト環境の独立性確認
- [ ] 本番環境での設定値検証

## デプロイチェックリスト
- [ ] Vercel Dashboard環境変数設定
- [ ] Supabase設定値の確認
- [ ] ドメイン設定の確認
- [ ] セキュリティヘッダーの確認

## 優先度
**中** - 本番運用の安定性確保として重要

## 関連Issue
- #26 Vercel デプロイ & 本番運用初期セットアップ

## Parent Issue  
- #40 潜在的問題調査レポート
