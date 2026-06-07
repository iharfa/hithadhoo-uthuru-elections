// Optional local Playwright test. It is not part of Vercel install or build.
// To run locally: npm i -D @playwright/test && npx playwright install chromium && npm run dev, then npm run test:labels
import { test, expect } from '@playwright/test';

test('chart text labels do not overlap', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await page.waitForSelector('#voteShareChart svg');
  const overlaps = await page.evaluate(() => {
    const labels = [...document.querySelectorAll('#voteShareChart svg text, #turnoutChart svg text')]
      .map(el => el.getBoundingClientRect())
      .filter(rect => rect.width > 0 && rect.height > 0)
      .map(rect => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }));
    const hits = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i];
        const b = labels[j];
        const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if (xOverlap > 2 && yOverlap > 2) hits.push([i, j]);
      }
    }
    return hits;
  });
  expect(overlaps).toEqual([]);
});
