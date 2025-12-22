
import { test, expect } from '@playwright/test';

test.describe('Affiliate Tracking Mechanism', () => {

    test('Accessing URL with ?ref parameter traces click and sets cookie', async ({ page }) => {

        // 1. Setup Request Interception for backend tracking
        let trackingRequestSent = false;
        await page.route('**/store/affiliates/links/click', async route => {
            trackingRequestSent = true;
            const postData = route.request().postDataJSON();
            expect(postData.code).toBe('TEST_REF'); // Verify the code sent
            expect(postData.metadata.affiliateRef).toBe('TEST_REF');

            // Mock success response
            await route.fulfill({ status: 200, json: { success: true } });
        });

        // 2. Visit the page with ref param
        // We use a random page like home or cart, ensuring country code is handled
        await page.goto('/tw?ref=TEST_REF');

        // 3. Verify Tracking Request was made
        // We might need to wait a small bit if it's fire-and-forget in middleware, 
        // but middleware runs *before* page load completes, so the request likely fires early.
        // However, the middleware uses `fetch` which might be awaited or not. 
        // In middleware.ts: fetch(...).catch(...) is NOT awaited. It's fire-and-forget.
        // Playwright route handler might miss it if it happens server-side (in Next.js Middleware runtime).

        // WAIT! Next.js Middleware runs on the SERVER (or Edge).
        // Playwright's page.route() intercepts BROWSER requests.
        // **CRITICAL**: Middleware fetch calls happen on the server, NOT the browser.
        // Playwright CANNOT intercept requests made by Next.js Middleware to the Backend.

        // Therefore, we can ONLY verify the **Cookie** on the client side.
        const cookies = await page.context().cookies();
        const refCookie = cookies.find(c => c.name === 'affiliate_ref');

        expect(refCookie).toBeDefined();
        expect(refCookie?.value).toBe('TEST_REF');

        // We can also verify the URL is cleaned (redirected)
        // Middleware logic: finalResponse = NextResponse.redirect(cleanUrl)
        await expect(page).not.toHaveURL(/ref=TEST_REF/);
    });

});
