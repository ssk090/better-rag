import { Message, UploadedFile } from "./types";

const API_BASE_URL = "/api";

export interface RAGRequest {
  question: string;
  sources: Array<{
    id: string;
    type: string;
    name: string;
    content?: string;
  }>;
  apiKey: string;
  provider?: "openai" | "anthropic" | "groq";
}

export interface RAGResponse {
  success: boolean;
  answer: string;
  timestamp: string;
  sources: Array<{
    id: string;
    type: string;
    name: string;
  }>;
}

export interface DocumentProcessingRequest {
  documents: UploadedFile[];
  apiKey: string;
  provider?: "openai" | "anthropic" | "groq";
}

export interface DocumentProcessingResponse {
  success: boolean;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    processed: boolean;
    chunks: number;
    summary: string;
    timestamp: string;
  }>;
  timestamp: string;
}

export interface URLProcessingRequest {
  urls: string[];
  apiKey: string;
  provider?: "openai" | "anthropic" | "groq";
}

export interface URLProcessingResponse {
  success: boolean;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    processed: boolean;
    chunks: number;
    summary: string;
    timestamp: string;
  }>;
  timestamp: string;
}

export class APIError extends Error {
  constructor(message: string, public status: number, public response?: any) {
    super(message);
    this.name = "APIError";
  }
}

export async function askQuestion(request: RAGRequest): Promise<RAGResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500
    );
  }
}

export async function processDocuments(
  request: DocumentProcessingRequest
): Promise<DocumentProcessingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500
    );
  }
}

export async function processUrls(
  request: URLProcessingRequest
): Promise<URLProcessingResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/urls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500
    );
  }
}

// Utility function to extract text content from different file types
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        resolve(content);
      } catch (error) {
        reject(new Error("Failed to read file content"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    if (file.type.includes("text") || file.type.includes("csv")) {
      reader.readAsText(file);
    } else {
      // For binary files like PDFs, you'd need additional processing
      // This is a simplified version
      reader.readAsText(file);
    }
  });
}
