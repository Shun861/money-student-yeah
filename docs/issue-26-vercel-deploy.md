# Issue 26: Vercel デプロイ & 本番運用初期セットアップ\n\n## 目的\n認証・オンボーディング機能を含むアプリを Vercel にデプロイし、本番相当環境で動作/セキュリティ/観測の最低限を整備する。\n\n## スコープ (In)\n- Vercel プロジェクト作成 & GitHub リンク\n- 環境変数設定 (Supabase)\n- Supabase Auth リダイレクト設定更新 (本番URL)\n- E2E_MODE の本番無効化\n- セキュリティヘッダ (最小) 付与\n- デプロイ後の手動確認チェックリスト\n\n## アウトスコープ (Out)\n- 本格的な Observability (Sentry, Log 管理)\n- CI/CD ワークフロー (別Issue)\n- ドメインカスタム(CNAME)\n\n## 必要環境変数 (Vercel Dashboard > Project Settings > Environment Variables)\n| Key | Value (例) | Note |
|-----|-----------|------|
| NEXT_PUBLIC_SUPABASE_URL | https://xxxxx.supabase.co | Supabase プロジェクト URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (Anon 公開鍵) | Public ANON Key |
\n※ Prod / Preview / Dev 全てに設定 (差異があれば別管理)\n\n## Supabase Auth 設定 (Dashboard)\nAuth > URL Configuration:\n- Redirect URLs に以下追加: \n  - https://<vercel-app>.vercel.app/*\n  - http://localhost:3000/* (ローカル保持)\n- Password recovery リンク許可\n\n## Middleware 調整 (本番 E2E_MODE 無効化)
```ts
// middleware.ts (例)
if (process.env.NODE_ENV === 'production') {
  // ignore E2E_MODE block even if accidentally set
}
```
(現状 E2E_MODE ブロックを条件でスキップする追記)\n\n## セキュリティヘッダ (例) next.config.ts
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
```\n(必要に応じ CSP は後続)\n\n## デプロイ手順概要\n1. main ブランチ最新化 (auth helpers マージ済みであること)\n2. GitHub リポジトリを Vercel に Import\n3. Build Command: `npm run build` / Install Command: `npm install` / Output: `.next`\n4. 環境変数設定後 “Deploy”\n5. 完了後 URL で以下手動確認:\n   - 未ログインで /dashboard → /login リダイレクト\n   - 新規サインアップ → /onboarding 遷移\n   - onboarding 完了 → /profile or /dashboard\n   - リロードでセッション維持\n   - パスワードリセットフロー (メールリンク) 正常\n\n## 手動確認チェックリスト\n- [ ] /login でサインアップ成功\n- [ ] /dashboard 直アクセスで保護動作\n- [ ] /onboarding 完遂後 redirect 成功\n- [ ] /login へ戻ると /profile にリダイレクト (オンボード済)\n- [ ] パスワードリセットメール受信 & 成功\n- [ ] 404 ページ想定どおり\n\n## フォローアップ (別 Issue 案)\n- CI: GitHub Actions で build + lint + e2e\n- ログアウト導線 (signOut + 状態リセット)\n- CSP / Sentry / リアル E2E サインアップ自動化\n- ダークモード / Lighthouse パフォーマンス計測\n\n## 完了条件 (Definition of Done)\n- 本番 URL で上記手動チェック全項目 OK\n- main にヘッダ & E2E_MODE 無効化反映\n- Issue コメントに URL & 動作結果記録\n
