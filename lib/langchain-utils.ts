import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { HTMLWebBaseLoader } from "@langchain/community/document_loaders/web/html";
import { HtmlToTextTransformer } from "@langchain/community/document_transformers/html_to_text";
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
        // Use TextLoader or CSVLoader with proper configuration
        if (fileType === "text/csv") {
          try {
            console.log("Processing CSV file:", file.name, "Size:", file.size);

            // First check if file has content by reading it as text
            const fileContent = await this.extractTextFromFile(file);
            console.log("Raw file content check:", {
              contentLength: fileContent.length,
              preview: fileContent.substring(0, 300),
              hasContent: fileContent.trim().length > 0,
            });

            if (!fileContent || fileContent.trim().length === 0) {
              console.warn(
                "CSV file appears to be empty, creating empty document"
              );
              content = "";
              documents = [
                new Document({
                  pageContent: "Empty CSV file",
                  metadata: {
                    source: file.name,
                    fileId,
                    chunkIndex: 0,
                    fileType,
                    timestamp: new Date().toISOString(),
                  },
                }),
              ];
            } else {
              // Try CSVLoader first with proper configuration
              try {
                console.log("Attempting to use CSVLoader...");
                const loader = new CSVLoader(file);
                documents = await loader.load();
                content = documents.map((doc) => doc.pageContent).join("\n\n");

                console.log("CSVLoader result:", {
                  documentCount: documents.length,
                  contentLength: content.length,
                  firstDocument: documents[0]?.pageContent?.substring(0, 100),
                });

                // If CSV loading resulted in empty content, fall back to text extraction
                if (!content || content.trim().length === 0) {
                  console.warn(
                    "CSVLoader returned empty content, falling back to text extraction"
                  );
                  content = fileContent; // Use the already extracted content
                  console.log("Using text extraction result:", {
                    contentLength: content.length,
                    preview: content.substring(0, 200),
                  });
                  // Create a single document from the text content
                  documents = [
                    new Document({
                      pageContent: content,
                      metadata: {
                        source: file.name,
                        fileId,
                        chunkIndex: 0,
                        fileType,
                        timestamp: new Date().toISOString(),
                      },
                    }),
                  ];
                }
              } catch (loaderError) {
                console.warn(
                  "CSVLoader failed, using manual CSV parsing:",
                  loaderError
                );
                // Manual CSV parsing as fallback
                try {
                  const lines = fileContent
                    .split("\n")
                    .filter((line) => line.trim().length > 0);
                  console.log(
                    `Manual parsing: Found ${lines.length} non-empty lines`
                  );

                  if (lines.length > 0) {
                    // Parse headers - handle quoted values properly
                    const headerLine = lines[0];
                    console.log(`Header line: "${headerLine}"`);

                    // Simple CSV parsing that handles basic cases
                    const headers = this.parseCSVLine(headerLine);
                    console.log(`Parsed headers:`, headers);

                    if (headers.length > 0) {
                      // Parse data rows
                      const rows = lines.slice(1).map((line, index) => {
                        const values = this.parseCSVLine(line);
                        return headers
                          .map(
                            (header: string, colIndex: number) =>
                              `${header}: ${values[colIndex] || ""}`
                          )
                          .join(", ");
                      });

                      content = rows.join("\n");
                      console.log(`Parsed ${rows.length} data rows`);
                    } else {
                      // If headers couldn't be parsed, treat as plain text
                      console.warn(
                        "Could not parse CSV headers, treating as plain text"
                      );
                      content = fileContent;
                    }
                  } else {
                    // No non-empty lines found
                    console.warn("No non-empty lines found in CSV");
                    content = fileContent;
                  }

                  // Create document from parsed content
                  documents = [
                    new Document({
                      pageContent: content,
                      metadata: {
                        source: file.name,
                        fileId,
                        chunkIndex: 0,
                        fileType,
                        timestamp: new Date().toISOString(),
                      },
                    }),
                  ];

                  console.log("Manual CSV parsing result:", {
                    contentLength: content.length,
                    preview: content.substring(0, 200),
                  });
                } catch (parseError) {
                  console.warn(
                    "Manual CSV parsing also failed, using raw content:",
                    parseError
                  );
                  // Final fallback: use raw content
                  content = fileContent;
                  documents = [
                    new Document({
                      pageContent: content,
                      metadata: {
                        source: file.name,
                        fileId,
                        chunkIndex: 0,
                        fileType,
                        timestamp: new Date().toISOString(),
                      },
                    }),
                  ];
                }
              }
            }
          } catch (csvError) {
            console.warn(
              "CSVLoader failed, falling back to text extraction:",
              csvError
            );
            // Fallback to text extraction if CSV loading fails
            content = await this.extractTextFromFile(file);
            console.log("Text extraction fallback result:", {
              contentLength: content.length,
              preview: content.substring(0, 200),
            });
            // Create a single document from the text content
            documents = [
              new Document({
                pageContent: content,
                metadata: {
                  source: file.name,
                  fileId,
                  chunkIndex: 0,
                  fileType,
                  timestamp: new Date().toISOString(),
                },
              }),
            ];
          }
        } else {
          // Use TextLoader for plain text files
          const loader = new TextLoader(file);
          documents = await loader.load();
          content = documents.map((doc) => doc.pageContent).join("\n\n");
        }
      } else if (fileType.includes("word") || fileType.includes("docx")) {
        // Use DocxLoader
        const loader = new DocxLoader(file);
        documents = await loader.load();
        content = documents.map((doc) => doc.pageContent).join("\n\n");
      } else if (fileType.includes("doc")) {
        // Use DocLoader
        const loader = new DocxLoader(file, { type: "doc" });
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

      // Final validation - ensure we have content
      if (!content || content.trim().length === 0) {
        console.warn(
          `File ${file.name} has no content after processing, creating placeholder`
        );
        content = `Empty or unreadable file: ${file.name}`;
        if (documents.length === 0) {
          documents = [
            new Document({
              pageContent: content,
              metadata: {
                source: file.name,
                fileId,
                chunkIndex: 0,
                fileType,
                timestamp: new Date().toISOString(),
              },
            }),
          ];
        }
      }

      console.log(`Final processing result for ${file.name}:`, {
        contentLength: content.length,
        documentCount: documents.length,
        hasContent: content.trim().length > 0,
      });

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

  // Process a URL and extract HTML content
  async processUrl(url: string, apiKey: string): Promise<ProcessedDocument> {
    try {
      const urlId = `url-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log(`Processing URL: ${url}`);

      // Use HTMLWebBaseLoader to fetch and load the HTML content
      const loader = new HTMLWebBaseLoader(url);
      const htmlDocs = await loader.load();

      if (!htmlDocs || htmlDocs.length === 0) {
        throw new Error(`Failed to load content from URL: ${url}`);
      }

      console.log(`HTML loader returned ${htmlDocs.length} documents`);

      // Use HtmlToTextTransformer to convert HTML to clean text
      const transformer = new HtmlToTextTransformer();
      const textDocs = await transformer.invoke(htmlDocs);

      if (!textDocs || textDocs.length === 0) {
        throw new Error(`Failed to transform HTML to text from URL: ${url}`);
      }

      console.log(`Text transformer returned ${textDocs.length} documents`);

      // Combine all text content
      const content = textDocs.map((doc) => doc.pageContent).join("\n\n");

      if (!content || content.trim().length === 0) {
        throw new Error(`No content extracted from URL: ${url}`);
      }

      console.log(`Extracted content length: ${content.length} characters`);

      // Split the content into chunks
      const chunks = await this.textSplitter.splitText(content);

      // Create LangChain documents with proper metadata
      const documents = chunks.map(
        (chunk, index) =>
          new Document({
            pageContent: chunk,
            metadata: {
              source: url,
              fileId: urlId,
              chunkIndex: index,
              fileType: "text/html",
              timestamp: new Date().toISOString(),
            },
          })
      );

      // Generate summary
      const summary = this.generateSummary(content, documents.length);

      return {
        id: urlId,
        name: url,
        type: "text/html",
        size: content.length,
        content,
        chunks: documents,
        processed: true,
        summary,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to process URL ${url}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Process multiple URLs
  async processUrls(
    urls: string[],
    apiKey: string
  ): Promise<FileProcessingResult> {
    try {
      const processedDocuments: ProcessedDocument[] = [];
      const failedUrls: string[] = [];

      for (const url of urls) {
        try {
          const processed = await this.processUrl(url, apiKey);
          processedDocuments.push(processed);
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          failedUrls.push(
            `${url}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          // Continue with other URLs
        }
      }

      if (processedDocuments.length === 0 && failedUrls.length > 0) {
        return {
          success: false,
          documents: [],
          error: `All URLs failed to process: ${failedUrls.join("; ")}`,
        };
      }

      return {
        success: true,
        documents: processedDocuments,
        error:
          failedUrls.length > 0
            ? `Some URLs failed: ${failedUrls.join("; ")}`
            : undefined,
      };
    } catch (error) {
      console.error("Critical error in processUrls:", error);
      return {
        success: false,
        documents: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Process multiple files
  async processFiles(
    files: File[],
    apiKey: string
  ): Promise<FileProcessingResult> {
    try {
      const processedDocuments: ProcessedDocument[] = [];
      const failedFiles: string[] = [];

      for (const file of files) {
        try {
          const processed = await this.processFile(file, apiKey);
          processedDocuments.push(processed);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          failedFiles.push(
            `${file.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          // Continue with other files
        }
      }
      if (processedDocuments.length === 0 && failedFiles.length > 0) {
        return {
          success: false,
          documents: [],
          error: `All files failed to process: ${failedFiles.join("; ")}`,
        };
      }

      return {
        success: true,
        documents: processedDocuments,
        error:
          failedFiles.length > 0
            ? `Some files failed: ${failedFiles.join("; ")}`
            : undefined,
      };
    } catch (error) {
      console.error("Critical error in processFiles:", error);
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
    // For server-side processing, we need to handle the file differently
    // since FileReader is not available in Node.js

    try {
      // Convert File to Buffer/ArrayBuffer for server-side processing
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Try to decode as UTF-8 text
      const text = buffer.toString("utf8");

      console.log(`Text extraction from ${file.name}:`, {
        bufferLength: buffer.length,
        textLength: text.length,
        preview: text.substring(0, 200),
      });

      return text;
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error);
      throw new Error(
        `Failed to read file content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Generate a summary of the document
  private generateSummary(content: string, chunkCount: number): string {
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;

    return `Document processed successfully. Contains ${wordCount} words, ${charCount} characters, split into ${chunkCount} chunks for optimal AI processing.`;
  }

  // Parse a CSV line, handling quoted values
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add the last field
    result.push(current.trim());

    return result;
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
