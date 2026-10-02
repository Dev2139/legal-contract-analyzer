# Legal Contract Analyzer ⚖️

## 1. Overview

**Legal Contract Analyzer** is an enterprise-grade web application designed for analyzing, querying, comparing, and researching legal contracts (PDF and DOCX agreements).

Legal contracts are notoriously long, dense, and complex. This application solves the critical problem of contract analysis by allowing legal professionals and business users to upload agreements and ask plain-language questions.

Key guarantees and capabilities:
- **Strict Grounding**: Answers are generated strictly using document content.
- **Deterministic Citation Verification**: Every answer is backed by exact quotes from the contract, independently verified by backend algorithms before display to eliminate AI hallucinations.
- **Interactive Deep-Linking**: Clicking any quote jumps directly to the source page and highlights the passage in context.
- **Advanced Contract Analysis**: Supports multi-document analysis, substantive clause-level contract version comparison, and autonomous multi-round agentic document research.

---

## 2. Assignment Coverage

Below is the verified checklist of hiring assignment requirements mapped directly to the implemented codebase:

### Part A — Core Features

* [x] **PDF upload**: Accepts `.pdf` files up to 50MB with file validation.
* [x] **DOCX upload**: Accepts `.docx` files up to 50MB with file validation.
* [x] **Document processing**: Extracts text, page boundaries, and section headers into structured database chunks.
* [x] **Processing status**: Live feedback state (`uploading` → `extracting` → `ready` or `error`).
* [x] **Scanned PDF handling**: Detects scanned/image-only PDFs lacking extractable text and informs the user clearly instead of saving empty documents.
* [x] **Document library**: Interface listing all uploaded contracts with select, view, and deletion features.
* [x] **Document deletion**: Deletes contract metadata and text chunks from database storage.
* [x] **Streaming chat**: SSE (Server-Sent Events) streaming for real-time progressive answer generation.
* [x] **Stop generation**: Immediate response cancellation via `AbortController` while preserving partial output history.
* [x] **Chat history**: Saves past Q&A turns per document session for easy reopening.
* [x] **Verified citations**: Zero-trust server verification confirming quotes exist in source document before rendering.
* [x] **Large-document handling**: Overlapping chunking strategy with page awareness and monetary pattern boosting.

### Part B — Advanced Features

* [x] **Citation highlighting**: Clicking a verified quote opens the document viewer, jumps to the exact page, and highlights the target passage.
* [x] **Multi-document questions**: Select multiple agreements to run comparative analysis and cross-document queries with document-specific citations.
* [x] **Contract comparison**: Compares two versions of a contract at clause level, identifying substantive changes and legal significance.

### Part C — Challenge Choice

* [x] **Option 2 — Agentic Document Research**: Autonomous multi-round tool-calling loop (`search_document`, `get_section`, `list_clauses`) with live timeline feedback and round safety caps.

---

## 3. Demo

- **Live Application:** [https://legal-contract-analyzer-theta.vercel.app/](https://legal-contract-analyzer-theta.vercel.app/)
- **GitHub:** TODO
- **Demo Video:** TODO

---

## 4. Screenshots

> *Note: Placeholders indicate screen locations for evaluator demonstration.*

- **Document Upload & Library**: `docs/screenshots/upload.png` *(TODO)*
- **Chat with Verified Citations**: `docs/screenshots/chat-citations.png` *(TODO)*
- **Citation Highlighting**: `docs/screenshots/citation-highlight.png` *(TODO)*
- **Multi-Document Comparison**: `docs/screenshots/comparison.png` *(TODO)*
- **Agentic Document Research**: `docs/screenshots/agent-research.png` *(TODO)*

---

## 5. Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Client Components)
- **UI Library**: React 19, Tailwind CSS v4
- **Icons**: Lucide React
- **Animations / Micro-interactions**: Canvas-Confetti, Tailwind transitions

### Backend
- **Runtime**: Node.js v20
- **Framework**: Express.js
- **Language**: TypeScript
- **File Parsing**: `pdf-parse` (PDF extraction), `mammoth` (DOCX extraction), `multer` (multipart upload middleware)

### Database
- **Database**: MongoDB (Local / MongoDB Atlas)
- **ORM**: Mongoose

### AI & Integration
- **LLM Provider**: OpenAI API (`gpt-4o` / OpenAI Node SDK)
- **Fallback Engine**: Local rule-based reasoning engine for offline/unconfigured environments

### Testing
- **Framework**: Jest, `ts-jest`, `supertest`

---

## 6. Architecture

```mermaid
flowchart TD
    UI[Next.js Frontend]
    API[Express API]
    DB[(MongoDB)]
    DOC[Document Processing Engine]
    RET[Retrieval System]
    AI[OpenAI / Agent Loop]
    CIT[Citation Verification Engine]
    CMP[Contract Comparison Engine]

    UI -->|HTTP / SSE Streaming| API
    API -->|Mongoose Models| DB
    API -->|PDF / DOCX Parsing| DOC
    DOC -->|Store Chunks & Pages| DB
    API -->|BM25 & Tf-Idf Search| RET
    RET -->|Context Chunks| AI
    AI -->|Generated Output & Quotes| CIT
    CIT -->|Verify Quotes Against Document| DB
    CIT -->|Verified Stream Payload| UI
    API -->|Clause Diffing| CMP
```

### Component Roles
1. **Next.js Frontend**: Segmented tab workspace (Q&A Assistant, Compare Versions, Agentic Research, Extract Clauses), multi-document selector, streaming chat renderer, and PDF/text document viewer with highlight overlay.
2. **Express API**: Handles REST routes, file uploads, SSE stream formatting, and error middleware.
3. **Document Processing Engine**: Validates files, extracts raw text, tracks page offsets, and parses agreements into clause/paragraph chunks.
4. **Retrieval System**: Multi-stage lexical search combining n-gram tf-idf ranking, page metadata tags, and financial/monetary keyword boosting.
5. **Citation Verification Engine**: Independent zero-trust validator ensuring quote strings exist in document source text before UI presentation.
6. **Contract Comparison Engine**: Compares contract pairs, detects added/deleted/modified clauses, and ranks legal significance.

---

## 7. Project Structure

```text
legal-contract-analyzer/
├── client/                     # Next.js Frontend App
│   ├── app/                    # App Router pages and layout
│   │   ├── globals.css         # Styling system & dark mode variants
│   │   ├── layout.tsx          # Root HTML layout
│   │   └── page.tsx            # Main tab workspace container
│   ├── components/             # React UI Components
│   │   ├── ChatWindow.tsx      # Q&A Assistant & SSE stream view
│   │   ├── CitationBadge.tsx   # Verified quote card component
│   │   ├── ClauseExtractor.tsx # Standard clause extraction card
│   │   ├── ComparisonView.tsx  # Contract version diff viewer
│   │   ├── DocumentLibrary.tsx # Document upload & list sidebar
│   │   ├── DocumentViewer.tsx  # PDF / DOCX page viewer & highlighter
│   │   ├── Header.tsx          # App navbar & dark mode toggle
│   │   └── ResearchTimeline.tsx# Agentic research activity feed
│   ├── lib/                    # Client Utility Libraries
│   │   ├── anonymize.ts        # PII anonymization & reverse mapping
│   │   ├── api.ts              # API fetch & SSE stream helpers
│   │   └── export.ts           # Formatted report exporter
│   ├── types/                  # TypeScript interface definitions
│   ├── next.config.ts          # Next.js build configuration
│   ├── package.json            # Client dependencies
│   └── vercel.json             # Vercel deployment manifest
├── server/                     # Express Backend API
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection setup
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── controllers/        # Express route controllers
│   │   │   ├── ChatController.ts
│   │   │   ├── ComparisonController.ts
│   │   │   ├── ConversationController.ts
│   │   │   ├── DocumentController.ts
│   │   │   └── ResearchController.ts
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Conversation.ts
│   │   │   └── Document.ts
│   │   ├── routes/             # Express API routes
│   │   │   ├── chatRoutes.ts
│   │   │   ├── comparisonRoutes.ts
│   │   │   ├── conversationRoutes.ts
│   │   │   ├── documentRoutes.ts
│   │   │   └── researchRoutes.ts
│   │   ├── services/           # Core business logic & AI engines
│   │   │   ├── agentService.ts
│   │   │   ├── aiService.ts
│   │   │   ├── citationService.ts
│   │   │   ├── comparisonService.ts
│   │   │   ├── docxService.ts
│   │   │   ├── pdfService.ts
│   │   │   └── ragService.ts
│   │   ├── tools/              # Agentic research tool definitions
│   │   │   └── researchTools.ts
│   │   ├── utils/              # Text normalization & matching helpers
│   │   │   └── textNormalization.ts
│   │   ├── __tests__/          # Backend Jest test suites
│   │   │   ├── citationVerification.test.ts
│   │   │   └── comparison.test.ts
│   │   ├── app.ts              # Express middleware & app definition
│   │   └── server.ts           # Express server entry point
│   ├── api/                    # Vercel serverless function entrypoint
│   │   └── index.ts
│   ├── package.json            # Server dependencies & build scripts
│   └── vercel.json             # Vercel backend routing manifest
├── package.json                # Monorepo root workspace scripts
├── .env.example                # Root environment template
└── README.md                   # Project documentation
```

---

## 8. Document Processing

### Pipeline Flow
```text
Upload File (.pdf / .docx)
        ↓
Validation (File extension & <= 50MB limit)
        ↓
Text Extraction (pdf-parse / mammoth)
        ↓
Empty/Scanned PDF Check (Rejects zero-text files)
        ↓
Clause & Page Segmentation (Extracts page bounds & section headers)
        ↓
Database Storage (Saves Document & Chunk collection in MongoDB)
        ↓
Status Update (`ready`)
```

1. **Upload**: Endpoint `/api/documents` receives files via `multer` disk storage.
2. **Validation**: Enforces strict extension checking (`.pdf`, `.docx`) and a 50MB file size limit.
3. **Extraction**:
   - PDFs: Extracted page-by-page using `pdf-parse`, capturing per-page text content and page counts.
   - DOCX: Extracted paragraph-by-paragraph using `mammoth.extractRawText`.
4. **Scanned PDF Handling**: Evaluates total extracted text length. If text length < 20 characters, processing fails with message: *"This PDF does not contain readable text. Please upload a text-based PDF or DOCX."*
5. **Segmentation & Chunking**: Document text is divided into overlapping 500-token chunks with metadata (`documentId`, `pageNumber`, `chunkIndex`, `text`, `section`).
6. **MongoDB Persistence**: Stores document record and associated text chunk items in MongoDB.

---

## 9. Question Answering

### Flow Architecture
```text
User Question
      ↓
Document Retrieval (Retrieves top relevant chunks via Lexical/Tf-Idf)
      ↓
System Prompt Construction (Instructs model to answer strictly from context)
      ↓
LLM Synthesis (OpenAI API / gpt-4o)
      ↓
Raw Response Parsing (Extracts text and candidate quotes)
      ↓
Server-Side Citation Verification (Zero-Trust verification against raw contract text)
      ↓
SSE Stream Payload (Pushes verified answer and quote cards to UI)
```

To prevent the AI from answering using external or unsupported information:
- System prompts explicitly instruct the AI to refuse answering if information is not found in the context.
- All candidate quotes generated by the model must pass independent server-side verification before being presented as verified citations.

---

## 10. Citation Verification ⭐

The **Citation Verification Engine** is the central trust layer of the application. The system **never trusts AI-reported page numbers, offsets, or raw quote text blindly**.

```text
AI-Generated Candidate Quote
        ↓
Whitespace Normalization (Strips tabs, line breaks, extra spaces)
        ↓
Source Document Lookup (Searches full raw extracted contract text)
        ↓
Match Decision:
  ├── Exact Substring Match → Found!
  └── Fuzzy Token Sliding Window (Levenshtein > 0.88) → Found!
        ↓
Page & Offset Map (Independently calculates true page index and character offsets)
        ↓
Output:
  ├── Quote Verified → Attach true page number & position → Show Verified Badge
  └── Quote Not Found → Strip quote or mark as unverified
```

### Key Technical Aspects
- **Whitespace Normalization**: `normalizeWhitespace()` strips extra line breaks, tab spaces, and carriage returns that occur during PDF text extraction.
- **Independent Location Mapping**: Model-provided page numbers are ignored. The verification engine searches the source document text directly to locate the exact character position and page index.
- **Fuzzy Token Sliding Window**: Handles line wraps and hyphenated text breaks. If an exact match fails, a sliding token window checks character similarity (threshold > 0.88).
- **Unverified Handling**: Quotes that cannot be matched in the document text are removed from the verified citation payload to prevent hallucinated quotes from appearing genuine.

---

## 11. Citation Highlighting

Verified citations are seamlessly linked to the interactive document viewer:

1. **Click Event**: User clicks a verified citation card in the chat window.
2. **Page Navigation**: The viewer receives the target citation's `pageNumber` and updates `currentPage`.
3. **Scroll & Jump**: The document container scrolls smoothly to the target page element.
4. **Highlighting**:
   - PDF Documents: The viewer locates matching text tokens on the rendered canvas and overlays a yellow highlight box (`bg-yellow-200/80`).
   - DOCX Documents: The text view highlights the matching paragraph block.

### Edge Case Handling
- **Multi-Line / Cross-Page Quotes**: Quotes spanning page breaks highlight the corresponding text on both target pages.
- **Repeated Text**: If a quote appears multiple times in a document, the engine maps to the occurrence matching the context chunk's section offset.

---

## 12. Large Document Handling

To handle contracts up to 150+ pages without exceeding context window limits or costs:

1. **Overlapping Chunking**: Documents are split into overlapping 500-token chunks (with 50-token overlap) preserving paragraph and section integrity.
2. **Multi-Stage Retrieval**:
   - **Lexical BM25 Scoring**: Evaluates keyword density across chunk collections.
   - **Monetary Pattern Boosting**: Financial queries (*"what is the fee?", "liability cap"*) apply a +25 score boost to chunks containing currency formats (`$`, `AED`, `INR`, numbers).
3. **Context Selection**: The top 6 highest-scoring chunks are passed into the prompt.
4. **Full-Document Scan Requirement**: Before stating a clause does not exist, retrieval scans all document chunks to guarantee full-document coverage.

---

## 13. Multi-Document Questions

Users can select multiple contracts in the Document Library and ask cross-agreement questions:

- **Combined Retrieval**: Queries run across all selected document chunk sets simultaneously.
- **Document-Specific Tagging**: Every retrieved chunk and verified citation carries its source `documentId` and `documentName`.
- **Comparative Answer Synthesis**: System prompt instructs the model to compare terms across the selected agreements (e.g. *"Contract A specifies 30-day termination while Contract B requires 60-day notice"*).
- **Per-Document Verification**: Quotes are verified against their respective source contract text.

---

## 14. Contract Comparison

The **Contract Comparison Engine** identifies substantive differences between two versions of an agreement at clause level:

```text
Contract Version A                    Contract Version B
        │                                     │
        └─────────────┬───────────────────────┘
                      ▼
        Clause & Paragraph Segmentation
                      ▼
        Substantive Difference Engine
                      ▼
        Categorization:
          ├── Modified Clauses
          ├── Added Clauses
          └── Removed Clauses
                      ▼
        Legal Significance Ranking (High / Medium / Low)
```

### Difference Analysis Features
- **Substantive vs Character Diffs**: Ignores trivial formatting shifts (spaces, commas) and focuses on legal changes.
- **Financial Change Detection**: Identifies critical numeric shifts (e.g. Liability cap moving from `AED 100,000` to `AED 1,000,000`).
- **Significance Ranking**:
  - `High`: Changes to liability, termination, payment terms, or indemnification.
  - `Medium`: Changes to notice periods or renewal terms.
  - `Low`: Minor wording adjustments or administrative updates.

---

## 15. Agentic Document Research (Part C — Option 2)

Implementing **Part C (Option 2)**, the application includes an autonomous research agent capable of executing multi-round investigation loops:

```text
User Question
      ↓
Research Agent Loop
      ↓
Decision: Call Tool?
  ├── search_document(query)
  ├── get_section(sectionNumber)
  └── list_clauses()
      ↓
Execute Tool & Return Context
      ↓
Additional Rounds (Up to 6 Max Rounds)
      ↓
Final Synthesis & Quote Verification
      ↓
Output Activity Timeline & Verified Answer
```

### Agent Tools
- `search_document(query)`: Executes targeted lexical search across the contract.
- `get_section(section)`: Fetches full text of a specific contract section.
- `list_clauses()`: Extracts all major clause headings from the agreement.

### Safety & UX Controls
- **Round Safety Cap**: Hard cap of 6 execution rounds prevents infinite loops and unbounded API usage.
- **Malformed Call Handling**: Invalid tool parameters or unknown tool names are safely caught and corrected without failing the research job.
- **Live Progress Feed**: Streams `step` events to the UI (*"✓ Searching for termination provisions..."*), providing real-time visibility.
- **Verified Quotes**: Final research findings undergo zero-trust citation verification.

---

## 16. Key Engineering Decisions

1. **Why Next.js**: Provides server-side static page generation, responsive React state management, and seamless modern tab navigation.
2. **Why Express.js**: Offers low-latency Server-Sent Events (SSE) streaming, fine-grained control over multipart upload streams, and clean middleware separation.
3. **Why MongoDB**: Document schema flexibility accommodates variable page counts, clause structures, and nested chunk metadata without rigid schema migrations.
4. **Why Server-Side Citation Verification**: Grounding verification must happen on the backend to enforce zero-trust guarantees before data reaches the client UI.
5. **Why Multi-Stage Lexical Retrieval**: Ensures deterministic quote matching and fast response times without requiring external vector database infrastructure.
6. **Why Part C Option 2 Selected**: Autonomous document research mirrors real-world legal workflows, where lawyers actively look up specific sections before answering complex contractual questions.

---

## 17. API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/documents` | Upload a PDF or DOCX document (50MB max) |
| `GET` | `/api/documents` | List all uploaded documents in library |
| `GET` | `/api/documents/:id` | Fetch metadata for a specific document |
| `DELETE` | `/api/documents/:id` | Delete a document and its stored chunks |
| `GET` | `/api/documents/:id/pages` | Fetch page-by-page text content of a document |
| `GET` | `/api/documents/:id/chunks` | Fetch extracted text chunks of a document |
| `POST` | `/api/conversations` | Create a new chat conversation session |
| `GET` | `/api/conversations/:id` | Retrieve conversation history by session ID |
| `POST` | `/api/chat` | Stream answers & verified citations via SSE |
| `POST` | `/api/comparison` | Run clause-level contract version comparison |
| `POST` | `/api/research` | Run multi-round agentic document research |
| `GET` | `/api/health` | Health check endpoint |

---

## 18. Environment Variables

Create `.env` in the root directory (and `server/.env`):

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/legal-contract-analyzer

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o

# Server Configuration
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Agentic Research Settings
MAX_AGENT_ROUNDS=6
```

---

## 19. Local Setup

### Requirements
- **Node.js**: `v20.x` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

### Installation
```bash
# Clone the repository
git clone https://github.com/Dev2139/legal-contract-analyzer.git
cd legal-contract-analyzer

# Install all dependencies (root, server, client)
npm install
npm --prefix server install
npm --prefix client install
```

### Environment Configuration
```bash
cp .env.example .env
cp server/.env.example server/.env 2>/dev/null || true
```

### Running Backend Server
```bash
npm run dev:server
# Express server runs on http://localhost:5000
```

### Running Next.js Frontend
```bash
npm run dev:client
# Frontend runs on http://localhost:3000
```

### Running Both Concurrently
```bash
npm run dev
```

---

## 20. Database Setup

- **MongoDB Configuration**: Connected via Mongoose in `server/src/config/database.ts`.
- **Automatic Indexing**: Document metadata and text chunk collections auto-index on `documentId` and `chunkIndex` upon initial server boot.
- **Serverless Pooling**: Connection logic reuses existing Mongoose connections across serverless environments.

---

## 21. Testing

The repository includes backend unit and integration test suites using Jest:

```bash
# Run server test suite
npm test
```

### Verified Test Suites
1. **Citation Verification (`citationVerification.test.ts`)**: Tests exact matching, whitespace normalization, line-wrap handling, and rejection of hallucinated quotes.
2. **Contract Comparison (`comparison.test.ts`)**: Tests clause diffing, added/removed clause detection, and financial change classification.

---

## 22. Deployment

- **Frontend Deployment**: Deployed on Vercel at [https://legal-contract-analyzer-theta.vercel.app/](https://legal-contract-analyzer-theta.vercel.app/)
- **Backend Deployment**: Deployed on Vercel / Node host environment.
- **Database**: MongoDB Atlas cloud cluster.
- **CORS Configuration**: Configured in `server/src/app.ts` to allow requests from Vercel origins.

---

## 23. Implementation Status

### Fully Implemented
- [x] PDF & DOCX file uploads (50MB limit)
- [x] Scanned/empty PDF detection and clear error reporting
- [x] Document library management (list, view, delete)
- [x] Real-time SSE streaming chat with stop generation
- [x] Zero-trust deterministic citation verification engine
- [x] Interactive citation highlighting and page jump navigation
- [x] Large document chunking and monetary pattern retrieval
- [x] Multi-document combined querying
- [x] Clause-level contract comparison with legal significance filtering
- [x] Part C Option 2 Agentic Document Research with tool loop and live timeline
- [x] PII Anonymization toggle with reversible mapping
- [x] Automated Standard Clause Extraction tab
- [x] Web Speech API Voice Input microphone control
- [x] Formatted Answer & Verified Citation Exporter
- [x] Dark / Light mode toggle with state persistence

### Partially Implemented
- None. All core requirements of Parts A, B, and C (Option 2) are fully implemented and verified.

### Not Implemented
- **Part C Option 1 (Tracked-Change Redlining)**: Option 2 was selected instead of Option 1 as permitted by the assignment prompt.

---

## 24. Known Limitations

1. **Scanned PDF OCR**: The app detects and rejects scanned PDFs with unreadable image text. Native Tesseract OCR rasterization is not yet integrated.
2. **DOCX Canvas Coordinates**: Citation highlighting in DOCX files highlights target text passages within the paragraph view rather than rendering pixel canvas overlays.

---

## 25. Security

- **Environment Variables**: API keys are isolated on the server and never exposed to the client.
- **File Validation**: Strict file type (`.pdf`, `.docx`) and file size (50MB) checks prevent malicious file execution.
- **Input Sanitization**: User inputs and search queries are sanitized before database lookup.

---

## 26. Future Improvements

1. Integrate Tesseract OCR for automatic text extraction from scanned PDFs.
2. Implement Word (`.docx`) XML tracked-change redlining (Part C Option 1).
3. Add dense vector embeddings (e.g. `text-embedding-3-small` with Qdrant) for hybrid vector-lexical search.

---

## 27. Evaluator Walkthrough Guide

Follow these steps to evaluate the application:

1. **Upload Contract**: Upload a PDF or DOCX contract using the left sidebar upload button.
2. **View Processing**: Observe the processing status indicator (`uploading` → `ready`).
3. **Ask Question**: Select the uploaded document and ask a question (*"What are the termination conditions?"*).
4. **Observe Streaming**: Watch the answer stream in real-time.
5. **Inspect Verified Citation**: Hover over and view the green verified quote badge.
6. **Test Highlight Navigation**: Click the citation badge; observe the right panel scroll to the exact page and highlight the passage.
7. **Test Multi-Document Chat**: Check multiple contract boxes and ask a comparative question.
8. **Test Contract Comparison**: Click the **Compare Versions** tab, select two contracts, and view clause-level diffs.
9. **Test Agentic Research**: Click the **Agentic Research** tab and ask a complex question to observe the multi-round tool activity timeline.
10. **Test Extras**: Toggle **Anonymize PII**, click **Extract Clauses**, or click **Voice Input**.

---

## 28. Assignment Technical Notes

### 1. How Quote Verification Works & Where It Could Fail
Our verification engine isolates quotes generated by the LLM and runs a two-pass matcher against raw contract text:
- **Pass 1 (Normalized Substring Match)**: Strips tabs, newlines, and double spaces from both document text and quote.
- **Pass 2 (Fuzzy Token Sliding Window)**: Checks character similarity (threshold > 0.88) to catch extraction line wraps.
- *Where It Could Fail*: Extracted text containing severe OCR noise or corrupted character encodings from legacy document generators.

### 2. How Large Documents Are Handled
Contracts are processed into overlapping 500-token chunks tagged with page indices and section headers. Queries utilize BM25 lexical search combined with n-gram tf-idf ranking and monetary pattern boosting.

### 3. Part C Choice & Rationale
We selected **Option 2: Agentic Document Research** because legal contract analysis requires active multi-step investigation—knowing *where* to look across clauses rather than dumping text into a single prompt window.

### 4. Hardest Part of Implementation
The hardest part was implementing **deterministic quote verification across arbitrary PDF page layouts**, ensuring that quotes spanning line wraps or page boundaries map accurately to source document offsets without false rejections.

### 5. What I Would Build Next
1. Native server-side Tesseract OCR for scanned PDFs.
2. Tracked-change Word (`.docx`) XML redlining exporter.
3. Hybrid dense vector + lexical retrieval index.