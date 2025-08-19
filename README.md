# Better RAG

A modern, user-friendly Retrieval-Augmented Generation (RAG) application that allows you to upload documents, links, and text sources, then ask AI-powered questions about your content.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://better-rag.vercel.app/)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## 🌟 Live Demo

**[https://better-rag.vercel.app/](https://better-rag.vercel.app/)**

<img width="1613" height="1279" alt="image" src="https://github.com/user-attachments/assets/cdd2a967-69ed-4d58-bc95-59eb27564453" />


## 📖 Overview

Better RAG is a sophisticated web application that combines document processing with AI-powered question answering. It allows users to upload various types of documents, add web links, YouTube videos, or paste text content, and then interact with an AI that can answer questions based on these sources.

The application uses advanced RAG (Retrieval-Augmented Generation) techniques to provide accurate, context-aware responses by grounding AI answers in your uploaded content rather than general knowledge.

## ✨ Features

### 🔧 Multi-Source Input Support

- **File Upload**: Support for PDF, TXT, CSV, DOCX, and DOC files
- **Web Links**: Add website URLs for processing
- **YouTube Videos**: Process YouTube video content
- **Text Input**: Paste text directly into the application

### 🤖 AI-Powered Chat Interface

- **Context-Aware Responses**: AI answers based on your uploaded sources
- **Real-time Processing**: Instant document processing and chunking
- **Conversation History**: Maintains chat history during your session
- **Smart Source Management**: Automatically enables/disables chat based on available sources

### 🎨 Modern User Interface

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Drag & Drop**: Intuitive file upload with drag and drop support
- **Real-time Feedback**: Toast notifications and loading states
- **Source Counter**: Track your source usage (limit: 50 sources)

### 🔑 Multi-Provider AI Support

- **OpenAI**: GPT models via OpenAI API
- **Anthropic**: Claude models via Anthropic API
- **Groq**: Fast inference via Groq API

## 🚀 How to Use

### 1. **Setup API Keys**

- Click the "API Keys" button in the top-right corner
- Add your API key for at least one provider:
  - OpenAI API key
  - Anthropic API key
  - Groq API key
- Save your configuration

### 2. **Add Sources**

Choose from multiple input methods:

#### **File Upload**

- Drag and drop files or click "choose file"
- Supported formats: PDF, TXT, CSV, DOCX, DOC
- Files are automatically processed and chunked
- Click "Add sources" to confirm

#### **Web Links**

- Switch to "Link" input type
- Enter website URLs
- Press Enter to add each link
- Links are processed automatically

#### **YouTube Videos**

- Switch to "YouTube" input type
- Paste YouTube video URLs
- Press Enter to add videos
- Video content is processed for Q&A

#### **Text Input**

- Switch to "Paste text" input type
- Type or paste your text content
- Click "Add sources" when ready

### 3. **Start Chatting**

- Once sources are added, the chat interface becomes active
- Type your questions in the input field
- Press Enter or click the send button
- AI will answer based on your uploaded sources

### 4. **Manage Sources**

- View all uploaded sources with processing status
- Remove individual sources using the X button
- Use "Clear All" to reset all sources
- Monitor source count (limit: 50 sources)

## 🛠️ Technical Details

### **Built With** 🛠️

- **Frontend**: Next.js 14 with TypeScript ⚛️
- **Styling**: Tailwind CSS with shadcn/ui components 🎨
- **State Management**: Zustand with persistence 🔄
- **AI Integration**: LangChain for document processing 🤖
- **Vector Database**: Qdrant for semantic search and storage 🗄️
- **Deployment**: Vercel 🚀

### **Architecture** 🏗️

- **Client-Side**: React components with modern hooks ⚛️
- **API Routes**: Next.js API routes for document processing 🔌
- **Document Processing**: LangChain document loaders and chunkers 📄
- **Vector Storage**: Qdrant for semantic search and document embeddings 🗄️
- **AI Communication**: Direct API calls to AI providers 🤖
- **File Handling**: Base64 encoding for secure file transmission 🔒

### **Key Components**

- **Document Input Section**: Handles all source input types
- **File Upload**: Drag & drop file management
- **Chat Interface**: AI conversation interface
- **Source Management**: Source tracking and removal
- **API Key Management**: Secure credential storage

## 🔧 Local Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- **Qdrant Vector Database** 🗄️ (running locally)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd rag-app

# Install dependencies
pnpm install

# Set up Qdrant Vector Database
# Option 1: Using Docker (recommended)
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant

# Option 2: Using Docker Compose
# Create docker-compose.yml with:
# version: '3.7'
# services:
#   qdrant:
#     image: qdrant/qdrant
#     ports:
#       - "6333:6333"
#       - "6334:6334"
#     volumes:
#       - ./qdrant_storage:/qdrant/storage
# docker-compose up -d

# Set up environment variables
cp .env.example .env.local
# Add your API keys and Qdrant URL to .env.local

# Run development server
pnpm dev
```

### Environment Variables

```bash
# Add to .env.local
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GROQ_API_KEY=your_groq_key
QDRANT_URL=http://localhost:6333
```

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## 🤝 Contributing

This project is actively maintained. Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Live Application**: [https://better-rag.vercel.app/](https://better-rag.vercel.app/)
- **Built with**: Next.js, Tailwind CSS, shadcn/ui
- **AI Providers**: OpenAI, Anthropic, Groq

---

**Better RAG** - Making document-based AI conversations simple and powerful.
