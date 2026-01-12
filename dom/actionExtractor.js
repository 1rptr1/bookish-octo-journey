export function extractActions(elements) {
  return elements
    .filter(el => el.tag === 'button' && el.text && el.text.trim().length < 30)
    .map(el => el.text.trim());
}
