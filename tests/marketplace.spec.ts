import { expect, test, type Page } from '@playwright/test';

/**
 * Full marketplace flow against a real Postgres database. Needs DATABASE_URL, AUTH_SECRET,
 * AUTH_TEST_LOGIN=1 and ADMIN_EMAILS=admin@mistrail.test (see .github/workflows/ci.yml).
 */
test.skip(!process.env.DATABASE_URL || process.env.AUTH_TEST_LOGIN !== '1', 'marketplace e2e needs a database and test login');
test.describe.configure({ mode: 'serial' });

const run = Date.now().toString(36);
const title = `Bamboo riverside homestay ${run}`;

async function testLogin(page: Page, email: string, next: string) {
  await page.goto(`/signin?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Sign in for testing' }).click();
  await page.waitForURL((url) => url.pathname === next);
}

test('a host signs up, creates a listing and submits it for review', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'runs once');
  await testLogin(page, `host-${run}@mistrail.test`, '/host');

  await page.getByLabel('Host or business name (shown to guests)').fill(`Dorjee Family ${run}`);
  await page.getByLabel('Phone / WhatsApp').fill('+91 98000 00000');
  await page.getByRole('combobox', { name: 'State', exact: true }).selectOption('arunachal-pradesh');
  await page.getByRole('button', { name: 'Save host profile' }).click();
  await page.waitForURL('**/host/dashboard');

  await page.getByRole('link', { name: 'New listing' }).click();
  await page.getByLabel('Title').fill(title);
  await page.getByRole('combobox', { name: 'State', exact: true }).selectOption('arunachal-pradesh');
  await page.getByLabel('Village / town, district').fill('Hong village, Ziro');
  await page.getByLabel('Description').fill('A bamboo house beside the Kile river with Apatani home cooking, rice-field walks and a warm fire every evening.');
  await page.getByLabel('Amenities / what’s included').fill('Home-cooked meals, Hot water, Guided village walk');
  await page.getByLabel('Price (₹)').fill('2400');
  await page.getByLabel('Max guests').fill('4');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await expect(page.getByText('Draft created.')).toBeVisible();

  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByText('Submitted.')).toBeVisible();
  await expect(page.getByText('In review', { exact: true })).toBeVisible();
});

test('non-admins cannot open the admin area', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'runs once');
  await testLogin(page, `traveller-${run}@mistrail.test`, '/account');
  // The page streams, so the status is already 200 when the 404 UI replaces the content.
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /This trail/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Approval queue' })).toHaveCount(0);
});

test('an admin approves it and travellers can find it and enquire', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'runs once');
  await testLogin(page, 'admin@mistrail.test', '/admin');
  await page.getByRole('button', { name: `Approve “${title}”` }).click();
  await expect(page.getByRole('button', { name: `Approve “${title}”` })).toHaveCount(0);

  await page.goto('/stays?state=arunachal-pradesh');
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

  await page.getByRole('textbox', { name: 'Your name' }).fill('Asha Traveller');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('asha@example.com');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByText(/we’ve got your enquiry/)).toBeVisible();
});
