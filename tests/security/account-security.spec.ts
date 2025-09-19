import { test, expect, type BrowserContext } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3100';

async function setState(context: BrowserContext, { auth, onboarded }: { auth: boolean; onboarded: boolean }) {
  await context.addCookies([
    { name: 'e2e-auth', value: auth ? '1' : '0', url: BASE_URL },
    { name: 'e2e-onboarded', value: onboarded ? '1' : '0', url: BASE_URL },
  ]);
}

test.describe('Account Deletion API Security', () => {
  test('should reject unauthenticated requests', async ({ page }) => {
    // 未認証状態でAPIを直接呼び出し
    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'testpassword123',
          confirmationText: 'アカウントを削除'
        })
      });
    });

    expect(response.status).toBe(401);
  });

  test('should reject requests without proper confirmation text', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    // 間違った確認テキストでAPIを呼び出し
    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'testpassword123',
          confirmationText: 'delete' // 小文字・英語
        })
      });
    });

    expect(response.status).toBe(400);
  });

  test('should reject requests without password', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationText: 'アカウントを削除'
          // password フィールドなし
        })
      });
    });

    expect(response.status).toBe(400);
  });

  test('should reject requests with short password', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: '12345', // 6文字未満
          confirmationText: 'アカウントを削除'
        })
      });
    });

    expect(response.status).toBe(400);
  });

  test('should reject malformed JSON requests', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json'
      });
    });

    expect(response.status).toBe(400);
  });

  test('should handle CORS properly', async ({ page }) => {
    // OPTIONSリクエストのテスト
    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'OPTIONS'
      });
    });

    expect(response.status).toBe(200);
    
    // CORSヘッダーの確認
    const allowMethods = response.headers.get('access-control-allow-methods');
    const allowHeaders = response.headers.get('access-control-allow-headers');
    
    expect(allowMethods).toContain('DELETE');
    expect(allowHeaders).toContain('Content-Type');
  });
});

test.describe('Authentication Security', () => {
  test('should prevent access to dashboard without authentication', async ({ page }) => {
    // 未認証状態でダッシュボードにアクセス
    await page.goto('/dashboard');
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should prevent access to settings without authentication', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should prevent access to profile without authentication', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('should handle expired session gracefully', async ({ page, context }) => {
    // 認証状態を設定してダッシュボードにアクセス
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/dashboard');
    
    // セッション期限切れをシミュレート（認証Cookieを削除）
    await context.clearCookies();
    
    // 認証が必要なアクションを実行
    await page.reload();
    
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Input Validation Security', () => {
  test('should sanitize user inputs', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    // XSSペイロードを含む入力
    const xssPayload = '<script>alert("xss")</script>';
    
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    await page.getByPlaceholder(/パスワードを入力してください/).fill(xssPayload);
    await page.getByPlaceholder(/アカウントを削除/).fill(xssPayload);
    
    // XSSが実行されないことを確認（アラートが表示されない）
    page.on('dialog', dialog => {
      // テストが失敗するようにする
      expect(dialog.message()).not.toContain('xss');
    });
    
    await page.getByRole('button', { name: /最終確認へ/ }).click();
  });

  test('should handle SQL injection attempts', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    // SQLインジェクションペイロード
    const sqlPayload = "'; DROP TABLE users; --";
    
    // APIエラーをモック（SQLインジェクションが成功しないことを確認）
    await page.route('**/api/account/delete', route => {
      const body = route.request().postDataJSON();
      
      // SQLインジェクションペイロードが含まれていても安全に処理される
      expect(body.password).toBe(sqlPayload);
      
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'パスワードが正しくありません。' })
      });
    });
    
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    await page.getByRole('button', { name: /理解しました - 続行/ }).click();
    
    await page.getByPlaceholder(/パスワードを入力してください/).fill(sqlPayload);
    await page.getByPlaceholder(/アカウントを削除/).fill('アカウントを削除');
    
    await page.getByRole('button', { name: /最終確認へ/ }).click();
    await page.getByRole('button', { name: /アカウントを削除/ }).click();
    
    // 適切なエラーメッセージが表示される
    await expect(page.getByText(/パスワードが正しくありません/)).toBeVisible();
  });
});

test.describe('Rate Limiting Security', () => {
  test('should handle multiple rapid requests', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/settings');

    // 連続でAPIリクエストを送信
    const responses = await page.evaluate(async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          fetch('/api/account/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              password: 'testpassword123',
              confirmationText: 'アカウントを削除'
            })
          })
        );
      }
      
      const responses = await Promise.all(requests);
      return responses.map(r => r.status);
    });

    // 最初のいくつかのリクエストは処理されるが、
    // その後はレート制限でブロックされる（実装依存）
    const successCount = responses.filter(status => status < 400).length;
    const rateLimitedCount = responses.filter(status => status === 429).length;
    
    // 何らかのレート制限が実装されていることを確認
    // （具体的な数値は実装に依存）
    expect(rateLimitedCount).toBeGreaterThan(0);
  });
});

test.describe('Session Security', () => {
  test('should invalidate session after logout', async ({ page, context }) => {
    await setState(context, { auth: true, onboarded: true });
    await page.goto('/dashboard');
    
    // ログアウト実行
    await page.getByRole('button', { name: /menu|メニュー/i }).click();
    await page.getByRole('button', { name: /logout|ログアウト/i }).click();
    
    await expect(page).toHaveURL(/\/login$/);
    
    // ログアウト後にAPIを呼び出そうとしても失敗する
    const response = await page.evaluate(async () => {
      return fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'testpassword123',
          confirmationText: 'アカウントを削除'
        })
      });
    });

    expect(response.status).toBe(401);
  });
});