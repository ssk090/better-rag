# RAG Application API Documentation

This document explains how to use the API endpoints in your Next.js RAG application.

## 🚀 **API Endpoints**

### **1. RAG Question Answering**

**Endpoint:** `POST /api/rag`

**Purpose:** Ask questions and get AI-powered answers based on your sources.

**Request Body:**

```json
{
  "question": "What is the main topic of the document?",
  "sources": [
    {
      "id": "file-1",
      "type": "file",
      "name": "document.pdf",
      "content": "Document content here..."
    }
  ],
  "apiKey": "your-api-key-here",
  "provider": "openai"
}
```

**Response:**

```json
{
  "success": true,
  "answer": "Based on your document, the main topic is...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "sources": [
    {
      "id": "file-1",
      "type": "file",
      "name": "document.pdf"
    }
  ]
}
```

### **2. Document Processing**

**Endpoint:** `POST /api/documents`

**Purpose:** Process uploaded documents for AI analysis.

**Request Body:**

```json
{
  "documents": [
    {
      "id": "file-1",
      "name": "document.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "content": "Document content..."
    }
  ],
  "apiKey": "your-api-key-here",
  "provider": "openai"
}
```

**Response:**

```json
{
  "success": true,
  "documents": [
    {
      "id": "file-1",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1024000,
      "processed": true,
      "chunks": 15,
      "summary": "Processed PDF document 'document.pdf'",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 **AI Provider Integration**

### **Supported Providers**

1. **OpenAI** (`openai`)

   - Models: GPT-4, GPT-3.5-turbo
   - API Key Format: `sk-...`
   - Endpoint: `https://api.openai.com/v1/chat/completions`

2. **Anthropic** (`anthropic`)

   - Models: Claude-3-Haiku, Claude-3-Sonnet
   - API Key Format: `sk-ant-...`
   - Endpoint: `https://api.anthropic.com/v1/messages`

3. **Groq** (`groq`)
   - Models: Llama-3-8B, Mixtral-8x7B
   - API Key Format: `gsk_...`
   - Endpoint: `https://api.groq.com/openai/v1/chat/completions`

### **Provider Selection**

The API automatically selects the first available API key:

```typescript
const apiKey = apiKeys.openai || apiKeys.anthropic || apiKeys.groq;
```

You can make this configurable by adding a provider selector in the UI.

### **LangChain Integration**

The application now uses **LangChain.js** for:
- **Document Processing**: Automatic text extraction and chunking
- **Vector Embeddings**: OpenAI text-embedding-3-large model
- **Vector Storage**: Qdrant vector database integration
- **Semantic Search**: Intelligent document retrieval
- **RAG Pipeline**: Complete retrieval-augmented generation

## 📁 **File Structure**

```
app/
├── api/
│   ├── rag/
│   │   └── route.ts          # RAG question answering with LangChain
│   └── documents/
│       └── route.ts          # Document processing with LangChain
├── components/                # UI components
├── lib/
│   ├── api.ts               # API client utilities
│   ├── ai-providers.ts      # AI provider integrations
│   ├── langchain-utils.ts   # LangChain processing utilities
│   ├── store.ts             # Zustand state management
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Utility functions
└── page.tsx                 # Main application
```

## 🛠️ **How to Use**

### **1. Frontend Integration**

The Zustand store automatically handles API calls:

```typescript
import { useRAGStore } from "@/lib/store";

const { askQuestionWithAI, processDocumentsWithAI } = useRAGStore();

// Ask a question
await askQuestionWithAI("What is this document about?");

// Process documents
await processDocumentsWithAI();
```

### **2. Direct API Calls**

You can also call the API directly:

```typescript
import { askQuestion, processDocuments } from "@/lib/api";

// Ask a question
const response = await askQuestion({
  question: "What is the main topic?",
  sources: [{ id: "1", type: "file", name: "doc.pdf", content: "..." }],
  apiKey: "your-key",
  provider: "openai",
});

// Process documents
const result = await processDocuments({
  documents: [file1, file2],
  apiKey: "your-key",
  provider: "openai",
});
```

### **3. Error Handling**

The API includes comprehensive error handling:

```typescript
try {
  const response = await askQuestion(request);
  // Handle success
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## 🔒 **Security Considerations**

1. **API Key Storage**: Keys are stored in localStorage (client-side only)
2. **Input Validation**: All inputs are validated before processing
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **CORS**: Configure CORS if calling from external domains

## 🚀 **Production Deployment**

### **Environment Variables**

Create a `.env.local` file:

```bash
# Optional: Set default API keys for development
NEXT_PUBLIC_DEFAULT_OPENAI_KEY=sk-...
NEXT_PUBLIC_DEFAULT_ANTHROPIC_KEY=sk-ant-...
NEXT_PUBLIC_DEFAULT_GROQ_KEY=gsk_...
```

### **Vercel Deployment**

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### **Custom Domain**

1. Configure your domain in Vercel
2. Update CORS settings if needed
3. Set up SSL certificates (automatic with Vercel)

## 📄 **Supported File Types**

The application now supports comprehensive document processing:

- **PDF** (`.pdf`) - Text extraction and processing
- **Text** (`.txt`) - Plain text documents

- **CSV** (`.csv`) - Tabular data processing
- **Word** (`.doc`, `.docx`) - Microsoft Word documents

All files are automatically:
- **Chunked** into optimal sizes (1000 chars with 200 char overlap)
- **Embedded** using OpenAI's text-embedding-3-large model
- **Stored** in Qdrant vector database for semantic search
- **Indexed** for fast retrieval during question answering

## 🔮 **Future Enhancements**

1. **Advanced Vector Search**: Hybrid search with filters and metadata
2. **Streaming Responses**: Real-time AI responses
3. **Multi-modal Support**: Handle images, audio, and video
4. **Advanced Chunking**: Intelligent document segmentation based on content
5. **Caching**: Cache AI responses and embeddings for better performance
6. **Analytics**: Track usage, performance metrics, and search quality
7. **Document Versioning**: Track changes and updates to documents
8. **Collaborative Features**: Share and collaborate on document collections

## 📚 **Additional Resources**

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [LangChain.js Documentation](https://js.langchain.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Groq API Documentation](https://console.groq.com/docs)
- [Qdrant Vector Database](https://qdrant.tech/documentation/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

## 🆘 **Troubleshooting**

### **Common Issues**

1. **API Key Errors**: Ensure your API key is valid and has sufficient credits
2. **CORS Issues**: Check if your domain is allowed to make requests
3. **Rate Limiting**: Implement delays between requests if hitting rate limits
4. **File Size Limits**: Large files may need chunking or compression

### **Debug Mode**

Enable debug logging in development:

```typescript
// In your API routes
console.log("Request body:", body);
console.log("API Key:", apiKey);
console.log("Provider:", provider);
```

---

**Happy coding! 🚀**

For questions or issues, check the GitHub repository or create an issue.
