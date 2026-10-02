# Legal Contract Analyzer ⚖️

> **Live Deployed Application**: [https://legal-contract-analyzer-theta.vercel.app/](https://legal-contract-analyzer-theta.vercel.app/)

An enterprise-grade Legal Contract Analysis web application built with **Next.js**, **Express.js**, **TypeScript**, **MongoDB**, **Mongoose**, and **OpenAI API**.

The application enables legal teams to upload PDF and DOCX contracts, query single or multiple agreements, receive real-time streaming AI answers with **deterministic citation verification**, perform side-by-side contract comparison, run multi-round agentic document research, extract standard contract clauses, anonymize sensitive PII, and export verified audit reports.

---

## 🌐 Deployed Application & Links
- **Deployed App**: [https://legal-contract-analyzer-theta.vercel.app/](https://legal-contract-analyzer-theta.vercel.app/)
- **Repository**: [Legal Contract Analyzer Repository](https://github.com/Dev2139/legal-contract-analyzer)

---

## 🌟 Comprehensive Feature Breakdown

### Part A: Core Features
1. **Document Upload & Processing**:
   - Accepts `.pdf` and `.docx` files. Rejects unsupported file types with clear feedback.
   - Preserves page boundaries and clause structures.
   - **Scanned PDF Detection**: Identifies image-only or scanned PDFs without extractable text, notifying the user rather than saving an empty document.
   - Full document library CRUD interface (upload, preview, select, delete).

2. **Chat with a Document**:
   - Ask questions about selected contract(s) with executive, point-wise answers.
   - **SSE Streaming**: Answers stream in real-time.
   - **Stop Generation**: Stop writing at any time using `AbortController` while retaining generated text.
   - Persistent chat session per contract.

3. **Deterministic Quote Verification ⭐ *(Core Feature)***:
   - **Zero-Trust Verification Engine**: Before any quote is displayed, backend logic verifies that the exact text exists in the uploaded document.
   - **Whitespace Normalization**: Removes tabs, newline breaks, and double spaces so true quotes are not wrongly rejected.
   - **Hallucination Prevention**: Quotes invented or altered by AI are automatically stripped or flagged as unverified.

4. **Large Document Support**:
   - Splits 150+ page contracts into structured clauses and manageable page chunks.
   - Reads the complete document before answering to avoid inaccurate claims about clause absence.

---

### Part B: Advanced Features
5. **Citation Highlighting & Deep-Linking**:
   - Clicking any verified quote opens the document viewer, jumps to the exact page, scrolls to the passage, and highlights the quote in context.

6. **Multi-Document Analysis**:
   - Select multiple agreements to run combined queries, side-by-side comparisons, or cross-document obligation checks.

7. **Substantive Document Comparison**:
   - Clause-by-clause contract version comparison.
   - Identifies financial and obligation shifts (e.g. `AED 100,000` → `AED 1,000,000`).
   - Filter differences by `High`, `Medium`, or `Low` legal significance.

---

### Part C: Option 2 — Agentic Document Research
8. **Autonomous Agentic Loop**:
   - Autonomous multi-round tool-calling loop using `search_document(query)`, `get_section(number)`, `list_clauses()`, and `synthesize_research()`.
   - **Live Activity Feed**: Displays step-by-step progress timeline (*✓ Searching for termination provisions*, *✓ Reviewing Section 12*, etc.).
   - **Safety Cap**: Hard limit of 6 rounds to prevent unbounded execution loops.

---

### 🎁 Bonus Extra Features
9. **PII Anonymization & Reversible Mapping**:
   - Masks names, email addresses, phone numbers, and company names with placeholders (`[PERSON_1]`, `[ORG_1]`, `[EMAIL_1]`, `[PHONE_1]`) with a reversible mapping toggle.
10. **Automated Clause Extraction**:
    - Dedicated tab extracting standard clauses (*Termination, Limitation of Liability, Governing Law, Confidentiality, Payment Terms*) with verified passage citations.
11. **Voice Question Input**:
    - Web Speech API microphone integration for asking questions using speech-to-text.
12. **Export Verified Audit Reports**:
    - Export answers, verified quotes, and source citations as formatted document reports.
13. **Arabic & RTL Support**:
    - Right-to-left layout direction (`dir="rtl"`) and Arabic character text extraction.
14. **Dark / Light Mode**:
    - Full theme system with persistent theme state.

---

## 📝 Architectural & Technical Note

### How Quote Verification Works & Where It Could Fail
Our verification engine isolates quotes extracted by the LLM and runs a two-pass matcher against the raw document text:
1. **Pass 1 (Normalized Substring Match)**: Both the document text and quote are stripped of non-standard whitespace, quotes, and linebreaks.
2. **Pass 2 (Fuzzy Token Sliding Window)**: If formatting differs slightly due to PDF extraction artifacts (e.g. hyphenated line breaks), a Levenshtein similarity score (>0.88) verifies match accuracy.
- *Potential Failure Case*: Highly distorted OCR text from low-resolution scans where character recognition drops below similarity thresholds.

### How Large Documents Are Handled
Contracts are processed into overlapping 500-token chunks with metadata tag arrays (page index, section header, clause title). Queries utilize a multi-stage retrieval strategy combining exact lexical matching, n-gram tf-idf relevance, and monetary pattern boosting to ensure full-document coverage before synthesis.

### Part C Option Selection (Option 2: Agentic Research)
We chose **Option 2 (Agentic Document Research)** because real-world contract analysis requires active exploration—knowing *where* to look rather than just ingesting text prompts. The agent dynamically executes tool calls, reads section outputs, and iterates until it gathers sufficient verified context.

### Future Roadmap
With additional development time, we would implement:
1. Native Tesseract OCR for server-side scanned document rasterization.
2. Real-time Tracked-Change Word (.docx) Redlining XML renderer (Part C Option 1).
3. Local vector embedding database (Qdrant/pgvector) for hybrid dense-lexical search.

---

## 🚀 Quick Local Setup Guide

### 1. Prerequisites
- Node.js `v20.x` or higher
- MongoDB running on `mongodb://localhost:27017`

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/legal-contract-analyzer
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Install & Launch
```bash
# Install dependencies
npm install
npm --prefix server install
npm --prefix client install

# Start Backend Server (Port 5000)
npm run dev:server

# Start Frontend App (Port 3000)
npm run dev:client
```