import { extractFields } from './fieldExtractor.js';
import { extractActions } from './actionExtractor.js';
import { dedupeFields } from './dedupe.js';

export function extractScopedSignals(elements) {
  const rawFields = extractFields(elements);
  const fields = dedupeFields(rawFields);
  const actions = extractActions(elements);

  return {
    fields,
    actions
  };
}
