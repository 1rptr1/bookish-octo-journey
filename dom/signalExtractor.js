export async function extractSignals(page) {
  return await page.evaluate(() => {
    const signals = new Set();

    if (document.querySelector('form')) signals.add('FORM');
    if (document.querySelector('input[type=email]')) signals.add('EMAIL');
    if (document.querySelector('input[type=password]')) signals.add('PASSWORD');
    if (document.querySelector('[required]')) signals.add('REQUIRED');
    if (document.querySelector('button[type=submit]')) signals.add('SUBMIT');

    return Array.from(signals);
  });
}
