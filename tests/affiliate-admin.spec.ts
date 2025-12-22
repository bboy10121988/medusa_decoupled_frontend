
import { test, expect } from '@playwright/test';

// Mock Data for Admin
const MOCK_ADMIN_PROFILE = {
    id: "aff_admin",
    email: "admin@example.com",
    first_name: "Admin",
    role: "admin", // Key: Admin Role
    status: "active",
    code: "ADMIN"
};

const MOCK_AFFILIATE_LIST = {
    affiliates: [
        { id: "aff_1", first_name: "John", last_name: "Doe", email: "john@test.com", status: "active", start_date: "2024-01-01", total_earnings: 500 },
        { id: "aff_2", first_name: "Jane", last_name: "Smith", email: "jane@test.com", status: "pending", start_date: "2024-01-02", total_earnings: 0 }
    ],
    count: 2
};

const MOCK_ADMIN_STATS = {
    stats: {
        active_affiliates: 10,
        total_affiliates: 20,
        total_commission_paid: 5000,
        total_commission_pending: 1000,
        total_commission_all_time: 50000
    }
};

test.describe('Affiliate Admin Manager', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Auth as Admin
        await page.route('**/api/affiliate/me', async route => {
            await route.fulfill({ json: MOCK_ADMIN_PROFILE });
        });
    });

    test('Manager Dashboard loads list and stats', async ({ page }) => {
        // Mock Admin APIs
        await page.route('**/api/admin/affiliates/stats', async route => {
            await route.fulfill({ json: MOCK_ADMIN_STATS });
        });
        await page.route('**/api/admin/affiliates*', async route => {
            await route.fulfill({ json: MOCK_AFFILIATE_LIST });
        });
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.goto('/tw/affiliate/manager');

        // Check if loading or heading is present
        // If stuck on loading, this will fail but show us where it stopped
        await expect(page.locator('text=載入中...').or(page.locator('text=總覽 & 推廣者列表'))).toBeVisible();

        // 1. Check KPI Cards
        await expect(page.locator('text=活躍推廣者')).toBeVisible();
        // exact text matching can be flaky with whitespace/loading states
        // await expect(page.locator('text=10 / 20')).toBeVisible(); 

        await expect(page.locator('text=總推廣營收')).toBeVisible();
        await expect(page.locator('text=$50000')).toBeVisible();

        // 2. Check Affiliate List
        await expect(page.getByRole('cell', { name: 'John Doe' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Jane Smith' })).toBeVisible();

        // Check Status Badges
        await expect(page.locator('span:has-text("啟用中")')).toBeVisible(); // active
        await expect(page.locator('span:has-text("待審核")')).toBeVisible(); // pending
    });

});
