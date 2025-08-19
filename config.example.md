# Environment Configuration

Create a `.env.local` file in your project root with the following variables:

## AI Provider API Keys

```bash
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GROQ_API_KEY=gsk-your-groq-key-here
```

## Vector Database Configuration

```bash
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=rag-documents
```

## Optional: Default API keys for development

```bash
NEXT_PUBLIC_DEFAULT_OPENAI_KEY=sk-your-openai-key-here
NEXT_PUBLIC_DEFAULT_ANTHROPIC_KEY=sk-ant-your-anthropic-key-here
NEXT_PUBLIC_DEFAULT_GROQ_KEY=gsk-your-groq-key-here
```

## Setup Instructions

1. **Install Qdrant Vector Database:**

   ```bash
   # Using Docker (recommended)
   docker run -p 6333:6333 qdrant/qdrant

   # Or download from https://qdrant.tech/documentation/quick-start/
   ```

2. **Get API Keys:**

   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/
   - Groq: https://console.groq.com/

3. **Start the application:**
   ```bash
   pnpm run dev
   ```

## Supported File Types

- **PDF** (`.pdf`) - Text extraction and processing
- **Text** (`.txt`) - Plain text documents
- **CSV** (`.csv`) - Tabular data processing
- **Word** (`.doc`, `.docx`) - Microsoft Word documents
