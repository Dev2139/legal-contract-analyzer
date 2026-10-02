export interface AnonymizeResult {
  text: string;
  mapping: Record<string, string>;
  reverseMapping: Record<string, string>;
}

/**
 * Anonymizes PII (Emails, Phone numbers, Names, Organizations)
 * with reversible placeholders like [EMAIL_1], [PHONE_1], [PERSON_1].
 */
export function anonymizeText(input: string): AnonymizeResult {
  const mapping: Record<string, string> = {};
  const reverseMapping: Record<string, string> = {};

  let text = input;

  let emailCount = 0;
  let phoneCount = 0;
  let personCount = 0;

  // 1. Email Regex
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
    if (reverseMapping[match]) return reverseMapping[match];
    emailCount++;
    const placeholder = `[EMAIL_${emailCount}]`;
    mapping[placeholder] = match;
    reverseMapping[match] = placeholder;
    return placeholder;
  });

  // 2. Phone Regex
  text = text.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, (match) => {
    if (reverseMapping[match]) return reverseMapping[match];
    phoneCount++;
    const placeholder = `[PHONE_${phoneCount}]`;
    mapping[placeholder] = match;
    reverseMapping[match] = placeholder;
    return placeholder;
  });

  return { text, mapping, reverseMapping };
}

/**
 * Reverses anonymization placeholders back to original PII text.
 */
export function deanonymizeText(text: string, mapping: Record<string, string>): string {
  let result = text;
  for (const [placeholder, original] of Object.entries(mapping)) {
    result = result.replaceAll(placeholder, original);
  }
  return result;
}
