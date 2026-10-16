import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/states',
  '/states/meghalaya',
  '/packages',
  '/packages/tawang-circuit',
  '/festivals',
  '/permits',
  '/plan',
  '/search?q=tawang',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/cancellation',
];

for (const path of PAGES) {
  test(`${path} renders without console errors or horizontal scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('package filters update the URL', async ({ page }) => {
  await page.goto('/packages');
  await page.getByRole('button', { name: '9+ days' }).click();
  await expect(page).toHaveURL(/duration=long/);
  await expect(page.getByText('1 trip found')).toBeVisible();
});

test('festival month filter works', async ({ page }) => {
  await page.goto('/festivals');
  await page.getByRole('button', { name: 'December' }).click();
  await expect(page).toHaveURL(/month=12/);
  await expect(page.getByRole('heading', { name: 'Hornbill Festival' })).toBeVisible();
});

test('permit checker deep-links and links the right portal', async ({ page }) => {
  await page.goto('/permits?nationality=indian&state=nagaland');
  const link = page.getByRole('link', { name: /Official Nagaland portal/ });
  await expect(link).toHaveAttribute('href', /nagaland/);
});

test('budget planner per-person total updates', async ({ page }) => {
  await page.goto('/plan');
  const perPerson = page.getByTestId('budget-per-person');
  // Wait for the streamed planner to replace its prerendered placeholder.
  await expect(perPerson).toHaveCount(1);
  const before = await perPerson.textContent();
  await page.getByRole('button', { name: 'More travellers' }).click();
  await expect(perPerson).not.toHaveText(before ?? '');
});

test('search escapes hostile input', async ({ page }) => {
  await page.goto('/search?q=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
});

test('contact form validates on the server and shows field errors', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByText('Please fix the highlighted fields.')).toBeVisible();
  await expect(page.getByText('Please tell us your name')).toBeVisible();
});

test('footer legal links resolve', async ({ page }) => {
  const links = [
    ['Privacy', '/privacy', 'Privacy policy'],
    ['Terms', '/terms', 'Terms of use & booking'],
    ['Cancellation & refunds', '/cancellation', 'Cancellation & refunds'],
  ];
  for (const [name, path, heading] of links) {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
});
