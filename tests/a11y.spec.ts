import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/states/meghalaya',
  '/packages',
  '/packages/tawang-circuit',
  '/festivals',
  '/permits',
  '/plan',
  '/stays',
  '/contact',
  '/about',
  '/signin',
  '/host',
];

for (const path of PAGES) {
  test(`${path} has no serious accessibility violations`, async ({ page }, info) => {
    test.skip(info.project.name === 'tablet-768', 'mobile and desktop cover the layouts');
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} — ${v.nodes
            .map((n) => n.target.join(' '))
            .slice(0, 3)
            .join(' | ')}`,
      );
    expect(serious, serious.join('\n')).toEqual([]);
  });
}
