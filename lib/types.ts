export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  processed?: boolean;
  chunks?: number;
  summary?: string;
}

export interface ProcessedDocumentResult {
  id: string;
  name: string;
  type: string;
  size: number;
  processed: boolean;
  chunks: number;
  summary: string;
  timestamp: string;
  content: string;
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  groq: string;
}

export type InputType = "upload" | "link" | "text" | "youtube";
