
import { test, expect } from '@playwright/test';

// Mock Data
const MOCK_PROFILE = {
    id: "aff_123",
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    code: "TEST1234",
    status: "active",
    role: "member",
    balance: 500,
    total_earnings: 1000
};

const MOCK_STATS = {
    period: "最近 7 天",
    totalClicks: 150,
    totalConversions: 5,
    totalRevenue: 5000,
    totalCommission: 500,
    linkStats: {
        "link_1": { clicks: 100, conversions: 3, revenue: 3000, commission: 300 },
        "link_2": { clicks: 50, conversions: 2, revenue: 2000, commission: 200 }
    },
    trend: [
        { date: "2024-01-01", clicks: 10, conversions: 1, revenue: 1000, commission: 100 },
        { date: "2024-01-02", clicks: 20, conversions: 0, revenue: 0, commission: 0 }
    ]
};

const MOCK_LINKS = {
    links: [
        { id: "link_1", name: "Link A", code: "code_a", url: "http://example.com", clicks: 100, conversions: 3, createdAt: "2024-01-01T00:00:00Z" },
        { id: "link_2", name: "Link B", code: "code_b", url: "http://google.com", clicks: 50, conversions: 2, createdAt: "2024-01-02T00:00:00Z" }
    ]
};

const MOCK_ORDERS = {
    summary: { totalOrders: 5, totalValue: 5000, totalCommission: 500, pendingCommission: 0 },
    orders: [
        { id: "ord_1", linkName: "Link A", orderValue: 1000, commission: 100, status: "confirmed", createdAt: "2024-01-01T10:00:00Z" }
    ]
};

test.describe('Affiliate Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Auth
        await page.route('**/api/affiliate/me', async route => {
            await route.fulfill({ json: MOCK_PROFILE });
        });
    });

    test('Dashboard loads and displays correct stats', async ({ page }) => {
        // Mock Data APIs
        await page.route('**/api/affiliate/stats*', async route => {
            await route.fulfill({ json: MOCK_STATS });
        });
        await page.route('**/api/affiliate/links', async route => {
            await route.fulfill({ json: MOCK_LINKS });
        });
        await page.route('**/api/affiliate/orders', async route => {
            await route.fulfill({ json: MOCK_ORDERS });
        });

        await page.goto('/tw/affiliate');

        // 1. Check Data Cards
        await expect(page.locator('text=總點擊數')).toBeVisible();
        await expect(page.locator('text=150')).toBeVisible(); // Total Clicks

        await expect(page.locator('text=總轉換數')).toBeVisible();
        await expect(page.locator('text=整體轉換率：3.3%')).toBeVisible(); // 5/150 = 3.3%

        await expect(page.locator('text=總營收')).toBeVisible();
        await expect(page.locator('text=$5000')).toBeVisible();

        // 2. Check Charts (Trend Table)
        // Fix: Scope to "Daily Trend" section to avoid strict mode errors with duplicate "1月1日" text
        const trendSection = page.locator('div').filter({ has: page.locator('h3', { hasText: '每日趨勢分析' }) }).last();
        const trendTable = trendSection.locator('table');

        await expect(trendSection).toBeVisible();
        // Check specific row data in the scoped table. Use exact:false to match fuzzy text if needed.
        await expect(trendTable.getByRole('cell', { name: '1月1日', exact: false }).first()).toBeVisible();
        await expect(trendTable.getByRole('cell', { name: '$1000.00' }).first()).toBeVisible();
    });

    test('Empty state displays correctly', async ({ page }) => {
        // Mock Empty Data
        await page.route('**/api/affiliate/stats*', async route => {
            await route.fulfill({ json: { ...MOCK_STATS, totalClicks: 0, totalConversions: 0, totalRevenue: 0, totalCommission: 0, linkStats: {}, trend: [] } });
        });
        await page.route('**/api/affiliate/links', async route => {
            await route.fulfill({ json: { links: [] } });
        });
        await page.route('**/api/affiliate/orders', async route => {
            await route.fulfill({ json: { summary: {}, orders: [] } });
        });

        await page.goto('/tw/affiliate');

        // Check Data Cards are zero (not NaN)
        await expect(page.locator('text=總點擊數').locator('..').locator('.text-2xl')).toHaveText('0');

        // Check Empty State Messages
        await expect(page.locator('text=在選定日期範圍內沒有連結活動')).toBeVisible();
        await expect(page.locator('text=尚未有透過聯盟連結產生的訂單')).toBeVisible();
    });

    // Skipped: The Link Management page is Server-Side Protected.
    // Playwright in this environment cannot bypass SSR auth without real tokens.
    // To test this, we would need to run against a fully authed local env or use E2E auth flows.
    test.skip('Link Management: Copy and Generate', async ({ page }) => {
        // Mock Links for Links Page
        await page.route('**/api/affiliate/links', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({ json: MOCK_LINKS });
            } else if (route.request().method() === 'POST') {
                // Mock creation success
                await new Promise(r => setTimeout(r, 500)); // Simulate loading
                await route.fulfill({ status: 200, json: { success: true } });
            }
        });

        await page.goto('/tw/affiliate/links');

        // 1. Test Copy Link
        // Setup alert listener
        let alertMessage = '';
        page.on('dialog', async dialog => {
            alertMessage = dialog.message();
            await dialog.accept();
        });

        await expect(page.getByRole('heading', { name: '我的推廣連結' })).toBeVisible();

        const copyBtns = page.getByRole('button', { name: '複製連結' });
        if (await copyBtns.count() > 0) {
            await expect(copyBtns.first()).toBeVisible();
            await copyBtns.first().click();
            expect(alertMessage).toBe('連結已複製到剪貼簿');
        }

        // 2. Test Generate Link
        await page.fill('input#linkName', 'New E2E Link');
        await page.fill('input#targetUrl', 'https://example.com/product');

        const createBtn = page.getByRole('button', { name: '創建推廣連結' });
        await createBtn.click();

        await expect(page.getByRole('button', { name: '創建中...' })).toBeVisible();
        await expect(page.getByRole('button', { name: '創建推廣連結' })).toBeVisible();
    });
});
