export function filterLocatorsByFields(locators, fields) {
  const fieldIds = new Set(fields.map(f => f.id).filter(Boolean));

  return locators.filter(l => fieldIds.has(l.id));
}
