# Money Student Yeah

学生向けの収入管理・扶養制限シミュレーションアプリケーション

## 🚀 機能

### 基本機能
- **収入管理**: 月収や給与の記録と管理
- **扶養制限チェック**: 103万円、130万円、150万円の制限との比較
- **リアルタイム計算**: 現在の収入状況の即座な反映

### 新機能 (v2.0)
- **勤務時間管理**: 時給と勤務時間から収入を自動計算
- **扶養超過シミュレーション**: 現在のペースから超過時期を予測
- **収入予測**: 成長率を考慮した将来収入の予測
- **キャリアアドバイス**: 収入向上と扶養制限のバランス提案

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15.5.2
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand
- **グラフ**: Chart.js + react-chartjs-2
- **アイコン**: Heroicons
- **日付処理**: dayjs

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── income/            # 収入入力ページ
│   ├── onboarding/        # 初回設定ページ
│   ├── prediction/        # 収入予測ページ
│   ├── profile/           # マイページ
│   ├── schedule/          # 勤務管理ページ
│   ├── simulation/        # シミュレーションページ
│   └── page.tsx           # ホームページ
├── components/ui/         # 共通UIコンポーネント
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── HelpToggle.tsx
│   ├── IncomePrediction.tsx
│   ├── LoadingSpinner.tsx
│   ├── ProgressBar.tsx
│   ├── SimulationChart.tsx
│   ├── StatCard.tsx
│   └── StepIndicator.tsx
├── constants/             # 定数定義
│   ├── helpContent.ts
│   ├── limits.ts
│   └── options.ts
├── lib/                   # ビジネスロジック
│   ├── rules.ts          # 計算ロジック
│   ├── store.ts          # 状態管理
│   └── utils.ts          # ユーティリティ
└── types/                 # 型定義
    └── index.ts
```

## 🚀 セットアップ

### 前提条件
- Node.js 18.0.0以上
- npm または yarn

### インストール
```bash
# リポジトリのクローン
git clone https://github.com/Shun861/money-student-yeah.git
cd money-student-yeah

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## Supabase: profiles テーブルとRLSのセットアップ（Issue #18）

1. Supabase のプロジェクトを用意し、SQL Editor を開く
2. `docs/sql/profiles.sql` の内容を貼り付けて実行
    - `public.profiles` 作成
    - RLS 有効化とポリシー（select/insert/update 自分のみ）
    - `auth.users` への insert トリガーで `profiles` 自動作成
3. 動作確認
    - サインアップ → `public.profiles` に該当ユーザーの行が自動作成
    - 認証後のAPI/クライアントから自分の row のみ取得/更新可能

注意: 本番適用時は必要に応じてカラムを拡張し、マイグレーション管理（例: `supabase/migrations`）への移行を検討してください。

### 環境変数
Next.js 側で以下が必要です。

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

APIルート（/api/profile）はSSRのSupabaseクライアントでCookieベースのセッションを使用します。ログイン連携（Issue #9）後に動作します。

## Auth 配線（Issue #19）

- 依存: `@supabase/supabase-js`, `@supabase/ssr`
- クライアント: `src/lib/supabaseClient.ts`
- サーバ: `src/lib/supabaseServer.ts`（Cookie連携済み）
- 環境変数チェック: `src/lib/env.ts`
- 雛形: `.env.example`

動作確認（最小）:
- 任意のServer ComponentやAPI Route内で `createSupabaseServerClient().auth.getUser()` がエラーなく実行でき、未ログイン時は401などのハンドリングが行えること。
```

### ビルド
```bash
# 本番ビルド
npm run build

# 本番サーバーの起動
npm start
```

## 📊 主要機能の詳細

### 1. 勤務時間管理 (`/schedule`)
- **定期勤務スケジュール**: 週間/月間勤務時間と時給の設定
- **個別シフト**: 日別の勤務時間と収入の記録
- **収入サマリー**: 自動計算された収入の表示

### 2. 扶養超過シミュレーション (`/simulation`)
- **予測グラフ**: 月別累積収入と扶養制限の比較
- **カスタムシミュレーション**: 任意の月収での予測
- **詳細分析**: 各制限との比較と推奨アクション

### 3. 収入予測 (`/prediction`)
- **成長率設定**: 月次成長率の調整
- **予測期間**: 1-24ヶ月の予測期間設定
- **キャリアアドバイス**: 収入向上のヒント

## 🎯 使用例

### 学生Aの場合
1. **基本情報入力**: 生年月日、在学区分、居住地を設定
2. **勤務情報登録**: 週20時間、時給1,200円のアルバイトを登録
3. **収入確認**: 月収約103,920円が自動計算される
4. **シミュレーション**: 扶養制限内で安定していることを確認

### 学生Bの場合（掛け持ち）
1. **複数勤務先登録**: バイトA（週15時間、時給1,000円）、バイトB（週10時間、時給1,500円）
2. **収入予測**: 月収約108,000円で扶養制限を超える可能性
3. **対策検討**: 勤務時間の調整や扶養制限の変更を検討

## 🔧 開発

### コード品質
- **TypeScript**: 厳密な型チェック
- **ESLint**: コード品質の維持
- **Prettier**: コードフォーマット

### テスト
```bash
# 型チェック
npm run type-check

# リント
npm run lint
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

問題や質問がある場合は、GitHubのIssuesでお知らせください。
