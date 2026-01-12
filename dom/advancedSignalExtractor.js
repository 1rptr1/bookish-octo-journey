export async function extractSignals(page) {
  return await page.evaluate(() => {
    const signals = {
      fields: [],
      actions: [],
      validations: []
    };

    // Collect inputs + labels
    document.querySelectorAll('input, textarea, select').forEach(el => {
      const id = el.id || null;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;

      signals.fields.push({
        id,
        type: el.type || el.tagName.toLowerCase(),
        required: el.required || el.hasAttribute('required'),
        label: label ? label.innerText.trim() : null
      });
    });

    // Collect clickable elements
    document.querySelectorAll('button, [role=button], a').forEach(el => {
      const text = (el.innerText || '').trim();
      if (text) signals.actions.push(text);
    });

    // Collect visible validation text
    document.querySelectorAll('p, span, div').forEach(el => {
      const text = (el.innerText || '').trim();
      if (!text) return;
      if (/error|invalid|required|must|failed/i.test(text)) {
        signals.validations.push(text);
      }
    });

    return signals;
  });
}
