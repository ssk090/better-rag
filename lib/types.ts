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
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  groq: string;
}

export type InputType = "upload" | "link" | "text" | "youtube";
