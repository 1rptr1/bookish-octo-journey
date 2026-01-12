export function dedupeFields(fields) {
  const seen = new Set();

  return fields.filter(f => {
    const key = `${f.label}-${f.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
