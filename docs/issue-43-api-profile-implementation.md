# Issue #43: API Route実装完成 - Profile管理

## 問題の概要
`/api/profile/route.ts`が仮実装状態で、データベースとの同期が機能しておらず、プロフィール更新が永続化されません。

## 現在の状況
```typescript
export async function GET() {
  return NextResponse.json({ profile: null }); // 常にnullを返す
}

export async function PUT(req: Request) {
  return NextResponse.json({ success: true }); // 実際の更新処理なし
}
```

## 問題の影響
- データベースとの同期が機能しない
- プロフィール更新が永続化されない
- フロントエンドとバックエンドの分離が不完全

## 解決方針
1. **適切なSupabase連携**: サーバーサイドクライアントを使用したデータベース操作
2. **認証付きAPI**: ユーザー認証の確認とRLSポリシーの適用
3. **エラーハンドリング**: 適切なHTTPステータスコードとエラーレスポンス
4. **型安全性**: リクエスト/レスポンスの型定義

## 実装タスク
- [ ] `GET /api/profile`: ユーザープロフィール取得API実装
  - [ ] ユーザー認証確認
  - [ ] Supabaseからプロフィールデータ取得
  - [ ] 適切なエラーハンドリング
- [ ] `PUT /api/profile`: プロフィール更新API実装
  - [ ] リクエストボディのバリデーション
  - [ ] データベース更新処理
  - [ ] `onboarding_completed`フラグの更新
- [ ] `POST /api/profile`: 新規プロフィール作成API実装
- [ ] API型定義の作成 (`src/types/api.ts`)
- [ ] エラーレスポンスの標準化
- [ ] APIドキュメント作成

## 関連ファイル
- `src/app/api/profile/route.ts`
- `src/lib/supabaseServer.ts`
- `src/types/api.ts` (新規作成)
- `docs/sql/profiles.sql`

## テスト項目
- [ ] 認証されていないユーザーのアクセス拒否
- [ ] 適切なプロフィールデータの取得
- [ ] プロフィール更新の永続化確認
- [ ] 不正なリクエストの適切な拒否
- [ ] RLSポリシーの動作確認

## 優先度
**中** - データ永続化の基盤として重要

## 関連Issue
- #29 オンボーディング完了時のデータベース同期
- #42 プロフィール判定ロジックの統一化

## Parent Issue
- #40 潜在的問題調査レポート
