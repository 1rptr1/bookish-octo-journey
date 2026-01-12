export function extractFields(elements) {
  const fields = [];
  let lastLabel = null;

  elements.forEach(el => {
    if (el.tag === 'label' && el.text && el.text.trim()) {
      lastLabel = el.text.trim();
      return;
    }

    if (el.tag === 'input') {
      const id = el.id || null;
      const type = el.type || 'text';

      if (!lastLabel) {
        if (!id) return;
        if (type === 'hidden') return;
        if (/^(inp_|hidden_|helper_)/i.test(id)) return;
      }

      fields.push({
        label: lastLabel,
        type,
        id,
        required: !!el.required
      });
      lastLabel = null;
    }
  });

  return fields;
}
