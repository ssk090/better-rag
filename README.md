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
- **YouTube Videos**: Process YouTube video content with automatic transcript extraction
- **Text Input**: Paste text directly into the application

### 🤖 Advanced AI-Powered Chat Interface

- **Context-Aware Responses**: AI answers based on your uploaded sources
- **Real-time Processing**: Instant document processing and chunking
- **Conversation History**: Maintains chat history during your session
- **Smart Source Management**: Automatically enables/disables chat based on available sources
- **Streaming Responses**: Real-time AI response streaming for better user experience
- **Multi-Provider Support**: Switch between OpenAI, Anthropic, and Groq seamlessly

### 🎨 Enhanced User Interface & Experience

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Drag & Drop**: Intuitive file upload with drag and drop support
- **Real-time Feedback**: Toast notifications and loading states
- **Source Counter**: Track your source usage (limit: 50 sources)
- **Theme Support**: Light/dark mode with theme provider
- **Smooth Animations**: Motion-based UI transitions and micro-interactions
- **Magic UI Components**: Advanced UI elements including flickering grid and hyper-text effects

### 🔑 Multi-Provider AI Support

- **OpenAI**: GPT models via OpenAI API
- **Anthropic**: Claude models via Anthropic API
- **Groq**: Fast inference via Groq API
- **API Key Management**: Secure credential storage with persistent state

### 📚 Advanced Document Processing

- **Intelligent Chunking**: Recursive character text splitting with configurable parameters
- **Vector Database Integration**: Qdrant vector store for semantic search
- **Document Summarization**: Automatic content summarization for better context
- **Metadata Extraction**: Rich metadata from various document types
- **Batch Processing**: Handle multiple documents simultaneously

### 🎥 YouTube Video Processing

- **Automatic Transcript Extraction**: Extract transcripts from YouTube videos
- **Video Metadata**: Extract title, description, duration, view count, and upload date
- **Language Support**: Multi-language transcript processing
- **URL Validation**: Smart YouTube URL validation and processing
- **Transcript Analysis**: Word count and content analysis

### 🌐 Web Content Processing

- **HTML to Text Conversion**: Clean text extraction from web pages
- **URL Validation**: Smart URL validation and error handling
- **Content Processing**: Automatic web content chunking and summarization
- **Metadata Extraction**: Extract relevant information from web pages

### 💬 Enhanced Chat Features

- **Markdown Support**: Rich text formatting with ReactMarkdown
- **Code Syntax Highlighting**: Syntax highlighting for multiple programming languages
- **Copy to Clipboard**: One-click code copying with visual feedback
- **Language Detection**: Automatic language detection for code blocks
- **Line Numbers**: Code block line numbering for better readability
- **Auto-scroll**: Automatic chat scrolling to latest messages
- **Message Timestamps**: Real-time message timestamps
- **Avatar System**: User and AI avatars with fallback icons

### 🔍 Advanced Search & Retrieval

- **Semantic Search**: Vector-based similarity search using embeddings
- **Context Enhancement**: Combine uploaded sources with vector database results
- **Relevant Chunk Retrieval**: Intelligent document chunk selection
- **Hybrid Search**: Combine source content with semantic search results

### 🛡️ Security & Performance

- **Base64 File Handling**: Secure file transmission and processing
- **Error Handling**: Comprehensive error handling and user feedback
- **Rate Limiting**: Built-in protection against abuse
- **Memory Management**: Efficient document processing and storage
- **Persistent State**: Zustand-based state management with persistence

### 📱 Responsive & Accessible Design

- **Mobile-First**: Optimized for mobile and tablet devices
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Touch-Friendly**: Optimized touch interactions for mobile devices

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
- Links are processed automatically with HTML to text conversion

#### **YouTube Videos**

- Switch to "YouTube" input type
- Paste YouTube video URLs
- Press Enter to extract transcripts
- Video content is automatically processed for Q&A
- View video metadata including duration, language, and upload date

#### **Text Input**

- Switch to "Paste text" input type
- Type or paste your text content
- Click "Add sources" when ready

### 3. **Start Chatting**

- Once sources are added, the chat interface becomes active
- Type your questions in the input field
- Press Enter or click the send button
- AI will answer based on your uploaded sources
- Enjoy rich markdown formatting and code syntax highlighting

### 4. **Manage Sources**

- View all uploaded sources with processing status
- Remove individual sources using the X button
- Use "Clear All" to reset all sources
- Monitor source count (limit: 50 sources)
- Track processing status and chunk counts

### 5. **Advanced Features**

- **Code Copying**: Click the copy button on any code block
- **Markdown Rendering**: Rich text formatting with tables, lists, and links
- **Syntax Highlighting**: Beautiful code highlighting for multiple languages
- **Auto-scroll**: Chat automatically scrolls to new messages
- **Theme Switching**: Toggle between light and dark modes

## 🛠️ Technical Details

### **Built With** 🛠️

- **Frontend**: Next.js 14 with TypeScript ⚛️
- **Styling**: Tailwind CSS with shadcn/ui components 🎨
- **State Management**: Zustand with persistence 🔄
- **AI Integration**: LangChain for document processing 🤖
- **Vector Database**: Qdrant for semantic search and storage 🗄️
- **Deployment**: Vercel 🚀
- **Animations**: Motion (Framer Motion) for smooth transitions ✨

### **Architecture** 🏗️

- **Client-Side**: React components with modern hooks ⚛️
- **API Routes**: Next.js API routes for document processing 🔌
- **Document Processing**: LangChain document loaders and chunkers 📄
- **Vector Storage**: Qdrant for semantic search and document embeddings 🗄️
- **AI Communication**: Direct API calls to AI providers 🤖
- **File Handling**: Base64 encoding for secure file transmission 🔒
- **State Persistence**: Zustand with localStorage persistence 💾

### **Key Components**

- **Document Input Section**: Handles all source input types with type switching
- **File Upload**: Drag & drop file management with progress tracking
- **Chat Interface**: Advanced AI conversation interface with markdown support
- **Source Management**: Source tracking, removal, and status monitoring
- **API Key Management**: Secure credential storage and provider switching
- **YouTube Input**: Specialized YouTube video processing interface
- **Link Input**: Web URL processing with validation
- **Text Input**: Direct text input and processing
- **Magic UI Components**: Advanced UI elements for enhanced user experience

### **Advanced Features**

- **Recursive Text Splitting**: Intelligent document chunking with configurable parameters
- **Embedding Generation**: OpenAI text-embedding-3-large for semantic search
- **Vector Similarity Search**: Advanced document retrieval using Qdrant
- **Streaming Responses**: Real-time AI response streaming
- **Error Recovery**: Comprehensive error handling and user feedback
- **Performance Optimization**: Efficient document processing and memory management

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

### **Development Features**

- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting
- **Component Library**: Reusable UI components with shadcn/ui

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers
- Progressive Web App (PWA) ready

## 🚀 Performance Features

- **Lazy Loading**: Components load on demand
- **Optimized Bundles**: Tree shaking and code splitting
- **Efficient Rendering**: React optimization and memoization
- **Fast Processing**: Optimized document chunking and processing
- **Memory Management**: Efficient state management and cleanup

## 🔒 Security Features

- **API Key Protection**: Secure credential storage
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error messages without information leakage
- **File Type Validation**: Strict file type checking
- **URL Validation**: Smart URL validation and sanitization

## 🤝 Contributing

This project is actively maintained. Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation
- Add new AI providers
- Enhance UI components

### **Development Guidelines**

- Follow TypeScript best practices
- Use conventional commit messages
- Maintain component consistency
- Add proper error handling
- Include comprehensive testing

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- **Live Application**: [https://better-rag.vercel.app/](https://better-rag.vercel.app/)
- **Built with**: Next.js, Tailwind CSS, shadcn/ui, LangChain
- **AI Providers**: OpenAI, Anthropic, Groq
- **Vector Database**: Qdrant
- **State Management**: Zustand

---

**Better RAG** - Making document-based AI conversations simple, powerful, and beautiful.

_Transform your documents into intelligent conversations with the most advanced RAG application available._
