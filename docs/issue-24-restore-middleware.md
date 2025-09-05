# Issue 24: middleware.ts 復元と認証ガード再有効化

## 背景
`middleware.ts` が誤って `middleware.ts.bak` として残存しており、Next.js のミドルウェアが実行されず未ログイン状態でも `/dashboard` 等へアクセスできてしまっている。

## 問題
- 認証リダイレクト（/login への誘導）が効かない
- オンボーディング完了チェックが機能していない
- E2E_MODE のシミュレーション経路も無効

## 対応内容
1. `middleware.ts.bak` を `middleware.ts` として復元
2. 既存内容はそのまま使用（後続Issueで E2E_MODE の production 無効化検討）
3. 動作確認: 未ログインで `/dashboard` アクセス → `/login` へリダイレクト
4. 既存ログイン済 & 未オンボード → `/onboarding` へ誘導
5. ログイン済 & オンボード済が `/login` へアクセス → `/profile` へリダイレクト

## 確認手順
```bash
npm run build && npm start
# ブラウザ: http://localhost:3000/dashboard -> /login になること
```

## 追加メモ
- ルート `page.tsx` の強制 `/dashboard` リダイレクトは別Issueで再検討（トップを /login または LP にするかなど）
- ログアウトボタン未実装（別Issue予定）
