import { test, expect, type BrowserContext } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3100';

async function setState(context: BrowserContext, { auth, onboarded }: { auth: boolean; onboarded: boolean }) {
  await context.addCookies([
    { name: 'e2e-auth', value: auth ? '1' : '0', url: BASE_URL },
    { name: 'e2e-onboarded', value: onboarded ? '1' : '0', url: BASE_URL },
  ]);
}

test.describe('Integration Tests', () => {
  test('should maintain navigation consistency across pages', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    
    const pages = ['/dashboard', '/profile', '/settings', '/income'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // サイドバーが存在することを確認
      await expect(page.getByRole('button', { name: /menu|メニュー/i })).toBeVisible();
      
      // サイドバーを開いて全ナビゲーションリンクが存在することを確認
      await page.getByRole('button', { name: /menu|メニュー/i }).click();
      
      await expect(page.getByRole('link', { name: /ダッシュボード|ホーム/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /プロフィール/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /設定/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /収入/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
      
      // サイドバーを閉じる
      await page.click('body', { position: { x: 350, y: 400 } });
    }
  });

  test('should handle authentication flow correctly', async ({ page, context }) => {
    // 未認証状態での保護されたページアクセス
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login$/);
    
    // 認証後のリダイレクト
    await setState(context, { auth: true, onboarded: false });
    await page.goto('/');
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/onboarding$/);
    
    // オンボーディング完了後のアクセス
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/');
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings$/);
  });

  test('should maintain session state across navigation', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    
    // 各ページを順番に訪問
    await page.goto('/dashboard');
    await expect(page.getByText(/ダッシュボード|収入管理/)).toBeVisible();
    
    await page.goto('/profile');
    await expect(page.getByText(/プロフィール|ユーザー情報/)).toBeVisible();
    
    await page.goto('/income');
    await expect(page.getByText(/収入記録|収入管理/)).toBeVisible();
    
    await page.goto('/settings');
    await expect(page.getByText(/設定|アカウント/)).toBeVisible();
    
    // 最後にログアウトして認証状態が正しくクリアされることを確認
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    await page.getByRole('button', { name: /logout|ログアウト/i }).click();
    
    await expect(page).toHaveURL(/\/login$/);
    
    // ログアウト後に保護されたページにアクセスできないことを確認
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should handle concurrent operations gracefully', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // アカウント削除フローを開始
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // 並行してページナビゲーションを行う
    const navigationPromise = page.goto('/dashboard');
    
    // 削除フォームが適切にクリアされるか確認
    await navigationPromise;
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // 設定ページに戻って削除フローがリセットされていることを確認
    await page.goto('/settings');
    await expect(page.getByText(/上記のリスクを理解し/)).not.toBeVisible();
  });

  test('should handle browser back/forward correctly', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    
    // ページ履歴を作成
    await page.goto('/dashboard');
    await page.goto('/profile');
    await page.goto('/settings');
    
    // 戻るボタンをテスト
    await page.goBack();
    await expect(page).toHaveURL(/\/profile$/);
    
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);
    
    // 進むボタンをテスト
    await page.goForward();
    await expect(page).toHaveURL(/\/profile$/);
    
    // 認証が維持されていることを確認
    await expect(page.getByRole('button', { name: /menu|メニュー/i })).toBeVisible();
  });

  test('should handle form state persistence', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // アカウント削除フォームの状態をテスト
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    // フォームに入力
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウント');
    
    // 他のページに移動
    await page.goto('/dashboard');
    
    // 設定ページに戻る
    await page.goto('/settings');
    
    // フォームがリセットされていることを確認
    await expect(page.getByText(/上記のリスクを理解し/)).not.toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const device of devices) {
    test(`should work correctly on ${device.name}`, async ({ page, context }) => {
      await page.setViewportSize({ width: device.width, height: device.height });
      await setState(context, { auth: true, onboarded: true });
      
      await page.goto('/settings');
      
      // ページが正しく表示されることを確認
      await expect(page.getByText(/設定|アカウント/)).toBeVisible();
      
      // サイドバーメニューの動作確認
      await page.getByRole('button', { name: /menu|メニュー/i }).click();
      await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
      
      // アカウント削除フローの動作確認
      await page.click('body', { position: { x: device.width - 50, y: 400 } }); // サイドバーを閉じる
      await page.getByRole('button', { name: /アカウントを削除/ }).click();
      await expect(page.getByText(/上記のリスクを理解し/)).toBeVisible();
      
      // フォーム入力の確認
      await page.getByRole('button', { name: /理解しました - 続行/ }).click();
      await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
      await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
      
      await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeEnabled();
      
      // ログアウト機能の確認
      await page.getByRole('button', { name: /戻る/ }).click();
      await page.getByRole('button', { name: /キャンセル/ }).click();
      
      await page.getByRole('button', { name: /menu|メニュー/i }).click();
      await page.getByRole('button', { name: /logout|ログアウト/i }).click();
      
      await expect(page).toHaveURL(/\/login$/);
    });
  }

  test('should handle touch interactions on mobile', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // タッチイベントのシミュレート
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
    
    // スワイプでサイドバーを閉じる
    await page.evaluate(() => {
      const event = new TouchEvent('touchstart', {
        touches: [{ clientX: 300, clientY: 400 } as Touch]
      });
      document.dispatchEvent(event);
    });
    
    await page.tap('body', { position: { x: 350, y: 400 } });
    await expect(page.getByRole('button', { name: /logout|ログアウト/i })).not.toBeVisible();
  });

  test('should maintain accessibility on all screen sizes', async ({ page, context }) => {
    const sizes = [
      { width: 320, height: 568 }, // iPhone 5
      { width: 768, height: 1024 }, // iPad
      { width: 1200, height: 800 }  // Desktop
    ];

    for (const size of sizes) {
      await page.setViewportSize(size);
      await setState(context, { auth: true, onboarded: true });
      await page.goto('/settings');
      
      // フォーカス可能な要素の確認
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
      
      // キーボードナビゲーション
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // メニューボタンをEnterで開く
      
      await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
      
      // Escapeでサイドバーを閉じる
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: /logout|ログアウト/i })).not.toBeVisible();
    }
  });
});

test.describe('Error Handling Integration', () => {
  test('should recover from network failures gracefully', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // ネットワーク障害をシミュレート
    await page.route('**/*', route => route.abort('internetdisconnected'));
    
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // エラー処理されることを確認
    await expect(page.getByText(/削除に失敗しました/)).toBeVisible();
    
    // ネットワーク復旧をシミュレート
    await page.unroute('**/*');
    
    // 再試行が可能であることを確認
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await expect(page.getByText(/削除中/)).toBeVisible();
  });

  test('should maintain data consistency on errors', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // 部分的な失敗をシミュレート
    await page.route('**/api/account/delete', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // エラーメッセージが表示される
    await expect(page.getByText(/Internal server error/)).toBeVisible();
    
    // セッションが維持されていることを確認
    await page.goto('/dashboard');
    await expect(page.getByText(/ダッシュボード/)).toBeVisible();
    
    // 設定ページに戻って再試行可能
    await page.goto('/settings');
    await expect(page.getByRole('button', { name: /アカウントを削除/ })).toBeVisible();
  });
});