import { normalizeTextWithMapping, normalizeString } from '../utils/normalizeText';
import { CitationVerificationService } from '../services/citations/CitationVerificationService';
import { DocumentModel } from '../models/Document';
import { DocumentPageModel } from '../models/DocumentPage';

jest.mock('../models/Document');
jest.mock('../models/DocumentPage');

describe('CitationVerificationService & Text Normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should normalize whitespace, tabs and line wraps correctly', () => {
    const raw = 'Either party  may terminate\nthis Agreement upon\tnotice.';
    const normalized = normalizeString(raw);
    expect(normalized).toBe('Either party may terminate this Agreement upon notice.');
  });

  it('should maintain exact 1-to-1 index mapping back to original text', () => {
    const raw = 'Header\n\nSection 1  Terms';
    const { normalizedText, normToOrigIndex } = normalizeTextWithMapping(raw);

    expect(normalizedText).toBe('Header Section 1 Terms');
    expect(normToOrigIndex.length).toBe(normalizedText.length);
    expect(raw[normToOrigIndex[0]]).toBe('H');
  });

  it('should handle missing quotes gracefully without crashing', async () => {
    (DocumentModel.findById as jest.Mock).mockResolvedValue(null);

    const results = await CitationVerificationService.verifyQuotes([
      { documentId: '60f7b1234567890123456789', quote: 'Nonexistent clause string' },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].verified).toBe(false);
  });

  it('should verify exact quotation match across document pages', async () => {
    (DocumentModel.findById as jest.Mock).mockResolvedValue({
      _id: 'doc123',
      originalName: 'ServiceAgreement.pdf',
    });

    (DocumentPageModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          pageNumber: 1,
          text: 'Section 12. Either party may terminate this agreement upon 30 days written notice.',
        },
      ]),
    });

    const results = await CitationVerificationService.verifyQuotes([
      { documentId: 'doc123', quote: 'Either party may terminate this agreement' },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].verified).toBe(true);
    expect(results[0].page).toBe(1);
  });
});
