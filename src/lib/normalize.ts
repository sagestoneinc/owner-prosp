const COMPANY_PATTERN = /\b(LLC|INC\.?|CORP\.?|CORPORATION|LTD\.?|LP|L\.P\.|TRUST|HOLDINGS|INVESTMENTS|PROPERTIES|PROPERTY GROUP)\b/i;

export function normalizeEmailCell(value: unknown): string[] {
  if (value == null) return [];
  const raw = String(value);
  const parts = raw.split(/[\n,;]+/g)
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);
  const seen = new Set<string>();
  return parts.filter(email => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (seen.has(email)) return false;
    seen.add(email);
    return true;
  });
}

function titleCaseWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function displayFirstName(value: unknown): string {
  if (value == null) return 'Owner';
  const lines = String(value)
    .split(/\r?\n/g)
    .map(v => v.trim())
    .filter(Boolean);
  const personLine = [...lines].reverse().find(line => !COMPANY_PATTERN.test(line));
  if (!personLine) return 'Owner';
  const first = personLine.split(/\s+/)[0]?.replace(/^[^A-Za-zÀ-ÖØ-öø-ÿ'’-]+|[^A-Za-zÀ-ÖØ-öø-ÿ'’-]+$/g, '') || '';
  return first ? titleCaseWord(first) : 'Owner';
}

export function cleanAddress(value: unknown): string {
  return value == null ? '' : String(value).trim().replace(/\s+/g, ' ');
}

export function parseSheetDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}
