# Legal Contract Analyzer ⚖️

An enterprise-grade Legal Contract Analysis web application built with **Next.js**, **Express.js**, **TypeScript**, **MongoDB**, **Mongoose**, and **OpenAI API**.

The application enables legal teams to upload PDF and DOCX contracts, query single or multiple agreements, receive real-time streaming AI answers with **deterministic citation verification**, perform side-by-side contract comparison, and run multi-round agentic document research.

---

## 🌟 Key Features

### 1. Document Upload & Processing
- **PDF & DOCX Support**: Client-side and server-side file validation for PDF and DOCX documents up to 50MB.
- **Scanned PDF Detection**: Identifies image-only or unreadable PDFs and provides clear, actionable feedback ("*This PDF does not contain readable text. Please upload a text-based PDF or DOCX.*").
- **Page & Chunk Mapping**: Extracts text, preserves page boundaries, and splits documents into clauses/chunks with metadata (`documentId`, `pageNumber`, `chunkIndex`, `section`, `text`).

### 2. Deterministic Citation Verification ⭐ *(Core Feature)*
- **Independent Backend Verification**: AI-generated quotes are independently verified by the Express backend against actual contract text before being presented to the user.
- **Whitespace Normalization**: Handles tabs, line wraps, multiple spaces, and extraction artifacts to match quotes accurately.
- **Interactive Highlight Navigation**: Clicking a verified quote card opens the target document in the viewer, jumps to the exact page, scrolls to the passage, and highlights the source text in yellow.

### 3. Multi-Document Contract Chat
- **Streaming Responses**: Progressive SSE (Server-Sent Events) streaming for real-time answer generation.
- **Stop Generation**: Immediate cancellation via `AbortController` while retaining partial response history.
- **Multi-Document Analysis**: Select multiple contracts simultaneously to compare terms or analyze combined obligations.

### 4. Clause-Level Contract Comparison
- **Substantive Difference Engine**: Compares two versions of a contract at section, paragraph, and clause level.
- **Smart Change Detection**: Identifies added, removed, and modified clauses, detecting major financial changes (e.g., `AED 100,000` → `AED 1,000,000`) and obligation shifts.
- **Significance Filtering**: Filter differences by `High`, `Medium`, or `Low` legal significance.

### 5. Agentic Multi-Round Document Research
- **Tool-Calling System**: Autonomous agent executing up to 6 rounds of tool calls (`list_clauses`, `search_document`, `get_section`, `synthesize_research`).
- **Live Progress Timeline**: Visual activity feed showing step-by-step progress (*✓ Searching for termination provisions*, *✓ Reviewing Section 12*, etc.).

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                     │
│    React 18 | TypeScript | Tailwind CSS | Lucide Icons │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / SSE Streaming
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Express.js API                       │
│           Controllers | Services | Middleware           │
├───────────────┬───────────────────┬─────────────────────┤
│ MongoDB       │ Document Engine   │ Citation Verification│
│ (Mongoose)    │ (PDF/DOCX Parser) │ & AI Streaming      │
└───────────────┴───────────────────┴─────────────────────┘
```

---

## 🚀 Environment Variables Setup

Create a `.env` file in the root directory (and `server/.env`):

```env
MONGODB_URI=mongodb://localhost:27017/legal-contract-analyzer
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
MAX_AGENT_ROUNDS=6
```

*Note: If `OPENAI_API_KEY` is not set, the system automatically uses an intelligent local fallback reasoning engine to maintain full application functionality.*

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `v20.x` or higher
- MongoDB running locally on `mongodb://localhost:27017`

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Start Backend Server
```bash
npm run dev:server
# Server runs on http://localhost:5000
```

### 3. Start Next.js Frontend
```bash
npm run dev:client
# Frontend runs on http://localhost:3000
```

---

## 🧪 Running Automated Tests

Run server unit tests for citation verification, text normalization, and contract comparison:

```bash
npm test
```

---

## 📚 Production Build & Verification

```bash
# Build server TypeScript
npm run build:server

# Build Next.js production bundle
npm run build:client
```

---

## 🔒 Limitations & Future Improvements
- **OCR Integration**: Add Tesseract OCR for scanned PDF support.
- **Vector Embeddings**: Extend BM25 lexical search with dense vector embeddings (e.g. `text-embedding-3-small`).
- **Export Reports**: PDF export for contract comparison summaries and audit reports.