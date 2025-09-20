import { test, expect, type BrowserContext } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3100';

async function setState(context: BrowserContext, { auth, onboarded }: { auth: boolean; onboarded: boolean }) {
  await context.addCookies([
    { name: 'e2e-auth', value: auth ? '1' : '0', url: BASE_URL },
    { name: 'e2e-onboarded', value: onboarded ? '1' : '0', url: BASE_URL },
  ]);
}

test.describe('Performance Tests', () => {
  test('logout should complete within 3 seconds', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/dashboard');
    
    const startTime = Date.now();
    
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    await page.getByRole('button', { name: /logout|ログアウト/i }).click();
    
    await expect(page).toHaveURL(/\/login$/);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000); // 3秒以内
    console.log(`Logout completed in ${duration}ms`);
  });

  test('account deletion should complete within 10 seconds', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // 成功レスポンスをモック
    await page.route('**/api/account/delete', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          message: 'Account successfully deleted',
          deletedData: {
            user_id: 'test-user-id',
            deleted_at: new Date().toISOString(),
            total_records: 100 // 大量データをシミュレート
          }
        })
      });
    });
    
    const startTime = Date.now();
    
    // 削除フローを実行
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // 完了まで待機
    await expect(page).toHaveURL(/\/login$/);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(10000); // 10秒以内
    console.log(`Account deletion completed in ${duration}ms`);
  });

  test('page loading should be fast', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    
    const pages = ['/dashboard', '/profile', '/settings', '/income'];
    
    for (const pagePath of pages) {
      const startTime = Date.now();
      
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // 2秒以内
      console.log(`${pagePath} loaded in ${duration}ms`);
    }
  });

  test('sidebar toggle should be responsive', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/dashboard');
    
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      // サイドバーを開く
      await page.getByRole('button', { name: /menu|メニュー/i }).click();
      await expect(page.getByRole('button', { name: /logout|ログアウト/i })).toBeVisible();
      
      // サイドバーを閉じる
      await page.click('body', { position: { x: 350, y: 400 } });
      await expect(page.getByRole('button', { name: /logout|ログアウト/i })).not.toBeVisible();
      
      const endTime = Date.now();
      times.push(endTime - startTime);
    }
    
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    expect(averageTime).toBeLessThan(500); // 平均500ms以内
    expect(maxTime).toBeLessThan(1000); // 最大1秒以内
    
    console.log(`Sidebar toggle - Average: ${averageTime}ms, Max: ${maxTime}ms`);
  });

  test('form validation should be immediate', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    const startTime = Date.now();
    
    // 入力フィールドの変更
    await page.getByPlaceholder(/パスワードを入力してください/).fill('test');
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    
    // バリデーション結果の確認（ボタンが無効化される）
    await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeDisabled();
    
    // 正しいパスワードに変更
    await page.getByPlaceholder(/パスワードを入力してください/).fill('testpassword123');
    
    // バリデーション結果の確認（ボタンが有効化される）
    await expect(page.getByRole('button', { name: /最終確認へ/ })).toBeEnabled();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // 1秒以内
    console.log(`Form validation completed in ${duration}ms`);
  });

  test('UI response time should be reasonable', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');
    
    // UI更新時間のみを測定（APIはモック）
    const uiTimes: number[] = [];
    
    await page.route('**/api/account/delete', async (route) => {
      // 実際のAPIレスポンスをシミュレート
      // API応答時間はモックなので測定しない（モックの応答時間は実際のAPI性能を反映しないため、システム状況によって変動します）
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'パスワードが正しくありません。' })
      });
    });
    
    // 複数回APIを呼び出してUI更新時間を測定
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /アカウントを削除/ }).click();
      await page.getByRole('button', { name: /理解しました - 続行/ }).click();
      await page.getByPlaceholder(/パスワードを入力してください/).fill('wrongpassword');
      await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
      await page.getByRole('button', { name: /最終確認へ/ }).click();
      
      const uiStartTime = Date.now();
      await page.getByRole('button', { name: /アカウントを削除/ }).click();
      
      // エラーメッセージが表示されるまで待機してUI更新時間を記録
      await expect(page.getByText(/パスワードが正しくありません/)).toBeVisible();
      const uiEndTime = Date.now();
      uiTimes.push(uiEndTime - uiStartTime);
      
      // フォームをリセット
      await page.getByRole('button', { name: /キャンセル/ }).click();
    }
    
    const averageUiTime = uiTimes.reduce((a, b) => a + b, 0) / uiTimes.length;
    const maxUiTime = Math.max(...uiTimes);
    
    // API応答時間のアサーションは省略（モック応答のため意味がない）
    // 実際のAPI性能テストは統合テストまたは本番環境で実施
    expect(averageUiTime).toBeLessThan(1000); // UI更新は平均1秒以内
    expect(maxUiTime).toBeLessThan(2000); // UI更新は最大2秒以内
    
    // API応答時間はモックのため測定対象外
    console.log(`UI update - Average: ${averageUiTime}ms, Max: ${maxUiTime}ms`);
  });

  test('concurrent user simulation', async ({ browser }) => {
    // 複数のユーザーセッションをシミュレート
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    const startTime = Date.now();
    
    // 全ユーザーが同時にログアウト
    await Promise.all(
      pages.map(async (page, index) => {
        await setState(page.context(), { auth: true, onboarded: true });
        await page.goto('/dashboard');
        
        await page.getByRole('button', { name: /menu|メニュー/i }).click();
        await page.getByRole('button', { name: /logout|ログアウト/i }).click();
        
        await expect(page).toHaveURL(/\/login$/);
      })
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000); // 5秒以内
    console.log(`Concurrent logout completed in ${duration}ms`);
    
    // クリーンアップ
    await Promise.all(contexts.map(context => context.close()));
  });

  test('memory usage should be stable', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    
    // 繰り返し操作でメモリリークがないかチェック
    for (let i = 0; i < 20; i++) {
      await page.goto('/dashboard');
      await page.goto('/settings');
      await page.goto('/profile');
      await page.goto('/income');
      
      // ガベージコレクションを促す
      // 注意: window.gc()はChromeが--expose-gcフラグ付きで起動された場合のみ利用可能
      // CI環境で利用する場合はPlaywright設定でlaunchOptionsにargs: ['--expose-gc']を追加
      await page.evaluate(() => {
        const windowWithGc = window as Window & { gc?: () => void };
        if (windowWithGc.gc) {
          windowWithGc.gc();
        }
      });
    }
    
    // メモリ使用量を取得（可能な場合）
    const memoryInfo = await page.evaluate(() => {
      const performanceWithMemory = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };
      return performanceWithMemory.memory ? {
        usedJSHeapSize: performanceWithMemory.memory.usedJSHeapSize,
        totalJSHeapSize: performanceWithMemory.memory.totalJSHeapSize,
        jsHeapSizeLimit: performanceWithMemory.memory.jsHeapSizeLimit
      } : null;
    });
    
    if (memoryInfo) {
      const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      expect(memoryUsagePercent).toBeLessThan(50); // 50%未満
      console.log(`Memory usage: ${memoryUsagePercent.toFixed(2)}%`);
    }
  });
});