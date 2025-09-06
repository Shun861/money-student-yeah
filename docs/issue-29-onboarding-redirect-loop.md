# Issue #29: オンボーディング完了時にダッシュボードに遷移できない問題

## 問題の概要
オンボーディング完了ボタンをクリックした後、ダッシュボードに遷移されずに無限にオンボーディングページにリダイレクトされ続ける問題があります。

## 現在の動作
1. オンボーディング完了時：`localStorage.setItem('onboarding_completed', 'true')` + `router.push('/')`
2. ルートページ：`redirect('/dashboard')` でダッシュボードにリダイレクト
3. **Middleware**：データベースの`profiles.onboarding_completed`フィールドをチェック
4. **問題**：データベースに保存されていないため、Middlewareが未完了と判断
5. **結果**：`/onboarding`にリダイレクトされ続ける（無限ループ）

## 根本原因
- **オンボーディング完了処理**：ローカルストレージにのみ保存
- **Middlewareの認証チェック**：データベースの`profiles.onboarding_completed`をチェック
- **不整合**：保存先と確認先が異なるため、完了状態が同期されない

## 影響範囲
- オンボーディングを完了したすべてのユーザーがダッシュボードに到達できない
- ユーザーエクスペリエンスの重大な問題

## 解決策

### Option A: データベースに保存するように修正
```tsx
// src/app/(dashboard)/onboarding/page.tsx の completeOnboarding 関数
const completeOnboarding = async () => {
  // 既存のローカル処理
  localStorage.setItem('onboarding_completed', 'true');
  
  // データベースに保存を追加
  const supabase = createClient();
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id);
    
  router.push('/dashboard'); // 直接ダッシュボードへ
};
```

### Option B: Middlewareをローカルストレージベースに変更
クライアントサイドでの判定に変更する（ただし、SSRとの整合性に注意が必要）

## ファイル
- **問題のあるファイル**: 
  - `src/app/(dashboard)/onboarding/page.tsx` (116行目)
  - `middleware.ts` (80-87行目)
- **関連ファイル**:
  - `src/app/page.tsx` (リダイレクト処理)

## 優先度
**高** - ユーザーがオンボーディング完了後にアプリケーションを使用できない重大な問題

## テスト方法
1. 新規ユーザーでログイン
2. オンボーディングを完了
3. 完了ボタンをクリック
4. ダッシュボードに遷移されることを確認

## 備考
- Issue #24でMiddlewareが復旧された際に発生した可能性
- データベーススキーマ確認：`profiles`テーブルに`onboarding_completed`フィールドが存在するか要確認
