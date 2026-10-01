/**
 * Text normalization utilities for Legal Contract Analyzer.
 * Handles whitespace normalization, newline flattening, and fuzzy position mapping.
 */

export interface NormalizedMapping {
  normalizedText: string;
  // Index map: normalized index -> original index
  normToOrigIndex: number[];
}

/**
 * Normalizes text by removing redundant whitespace, newlines, tabs, and line wraps,
 * while maintaining a 1-to-1 index mapping back to original text character positions.
 */
export function normalizeTextWithMapping(original: string): NormalizedMapping {
  if (!original) {
    return { normalizedText: '', normToOrigIndex: [] };
  }

  let normalizedText = '';
  const normToOrigIndex: number[] = [];
  let inSpace = false;

  for (let i = 0; i < original.length; i++) {
    const char = original[i];
    const isWhitespace = /\s/.test(char);

    if (isWhitespace) {
      if (!inSpace && normalizedText.length > 0) {
        normalizedText += ' ';
        normToOrigIndex.push(i);
        inSpace = true;
      }
    } else {
      normalizedText += char;
      normToOrigIndex.push(i);
      inSpace = false;
    }
  }

  // Trim trailing space if any
  if (normalizedText.endsWith(' ')) {
    normalizedText = normalizedText.slice(0, -1);
    normToOrigIndex.pop();
  }

  return { normalizedText, normToOrigIndex };
}

/**
 * Simple string normalization without mapping.
 */
export function normalizeString(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Clean and normalize text for comparison or indexing.
 */
export function cleanText(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}
