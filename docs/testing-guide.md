# アカウント管理機能テストスイート

## 概要

Issue #64: Phase 4 として実装した、アカウント管理機能（ログアウト・アカウント削除）の包括的なテストスイートです。

## テストカテゴリー

### 1. E2Eテスト (`tests/e2e/`)

#### ログアウト機能テスト (`logout.spec.ts`)
- ✅ サイドバーからの正常ログアウト
- ✅ ログアウトエラーハンドリング
- ✅ モバイルデバイス対応
- ✅ サイドバーUI操作
- ✅ 複数ページからのログアウト
- ✅ 重複クリック防止

#### アカウント削除機能テスト (`account-deletion.spec.ts`)
- ✅ 3ステップ削除フローの完全実行
- ✅ 不正パスワードによる削除防止
- ✅ 確認テキスト検証
- ✅ キャンセル機能
- ✅ 入力バリデーション
- ✅ モバイル対応
- ✅ APIエラーハンドリング
- ✅ 重複実行防止
- ✅ 警告メッセージ表示

### 2. セキュリティテスト (`tests/security/`)

#### API セキュリティ (`account-security.spec.ts`)
- ✅ 未認証リクエストの拒否
- ✅ 不正確認テキストの拒否
- ✅ パスワード検証
- ✅ 不正JSON拒否
- ✅ CORS設定確認

#### 認証セキュリティ
- ✅ 未認証時の保護ページアクセス制御
- ✅ セッション期限切れハンドリング

#### 入力検証セキュリティ
- ✅ XSS攻撃対策
- ✅ SQLインジェクション対策

#### レート制限
- ✅ 連続リクエスト制限

#### セッションセキュリティ
- ✅ ログアウト後のセッション無効化

### 3. パフォーマンステスト (`tests/performance/`)

#### 処理時間測定 (`account-performance.spec.ts`)
- ✅ ログアウト: 3秒以内
- ✅ アカウント削除: 10秒以内
- ✅ ページロード: 2秒以内
- ✅ サイドバー操作: 平均500ms、最大1秒
- ✅ フォームバリデーション: 1秒以内
- ✅ API応答時間: 平均1秒、最大2秒

#### 並行性テスト
- ✅ 複数ユーザー同時ログアウト: 5秒以内
- ✅ メモリ使用量安定性: 50%未満

### 4. 統合テスト (`tests/integration/`)

#### システム統合 (`account-integration.spec.ts`)
- ✅ ナビゲーション一貫性
- ✅ 認証フロー統合
- ✅ セッション状態管理
- ✅ 並行操作処理
- ✅ ブラウザ履歴対応
- ✅ フォーム状態管理

#### レスポンシブデザイン
- ✅ iPhone SE (375×667)
- ✅ iPad (768×1024)
- ✅ iPad Pro (1024×1366)
- ✅ Desktop (1920×1080)
- ✅ タッチ操作対応
- ✅ アクセシビリティ

#### エラー処理統合
- ✅ ネットワーク障害復旧
- ✅ データ整合性保持

## テスト実行方法

### 個別テスト実行

```bash
# ログアウトE2Eテスト
npm run test:e2e:logout

# アカウント削除E2Eテスト
npm run test:e2e:account-deletion

# セキュリティテスト
npm run test:security

# パフォーマンステスト
npm run test:performance

# 統合テスト
npm run test:integration
```

### 包括的テスト実行

```bash
# アカウント管理機能全テスト
npm run test:account-management

# 全E2Eテスト
npm run test:e2e

# テストレポート表示
npm run test:report
```

## CI/CDパイプライン

### GitHub Actions (`.github/workflows/test-account-management.yml`)

#### 自動実行トリガー
- Pull Request時（関連ファイル変更）
- main/feature ブランチへのpush

#### テストジョブ
1. **test-account-management**: Node.js 18/20マトリックス実行
2. **security-audit**: 脆弱性監査
3. **lint-and-type-check**: コード品質チェック
4. **performance-benchmark**: パフォーマンス測定
5. **accessibility-check**: アクセシビリティ検証
6. **test-summary**: 結果サマリー

#### 成果物
- Playwrightレポート (7日保持)
- テストビデオ (3日保持)
- パフォーマンス結果 (30日保持)

## 品質基準

### 機能テスト ✅
- [x] 全ての正常フローが動作
- [x] 全エラーケースの適切なハンドリング
- [x] レスポンシブデザイン対応
- [x] アクセシビリティ要件充足

### セキュリティテスト ✅
- [x] 未認証アクセスのブロック
- [x] CSRF攻撃防御
- [x] レート制限機能
- [x] データ削除完全性

### パフォーマンステスト ✅
- [x] ログアウト処理 < 3秒
- [x] アカウント削除処理 < 10秒
- [x] 大量データ安定動作
- [x] 同時アクセス正常動作

### 統合テスト ✅
- [x] 既存機能への影響なし
- [x] middleware連携正常
- [x] 認証フロー整合性
- [x] データ整合性保持

## 技術スタック

- **E2Eテスト**: Playwright
- **テストランナー**: Playwright Test
- **CI/CD**: GitHub Actions
- **レポート**: Playwright HTML Reporter
- **デバイステスト**: Playwright Device Emulation
- **アクセシビリティ**: axe-core

## メンテナンス

### 新機能追加時
1. 対応するテストケースを追加
2. CI/CDパイプラインで自動実行確認
3. パフォーマンス基準の見直し

### テスト更新
1. UI変更時のセレクター更新
2. 新しいデバイス対応追加
3. セキュリティ要件変更対応

## トラブルシューティング

### よくある問題

1. **テストの不安定性 (Flaky Tests)**
   - `waitForLoadState('networkidle')` の使用
   - 適切な待機条件設定
   - タイムアウト調整

2. **セレクターエラー**
   - ロール・名前ベースセレクター優先
   - 国際化対応（日本語/英語）
   - フォールバック戦略

3. **パフォーマンステスト変動**
   - 実行環境による差異考慮
   - 複数回実行での平均値使用
   - 閾値の適切な設定

### デバッグ方法

```bash
# ヘッドフル実行（UI表示）
npx playwright test --headed

# デバッグモード
npx playwright test --debug

# 特定テスト実行
npx playwright test tests/e2e/logout.spec.ts --headed

# レポート確認
npx playwright show-report
```

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**最終更新**: 2025年9月19日  
**担当者**: GitHub Copilot  
**Issue**: [#64 Phase 4: 全機能のテスト・検証とE2E統合](https://github.com/Shun861/money-student-yeah/issues/64)