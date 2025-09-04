import { test, expect } from '@playwright/test'

// These tests focus on middleware redirects. They assume no auth session in browser context.

test('unauthenticated user is redirected to /login from protected page', async ({ page }) => {
  const res = await page.goto('/profile')
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: /ログイン|新規登録/ })).toBeVisible()
})

test('logged in but un-onboarded user is redirected to /onboarding', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2e-auth', value: '1', domain: 'localhost', path: '/' },
    { name: 'e2e-onboarded', value: '0', domain: 'localhost', path: '/' },
  ])
  const res = await page.goto('/profile')
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/onboarding$/)
})

test('onboarded user accessing /login is redirected to /profile', async ({ page, context }) => {
  await context.addCookies([
    { name: 'e2e-auth', value: '1', domain: 'localhost', path: '/' },
    { name: 'e2e-onboarded', value: '1', domain: 'localhost', path: '/' },
  ])
  const res = await page.goto('/login')
  expect(res?.status()).toBeLessThan(400)
  await expect(page).toHaveURL(/\/profile$/)
})
