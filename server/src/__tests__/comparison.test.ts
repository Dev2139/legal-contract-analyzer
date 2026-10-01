import { ComparisonService } from '../services/comparison/ComparisonService';

describe('ComparisonService Unit Tests', () => {
  it('should evaluate financial amount changes as high significance', () => {
    const oldText = 'The liability cap shall be AED 100,000.';
    const newText = 'The liability cap shall be AED 1,000,000.';

    const significance = (ComparisonService as any).evaluateSignificance(oldText, newText);
    expect(significance).toBe('high');
  });

  it('should evaluate non-critical minor wording changes as low significance', () => {
    const oldText = 'The notice shall be sent via regular email.';
    const newText = 'The notice shall be sent via digital email.';

    const significance = (ComparisonService as any).evaluateSignificance(oldText, newText);
    expect(significance).toBe('low');
  });
});
