# Issue #48: 型安全性向上 - Supabase型生成とTypeScript強化

## 問題の概要
Next.js 15のApp Router型システムが十分活用されておらず、Supabase型定義が未設定で、TypeScript型とランタイム動作に差異があります。

## 現在の状況
- Supabaseのデータベーススキーマ型が自動生成されていない
- TypeScript型とランタイム実装の不整合（`onboarding_completed`等）
- Next.js 15の型安全性機能を十分活用していない
- 手動型定義によるメンテナンスコスト

## 問題の影響
- 型安全性の不完全性によるランタイムエラーリスク
- 開発体験の低下
- リファクタリング時のエラー検出困難
- データベーススキーマ変更時の手動更新

## 解決方針
1. **Supabase型自動生成**: CLI/GitHub Actionsでの型生成
2. **TypeScript strict設定**: より厳密な型チェック
3. **型定義の統一**: データベースとアプリケーション型の統合
4. **Next.js型機能活用**: App Routerの型安全性最大化

## 実装タスク
### Phase 1: Supabase型生成設定
- [ ] Supabase CLI設定とログイン
- [ ] 型生成スクリプトの作成 (`npm run generate-types`)
- [ ] GitHub Actions での自動型生成
- [ ] 生成された型の適切な配置

### Phase 2: 型定義統一
- [ ] データベーススキーマ型の適用
- [ ] 既存型定義との統合 (`src/types/index.ts`)
- [ ] Zustandストア型の更新
- [ ] API型定義の統一

### Phase 3: TypeScript設定強化
- [ ] `tsconfig.json`の strict設定見直し
- [ ] 未使用インポートのチェック強化
- [ ] null/undefined チェックの厳密化
- [ ] 型アサーションの最小化

### Phase 4: Next.js型機能活用
- [ ] App Routerのページ型定義活用
- [ ] サーバーアクションの型安全性
- [ ] メタデータ型の適切な使用
- [ ] ルーティング型の活用

## 関連ファイル
- `supabase/config.toml` (新規作成)
- `src/types/supabase.ts` (自動生成)
- `src/types/index.ts`
- `src/lib/store.ts`
- `tsconfig.json`
- `package.json`

## 実装例
```bash
# Supabase型生成
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/supabase.ts
```

```typescript
// 型統合例
import { Database } from './supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Zustandストア型更新
export type AppState = {
  profile: Profile;
  // その他の状態
};
```

## GitHub Actions設定例
```yaml
name: Generate Supabase Types
on:
  push:
    paths:
      - 'docs/sql/**'
  workflow_dispatch:

jobs:
  generate-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx supabase gen types typescript --project-id ${{ secrets.SUPABASE_PROJECT_ID }} > src/types/supabase.ts
```

## テスト項目
- [ ] 生成された型の正常性確認
- [ ] 既存コードとの互換性確認
- [ ] TypeScriptコンパイルエラーの解消
- [ ] IDE型チェック機能の改善確認
- [ ] 型エラーの網羅的チェック

## チェックリスト
- [ ] Supabase CLIの設定
- [ ] プロジェクトIDの環境変数設定
- [ ] 型生成スクリプトのテスト
- [ ] CI/CD パイプラインでの型チェック
- [ ] ドキュメント更新（型使用ガイドライン）

## 優先度
**低** - 開発体験向上として有益だが修正コストが高い

## 関連Issue
- #43 API Route実装完成（型安全なAPI）
- #45 Zustandストアの永続化（型統合）

## Parent Issue
- #40 潜在的問題調査レポート
