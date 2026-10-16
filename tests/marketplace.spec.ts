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

/* ------------------------------- Phase 4: bookings ------------------------------- */

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000 + 5.5 * 3_600_000).toISOString().slice(0, 10);
const IN = day(40);
const OUT = day(43);

async function openListing(page: Page) {
  await page.goto('/stays?state=arunachal-pradesh');
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
}

async function chooseDates(page: Page, checkIn: string, checkOut: string) {
  const book = page.getByRole('complementary', { name: 'Book' });
  // `min` is set once the widget has hydrated; typing earlier would be reset by React.
  await expect(book.getByLabel('Check-in')).toHaveAttribute('min', /\d{4}-/);
  await book.getByLabel('Check-in').fill(checkIn);
  await book.getByLabel('Check-out').fill(checkOut);
  return book;
}

test('a host can close a date, and travellers can’t book it', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280' || process.env.PAYMENTS_FAKE !== '1', 'runs once, needs the fake gateway');
  await testLogin(page, `host-${run}@mistrail.test`, '/host/dashboard');
  await page.getByRole('link', { name: new RegExp(title) }).click();
  await page.getByRole('link', { name: 'Calendar & prices' }).click();
  const closed = day(50);
  await page.getByRole('button', { name: new RegExp(`^${closed}: open`) }).click();
  await expect(page.getByRole('button', { name: new RegExp(`^${closed}: closed`) })).toBeVisible();

  await openListing(page);
  const book = await chooseDates(page, day(49), day(51));
  await expect(book.getByRole('alert')).toContainText('isn’t available');
});

test('a traveller books and pays; the dates can’t be double-booked', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280' || process.env.PAYMENTS_FAKE !== '1', 'runs once, needs the fake gateway');
  await openListing(page);
  const book = await chooseDates(page, IN, OUT);
  // 3 nights × ₹2,400 with default settings (no fee or tax)
  await expect(book.getByTestId('quote-total')).toHaveText('₹7,200');
  await book.getByLabel('Your name').fill('Asha Traveller');
  await book.getByLabel('Email').fill(`asha-${run}@example.com`);
  await book.getByRole('button', { name: 'Continue to payment' }).click();
  await book.getByRole('button', { name: 'Pay ₹7,200' }).click();
  await page.waitForURL(/\/bookings\/MT-/);
  await expect(page.getByText('Confirmed', { exact: true })).toBeVisible();

  await openListing(page);
  const again = await chooseDates(page, day(42), day(44));
  await expect(again.getByRole('alert')).toContainText('already booked');
});

test('a signed Razorpay webhook confirms a payment', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop-1280' || process.env.PAYMENTS_FAKE !== '1', 'runs once, needs the fake gateway');
  const { createHmac } = await import('node:crypto');
  const postgres = (await import('postgres')).default;
  await openListing(page);
  const book = await chooseDates(page, day(60), day(62));
  await book.getByLabel('Your name').fill('Webhook Guest');
  await book.getByLabel('Email').fill(`hook-${run}@example.com`);
  await book.getByRole('button', { name: 'Continue to payment' }).click();
  await expect(book.getByText(/your dates are held/)).toBeVisible();

  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const [row] = await sql`select ref, razorpay_order_id from booking where guest_email = ${`hook-${run}@example.com`}`;
  const body = JSON.stringify({
    event: 'payment.captured',
    payload: { payment: { entity: { id: `pay_hook_${run}`, order_id: row.razorpay_order_id, status: 'captured' } } },
  });
  const bad = await request.post('/api/payments/webhook', { data: body, headers: { 'content-type': 'application/json', 'x-razorpay-signature': 'nope' } });
  expect(bad.status()).toBe(400);
  const sig = createHmac('sha256', 'fake_secret_for_local_testing_only').update(body).digest('hex');
  const ok = await request.post('/api/payments/webhook', { data: body, headers: { 'content-type': 'application/json', 'x-razorpay-signature': sig } });
  expect(ok.status()).toBe(200);
  const [after] = await sql`select status from booking where ref = ${row.ref}`;
  await sql.end();
  expect(after.status).toBe('confirmed');
});

test('a traveller cancels and the admin issues the refund', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280' || process.env.PAYMENTS_FAKE !== '1', 'runs once, needs the fake gateway');
  await testLogin(page, `asha-${run}@example.com`, '/account');
  await page
    .getByRole('link', { name: new RegExp(title) })
    .first()
    .click();
  await expect(page.getByText(/If you cancel today you’ll get ₹7,200 back/)).toBeVisible();
  await page.getByRole('button', { name: 'Cancel booking' }).click();
  await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();

  await testLogin(page, 'admin@mistrail.test', '/admin');
  await page.getByRole('button', { name: 'Refund ₹7,200' }).first().click();
  await expect(page.getByRole('button', { name: 'Refund ₹7,200' })).toHaveCount(0);
});

test('after the stay, the traveller reviews it and the rating appears on the listing', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280' || process.env.PAYMENTS_FAKE !== '1', 'runs once, needs the fake gateway');
  const postgres = (await import('postgres')).default;
  await openListing(page);
  const book = await chooseDates(page, day(70), day(72));
  await book.getByLabel('Your name').fill('Rina Bora');
  await book.getByLabel('Email').fill(`rina-${run}@example.com`);
  await book.getByRole('button', { name: 'Continue to payment' }).click();
  await book.getByRole('button', { name: /^Pay/ }).click();
  await page.waitForURL(/\/bookings\/MT-/);
  const bookingUrl = page.url();

  // Move the stay into the past so it can be reviewed.
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await sql`update booking set start_date = current_date - 5, end_date = current_date - 3 where guest_email = ${`rina-${run}@example.com`}`;
  await sql.end();

  await page.goto(bookingUrl);
  await page.getByRole('radio', { name: /5 stars/ }).check({ force: true });
  await page.getByLabel('What was it like?').fill('Warm hosts, wonderful food and a view of the rice fields from bed.');
  await page.getByRole('button', { name: 'Post review' }).click();
  await expect(page.getByRole('heading', { name: 'Your review' })).toBeVisible();

  await openListing(page);
  await expect(page.getByRole('heading', { name: 'Guest reviews' })).toBeVisible();
  await expect(page.getByText('Rina B.')).toBeVisible();
  await expect(page.getByText(/5\.0 · 1 review/).first()).toBeVisible();
});
