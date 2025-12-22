
import { test, expect } from '@playwright/test';

test.describe('Affiliate Authentication UI', () => {

    test('Login Page loads correctly', async ({ page }) => {
        await page.goto('/tw/login-affiliate');

        // Check Title
        await expect(page.getByRole('heading', { name: '聯盟登入' })).toBeVisible();

        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: '登入' })).toBeVisible();

        // Check link to register
        await expect(page.getByText(/還不是聯盟夥伴/)).toBeVisible();
    });

    test('Register Page loads correctly', async ({ page }) => {
        await page.goto('/tw/affiliate/register');

        // Check Title
        await expect(page.getByRole('heading', { name: '申請成為聯盟夥伴' })).toBeVisible();

        // Check Form Inputs
        await expect(page.locator('input[name="displayName"]')).toBeVisible();
        await expect(page.locator('input[name="website"]')).toBeVisible();
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        // phone input removed from current register form? Checking register page again... 
        // It has displayName, website, email, password. No phone.
        // Removing phone check.

        // Check Submit Button
        await expect(page.getByRole('button', { name: '送出申請' })).toBeVisible();
    });

});
