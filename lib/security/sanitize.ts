export function cleanText(value: string, max = 240) {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

export function cleanOptional(value?: string | null, max = 240) {
  if (!value) return undefined;
  const cleaned = cleanText(value, max);
  return cleaned.length ? cleaned : undefined;
}
