import { test, expect, type BrowserContext } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3100';

async function setState(context: BrowserContext, { auth, onboarded }: { auth: boolean; onboarded: boolean }) {
  await context.addCookies([
    { name: 'e2e-auth', value: auth ? '1' : '0', url: BASE_URL },
    { name: 'e2e-onboarded', value: onboarded ? '1' : '0', url: BASE_URL },
  ]);
}

test.describe('Logout functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // テストユーザーでログイン状態を設定
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/dashboard');
  });

  test('should successfully logout from sidebar', async ({ page }) => {
    // ダッシュボードが表示されることを確認
    await expect(page.getByText(/ダッシュボード|収入管理/)).toBeVisible();
    
    // サイドバーを開く
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    
    // ログアウトボタンを確認
    const logoutButton = page.getByRole('button', { name: /logout|ログアウト/i });
    await expect(logoutButton).toBeVisible();
    
    // ログアウト実行
    await logoutButton.click();
    
    // ローディング状態確認
    await expect(page.getByText(/ログアウト中/i)).toBeVisible();
    
    // ログインページへのリダイレクト確認
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /ログイン|新規登録/ })).toBeVisible();
    
    // 認証が必要なページへのアクセス確認
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should handle logout errors gracefully', async ({ page }) => {
    // ネットワークエラーをシミュレート（Supabaseの signout をモック）
    await page.route('**/auth/v1/logout**', route => {
      route.abort('failed');
    });
    
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    await page.getByRole('button', { name: /logout|ログアウト/i }).click();
    
    // エラーメッセージの確認
    await expect(page.getByText(/ログアウトに失敗しました/i)).toBeVisible();
    
    // ダッシュボードに留まることを確認
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // モバイルレイアウトでのメニューボタンをクリック
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    
    // サイドバーが表示されることを確認
    await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
    
    await page.getByRole('button', { name: /logout|ログアウト/i }).click();
    
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should close sidebar when clicking outside on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // サイドバーを開く
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
    
    // サイドバー外をクリック
    await page.click('body', { position: { x: 350, y: 400 } });
    
    // サイドバーが閉じることを確認
    await expect(page.getByRole('button', { name: /logout|ログアウト/i })).not.toBeVisible();
  });

  test('should logout from different dashboard pages', async ({ page }) => {
    const pages = ['/dashboard', '/profile', '/settings', '/income'];
    
    for (const pagePath of pages) {
      // 各ページに移動
      await page.goto(pagePath);
      
      // ページが表示されることを確認
      const response = await page.waitForLoadState('networkidle');
      
      // サイドバーを開いてログアウト
      await page.getByRole('button', { name: /menu|メニュー/i }).click();
      await page.getByRole('button', { name: /logout|ログアウト/i }).click();
      
      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login$/);
      
      // 次のテストのために再度ログイン状態を設定
      await setState(page.context(), { auth: true, onboarded: true });
    }
  });

  test('should prevent multiple logout clicks', async ({ page }) => {
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    
    const logoutButton = page.getByRole('button', { name: /logout|ログアウト/i });
    
    // 複数回クリック
    await logoutButton.click();
    await logoutButton.click();
    await logoutButton.click();
    
    // 1回だけ処理されることを確認（ボタンが無効化される）
    await expect(page.getByText(/ログアウト中/i)).toBeVisible();
    await expect(logoutButton).toBeDisabled();
    
    // 最終的にログインページにリダイレクト
    await expect(page).toHaveURL(/\/login$/);
  });
});