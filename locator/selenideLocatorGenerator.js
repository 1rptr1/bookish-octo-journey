export async function generateLocators(page) {
  return await page.evaluate(() => {
    const locators = [];

    document.querySelectorAll('input, button').forEach(el => {
      if (el.id) {
        locators.push({
          element: el.tagName.toLowerCase(),
          locator: `$("#${el.id}")`,
          confidence: 95
        });
      }
    });

    return locators;
  });
}
