import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

export interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  chunks: Document[];
  processed: boolean;
  summary: string;
  timestamp: string;
}

export interface FileProcessingResult {
  success: boolean;
  documents: ProcessedDocument[];
  error?: string;
}

// Supported file types and their loaders
export const SUPPORTED_FILE_TYPES = {
  "application/pdf": PDFLoader,
  "text/plain": TextLoader,
  "text/csv": CSVLoader,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    DocxLoader,
  "application/msword": DocxLoader,
} as const;

// Type for supported file types
export type SupportedFileType = keyof typeof SUPPORTED_FILE_TYPES;

// File type extensions mapping
export const FILE_EXTENSIONS = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
} as const;

export class LangChainProcessor {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: QdrantVectorStore | null = null;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(apiKey: string) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-large",
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", " ", ""],
    });
  }

  // Initialize vector store connection
  async initializeVectorStore(collectionName: string = "rag-documents") {
    try {
      this.vectorStore = await QdrantVectorStore.fromExistingCollection(
        this.embeddings,
        {
          url: process.env.QDRANT_URL || "http://localhost:6333",
          collectionName,
        }
      );
      return true;
    } catch (error) {
      console.error("Failed to initialize vector store:", error);
      return false;
    }
  }

  // Process a single file
  async processFile(file: File, apiKey: string): Promise<ProcessedDocument> {
    try {
      // Use the original ID if available, otherwise generate a new one
      const fileId =
        (file as any).originalId ||
        `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fileType = this.getFileType(file);

      if (!this.isFileTypeSupported(fileType)) {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Use LangChain loaders directly based on file type
      let content = "";
      let documents: Document[] = [];

      if (fileType === "application/pdf") {
        // Use PDFLoader directly
        const loader = new PDFLoader(file);
        documents = await loader.load();
        content = documents.map((doc) => doc.pageContent).join("\n\n");
      } else if (fileType === "text/plain" || fileType === "text/csv") {
        // Use TextLoader or CSVLoader
        const loader =
          fileType === "text/csv" ? new CSVLoader(file) : new TextLoader(file);
        documents = await loader.load();
        content = documents.map((doc) => doc.pageContent).join("\n\n");
      } else if (fileType.includes("word") || fileType.includes("docx")) {
        // Use DocxLoader
        const loader = new DocxLoader(file);
        documents = await loader.load();
        content = documents.map((doc) => doc.pageContent).join("\n\n");
      } else {
        // Fallback to text extraction
        content = await this.extractTextFromFile(file);
        // Split text into chunks
        const chunks = await this.textSplitter.splitText(content);
        // Create LangChain documents
        documents = chunks.map(
          (chunk, index) =>
            new Document({
              pageContent: chunk,
              metadata: {
                source: file.name,
                fileId,
                chunkIndex: index,
                fileType,
                timestamp: new Date().toISOString(),
              },
            })
        );
      }

      // If we got documents from loaders, create chunks from them
      if (documents.length > 0 && !documents[0].metadata.chunkIndex) {
        // Documents came from loaders, need to split them
        const allText = documents.map((doc) => doc.pageContent).join("\n\n");
        const chunks = await this.textSplitter.splitText(allText);

        // Create new documents with proper metadata
        documents = chunks.map(
          (chunk, index) =>
            new Document({
              pageContent: chunk,
              metadata: {
                source: file.name,
                fileId,
                chunkIndex: index,
                fileType,
                timestamp: new Date().toISOString(),
              },
            })
        );
      }

      // Generate summary
      const summary = this.generateSummary(content, documents.length);

      return {
        id: fileId,
        name: file.name,
        type: fileType,
        size: file.size,
        content,
        chunks: documents,
        processed: true,
        summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to process file ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Process multiple files
  async processFiles(
    files: File[],
    apiKey: string
  ): Promise<FileProcessingResult> {
    try {
      const processedDocuments: ProcessedDocument[] = [];

      for (const file of files) {
        try {
          const processed = await this.processFile(file, apiKey);
          console.log("processed", processed);
          processedDocuments.push(processed);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          // Continue with other files
        }
      }

      return {
        success: true,
        documents: processedDocuments,
      };
    } catch (error) {
      return {
        success: false,
        documents: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Store documents in vector database
  async storeDocuments(
    documents: ProcessedDocument[],
    collectionName: string = "rag-documents"
  ) {
    try {
      if (!this.vectorStore) {
        const initialized = await this.initializeVectorStore(collectionName);
        if (!initialized) {
          throw new Error("Failed to initialize vector store");
        }
      }

      // Flatten all chunks from all documents
      const allChunks: Document[] = [];
      documents.forEach((doc) => {
        allChunks.push(...doc.chunks);
      });

      if (allChunks.length === 0) {
        throw new Error("No chunks to store");
      }

      // Store in vector database
      if (!this.vectorStore) {
        throw new Error("Vector store not initialized");
      }
      await this.vectorStore.addDocuments(allChunks);

      return {
        success: true,
        storedChunks: allChunks.length,
        message: `Successfully stored ${allChunks.length} chunks in vector database`,
      };
    } catch (error) {
      throw new Error(
        `Failed to store documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Search for relevant documents
  async searchDocuments(query: string, k: number = 5) {
    try {
      if (!this.vectorStore) {
        throw new Error("Vector store not initialized");
      }

      const results = await this.vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      throw new Error(
        `Search failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get file type from file object
  private getFileType(file: File): string {
    // First try to get from MIME type
    if (file.type && file.type !== "application/octet-stream") {
      return file.type;
    }

    // Fallback to file extension
    const extension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    const mappedType =
      FILE_EXTENSIONS[extension as keyof typeof FILE_EXTENSIONS];
    return mappedType || "unknown";
  }

  // Check if file type is supported
  private isFileTypeSupported(fileType: string): boolean {
    // Check if it's a supported MIME type
    if (Object.keys(SUPPORTED_FILE_TYPES).includes(fileType)) {
      return true;
    }

    // Check if it's a supported file extension
    const supportedExtensions = Object.keys(FILE_EXTENSIONS);
    return supportedExtensions.some((ext) => fileType.includes(ext));
  }

  // Extract text content from different file types (fallback method)
  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as text"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  // Generate a summary of the document
  private generateSummary(content: string, chunkCount: number): string {
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;

    return `Document processed successfully. Contains ${wordCount} words, ${charCount} characters, split into ${chunkCount} chunks for optimal AI processing.`;
  }
}

// Utility function to create processor instance
export function createLangChainProcessor(apiKey: string): LangChainProcessor {
  return new LangChainProcessor(apiKey);
}

// Utility function to check if file is supported
export function isFileSupported(file: File): boolean {
  const fileType = file.type;
  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));

  // Check MIME type
  const supportedMimeTypes = getSupportedMimeTypes();
  if (supportedMimeTypes.includes(fileType)) {
    return true;
  }

  // Check file extension
  const supportedExtensions = getSupportedFileExtensions();
  return supportedExtensions.includes(extension);
}

// Get supported file extensions for UI display
export function getSupportedFileExtensions(): string[] {
  return [".pdf", ".txt", ".csv", ".docx", ".doc"];
}

// Get supported MIME types for file input
export function getSupportedMimeTypes(): string[] {
  return [
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
}
