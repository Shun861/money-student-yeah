import { test, expect, type BrowserContext } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3100';

async function setState(context: BrowserContext, { auth, onboarded }: { auth: boolean; onboarded: boolean }) {
  await context.addCookies([
    { name: 'e2e-auth', value: auth ? '1' : '0', url: BASE_URL },
    { name: 'e2e-onboarded', value: onboarded ? '1' : '0', url: BASE_URL },
  ]);
}

test.describe('Account deletion functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
  });

  test('should complete full account deletion flow', async ({ page }) => {
    // アカウント削除セクションの確認
    await expect(page.getByText(/アカウント削除/)).toBeVisible();
    await expect(page.getByText(/この操作は取り消せません/)).toBeVisible();
    
    // Step 1: 警告確認
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await expect(page.getByText(/上記のリスクを理解し/)).toBeVisible();
    
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // Step 2: パスワードと確認文字入力
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    
    // Step 3: 最終確認
    await expect(page.getByText(/本当にアカウントを削除しますか/)).toBeVisible();
    
    // 削除実行をモック（実際のテストでは削除しない）
    await page.route('**/api/account/delete', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          message: 'Account successfully deleted',
          deletedData: {
            user_id: 'test-user-id',
            deleted_at: new Date().toISOString(),
            total_records: 10
          }
        })
      });
    });
    
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // ローディング状態確認
    await expect(page.getByText(/削除中/)).toBeVisible();
    
    // 成功トーストメッセージの確認
    await expect(page.getByText(/アカウントが正常に削除されました/)).toBeVisible();
    
    // ログインページへのリダイレクト確認
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should prevent deletion with wrong password', async ({ page }) => {
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // 間違ったパスワードでAPIエラーをモック
    await page.route('**/api/account/delete', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'パスワードが正しくありません。' })
      });
    });
    
    await page.getByPlaceholder(/パスワードを入力してください/).fill('wrongpassword');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // エラーメッセージの確認
    await expect(page.getByText(/パスワードが正しくありません/)).toBeVisible();
    
    // 設定ページに留まることを確認
    await expect(page).toHaveURL(/\/settings$/);
  });

  test('should prevent deletion with wrong confirmation text', async ({ page }) => {
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('削除'); // 間違った確認文字
    
    // 最終確認ボタンが無効化されていることを確認
    await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeDisabled();
  });

  test('should allow cancellation at any step', async ({ page }) => {
    // Step 1でのキャンセル
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /キャンセル/ }).click();
    
    await expect(page.getByText(/上記のリスクを理解し/)).not.toBeVisible();
    
    // Step 2でのキャンセル
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    await page.getByRole('button', { name: /戻る/ }).click();
    
    await expect(page.getByText(/上記のリスクを理解し/)).toBeVisible();
  });

  test('should validate input requirements', async ({ page }) => {
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // パスワードが短すぎる場合
    await page.getByPlaceholder(/パスワードを入力してください/).fill('12345'); // 6文字未満
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    
    await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeDisabled();
    
    // 正しい長さのパスワードを入力
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    
    await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeEnabled();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // モバイルでの削除フロー
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await expect(page.getByText(/上記のリスクを理解し/)).toBeVisible();
    
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // モバイルでの入力フォーム
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    
    await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeEnabled();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // ネットワークエラーをシミュレート
    await page.route('**/api/account/delete', route => {
      route.abort('failed');
    });
    
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // エラーメッセージの確認
    await expect(page.getByText(/アカウント削除に失敗しました/)).toBeVisible();
  });

  test('should prevent multiple deletion attempts', async ({ page }) => {
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // 遅いAPIレスポンスをモック
    await page.route('**/api/account/delete', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Account successfully deleted' })
        });
      }, 2000);
    });
    
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    
    const deleteButton = page.getByRole('button', { name: /アカウントを削除/ });
    
    // 複数回クリック
    await deleteButton.click();
    await deleteButton.click();
    await deleteButton.click();
    
    // ローディング状態とボタン無効化の確認
    await expect(page.getByText(/削除中/)).toBeVisible();
    await expect(deleteButton).toBeDisabled();
  });

  test('should display proper warning messages', async ({ page }) => {
    // 削除警告の内容確認
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // 重要な警告内容が表示されることを確認
    await expect(page.getByText(/収入記録、勤務データが完全削除/)).toBeVisible();
    await expect(page.getByText(/プロフィール情報が完全削除/)).toBeVisible();
    await expect(page.getByText(/雇用者情報が完全削除/)).toBeVisible();
    await expect(page.getByText(/復元は一切不可能/)).toBeVisible();
  });
});