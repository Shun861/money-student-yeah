import { test, expect, type BrowserContext } from '@playwright/test'

// Middleware redirect tests (E2E simulation mode via cookies)
// NOTE: Some environments ignore domain-only cookie injection before first navigation with port.
// Using explicit URL binding for reliability.

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3100'

async function setState(context: BrowserContext, { auth, onboarded }: { auth: boolean; onboarded: boolean }) {
  await context.addCookies([
    { name: 'e2e-auth', value: auth ? '1' : '0', url: BASE_URL },
    { name: 'e2e-onboarded', value: onboarded ? '1' : '0', url: BASE_URL },
  ])
}

test('unauthenticated user is redirected to /login from protected page', async ({ page }) => {
  const res = await page.goto('/profile')
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: /ログイン|新規登録/ })).toBeVisible()
})

test('logged in but un-onboarded user is redirected to /onboarding', async ({ page, context }) => {
  await setState(context, { auth: true, onboarded: false })
  // Preflight to ensure cookies are attached
  await page.goto('/')
  const res = await page.goto('/profile')
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/onboarding$/)
})

test('onboarded user accessing /login is redirected to /profile', async ({ page, context }) => {
  await setState(context, { auth: true, onboarded: true })
  await page.goto('/')
  const res = await page.goto('/login')
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/profile$/)
})
