# Issue 26: Vercel デプロイ & 本番運用初期セットアップ

## 目的
認証・オンボーディング機能を含むアプリを Vercel にデプロイし、本番相当環境で動作/セキュリティ/観測の最低限を整備する。

## スコープ (In)
- Vercel プロジェクト作成 & GitHub リンク
- 環境変数設定 (Supabase)
- Supabase Auth リダイレクト設定更新 (本番URL)
- E2E_MODE の本番無効化
- セキュリティヘッダ (最小) 付与
- デプロイ後の手動確認チェックリスト

## アウトスコープ (Out)
- 本格的な Observability (Sentry, Log 管理)
- CI/CD ワークフロー (別Issue)
- ドメインカスタム(CNAME)

## 必要環境変数 (Vercel Dashboard > Project Settings > Environment Variables)
| Key | Value (例) | Note |
|-----|-----------|------|
| NEXT_PUBLIC_SUPABASE_URL | https://xxxxx.supabase.co | Supabase プロジェクト URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (Anon 公開鍵) | Public ANON Key |

※ Prod / Preview / Dev 全てに設定 (差異があれば別管理)

## Supabase Auth 設定 (Dashboard)
Auth > URL Configuration:
- Redirect URLs に以下追加: 
  - https://<vercel-app>.vercel.app/*
  - http://localhost:3000/* (ローカル保持)
- Password recovery リンク許可

## Middleware 調整 (本番 E2E_MODE 無効化)
```ts
// middleware.ts (例)
if (process.env.NODE_ENV === 'production') {
  // ignore E2E_MODE block even if accidentally set
}
```
(現状 E2E_MODE ブロックを条件でスキップする追記)

## セキュリティヘッダ (例) next.config.ts
```ts
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
```
(必要に応じ CSP は後続)

## デプロイ手順概要
1. main ブランチ最新化 (auth helpers マージ済みであること)
2. GitHub リポジトリを Vercel に Import
3. Build Command: `npm run build` / Install Command: `npm install` / Output: `.next`
4. 環境変数設定後 “Deploy”
5. 完了後 URL で以下手動確認:
   - 未ログインで /dashboard → /login リダイレクト
   - 新規サインアップ → /onboarding 遷移
   - onboarding 完了 → /profile or /dashboard
   - リロードでセッション維持
   - パスワードリセットフロー (メールリンク) 正常

## 手動確認チェックリスト
- [ ] /login でサインアップ成功
- [ ] /dashboard 直アクセスで保護動作
- [ ] /onboarding 完遂後 redirect 成功
- [ ] /login へ戻ると /profile にリダイレクト (オンボード済)
- [ ] パスワードリセットメール受信 & 成功
- [ ] 404 ページ想定どおり

## フォローアップ (別 Issue 案)
- CI: GitHub Actions で build + lint + e2e
- ログアウト導線 (signOut + 状態リセット)
- CSP / Sentry / リアル E2E サインアップ自動化
- ダークモード / Lighthouse パフォーマンス計測

## 完了条件 (Definition of Done)
- 本番 URL で上記手動チェック全項目 OK
- main にヘッダ & E2E_MODE 無効化反映
- Issue コメントに URL & 動作結果記録

