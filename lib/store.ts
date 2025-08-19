import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Message,
  UploadedFile,
  ApiKeys,
  InputType,
  ProcessedDocumentResult,
  YouTubeTranscript,
} from "./types";
import { isYouTubeUrl, isValidUrl } from "./utils";
import { askQuestion, processDocuments, APIError } from "./api";
import { extractYouTubeTranscript } from "./youtube-loader";

interface RAGState {
  // State
  documentText: string;
  messages: Message[];
  currentMessage: string;
  isDocumentSubmitted: boolean;
  inputType: InputType;
  uploadedFiles: UploadedFile[];
  linkUrl: string;
  linkUrls: string[];
  youtubeUrl: string;
  youtubeUrls: string[];
  youtubeTranscripts: YouTubeTranscript[];
  showToast: boolean;
  toastMessage: string;
  apiKeys: ApiKeys;
  isApiKeysDialogOpen: boolean;
  tempApiKeys: ApiKeys;
  SOURCE_LIMIT: number;

  // New state properties
  loading: boolean;
  error: string | null;

  // Actions
  setDocumentText: (text: string) => void;
  setCurrentMessage: (message: string) => void;
  setInputType: (type: InputType) => void;
  setLinkUrl: (url: string) => void;
  setYoutubeUrl: (url: string) => void;
  setShowToast: (show: boolean) => void;
  setToastMessage: (message: string) => void;
  setIsApiKeysDialogOpen: (open: boolean) => void;
  setTempApiKeys: (keys: ApiKeys) => void;
  extractYouTubeTranscript: (url: string) => Promise<void>;
  removeYouTubeTranscript: (id: string) => void;

  saveApiKeys: () => void;
  hasApiKeys: () => boolean;
  handleDocumentSubmit: () => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  removeFile: (fileId: string) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleYoutubeKeyPress: (e: React.KeyboardEvent) => void;
  removeYoutubeUrl: (index: number) => void;
  handleLinkKeyPress: (e: React.KeyboardEvent) => void;
  removeLinkUrl: (index: number) => void;
  clearAllSources: () => void;

  // New API integration actions
  askQuestionWithAI: (question: string) => Promise<void>;
  processDocumentsWithAI: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  readFileAsBase64: (file: File) => Promise<string>;
  processDroppedFiles: (
    originalFiles: File[],
    newFiles: UploadedFile[],
    apiKey: string
  ) => Promise<void>;
  updateFilesWithResults: (result: {
    documents: ProcessedDocumentResult[];
  }) => void;
}

export const useRAGStore = create<RAGState>()(
  persist(
    (set, get) => ({
      // Initial state
      documentText: "",
      messages: [],
      currentMessage: "",
      isDocumentSubmitted: false,
      inputType: "upload" as InputType,
      uploadedFiles: [],
      linkUrl: "",
      linkUrls: [],
      youtubeUrl: "",
      youtubeUrls: [],
      youtubeTranscripts: [],
      showToast: false,
      toastMessage: "",
      apiKeys: {
        openai: "",
        anthropic: "",
        groq: "",
      },
      isApiKeysDialogOpen: false,
      tempApiKeys: {
        openai: "",
        anthropic: "",
        groq: "",
      },
      SOURCE_LIMIT: 50,

      // New state properties
      loading: false,
      error: null,

      // Actions
      setDocumentText: (text) => {
        const state = get();
        const hasRemainingSources =
          state.uploadedFiles.length > 0 ||
          state.linkUrls.length > 0 ||
          state.youtubeUrls.length > 0 ||
          text.trim().length > 0;

        set({
          documentText: text,
          isDocumentSubmitted: hasRemainingSources,
        });
      },
      setCurrentMessage: (message) => set({ currentMessage: message }),
      setInputType: (type) => set({ inputType: type }),
      setLinkUrl: (url) => set({ linkUrl: url }),
      setYoutubeUrl: (url) => set({ youtubeUrl: url }),
      setShowToast: (show) => set({ showToast: show }),
      setToastMessage: (message) => set({ toastMessage: message }),
      setIsApiKeysDialogOpen: (open) => set({ isApiKeysDialogOpen: open }),
      setTempApiKeys: (keys) => set({ tempApiKeys: keys }),

      saveApiKeys: () => {
        const { tempApiKeys } = get();
        set({
          apiKeys: tempApiKeys,
          isApiKeysDialogOpen: false,
          toastMessage: "API keys saved successfully!",
          showToast: true,
        });
      },

      hasApiKeys: () => {
        const { apiKeys } = get();
        return !!(apiKeys.openai || apiKeys.anthropic || apiKeys.groq);
      },

      handleDocumentSubmit: () => {
        const { inputType, documentText, uploadedFiles } = get();

        let hasContent = false;
        const newMessages: Message[] = [];

        if (inputType === "text" && documentText.trim()) {
          hasContent = true;
          const textMessage: Message = {
            id: Date.now().toString(),
            content: `I've processed your text document (${
              documentText.split(" ").length
            } words). I'm ready to answer questions about this content.`,
            isUser: false,
            timestamp: new Date(),
          };
          newMessages.push(textMessage);
        } else if (inputType === "upload" && uploadedFiles.length > 0) {
          hasContent = true;
          uploadedFiles.forEach((file, index) => {
            const fileMessage: Message = {
              id: (Date.now() + index).toString(),
              content: `I've processed "${file.name}". I can now answer questions about this file.`,
              isUser: false,
              timestamp: new Date(),
            };
            newMessages.push(fileMessage);
          });
        }

        if (hasContent) {
          set({
            isDocumentSubmitted: true,
            toastMessage: "Sources added successfully!",
            showToast: true,
          });

          newMessages.forEach((message, index) => {
            setTimeout(() => {
              set((state) => ({ messages: [...state.messages, message] }));
            }, index * 500);
          });
        }
      },

      handleFileUpload: async (event) => {
        const files = event.target.files;
        if (!files) return;

        const { apiKeys } = get();
        const apiKey = apiKeys.openai || apiKeys.anthropic || apiKeys.groq;

        if (!apiKey) {
          set({
            error: "Please configure an API key first",
            showToast: true,
            toastMessage: "API key required for file processing",
          });
          return;
        }

        // Store original File objects for processing
        const originalFiles = Array.from(files);

        // Add files to state immediately for UI feedback
        const newFiles: UploadedFile[] = originalFiles.map((file) => ({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content: "",
          processed: false,
        }));

        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, ...newFiles],
        }));

        // Process files with LangChain
        try {
          set({ loading: true, error: null });

          const response = await fetch("/api/documents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documents: await Promise.all(
                originalFiles.map(async (file, index) => ({
                  ...newFiles[index],
                  content: await get().readFileAsBase64(file),
                }))
              ),
              apiKey,
              provider: "openai",
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to process files: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.success) {
            // Update files with processing results
            get().updateFilesWithResults(result);
          } else {
            throw new Error(result.error || "Failed to process files");
          }
        } catch (error) {
          console.error("File processing error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to process files",
            loading: false,
          });
        }
      },

      // Helper function to read file as base64
      readFileAsBase64: (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else if (reader.result instanceof ArrayBuffer) {
              // For binary files like PDFs, convert to base64
              const bytes = new Uint8Array(reader.result);
              let binary = "";
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64 = btoa(binary);
              const mimeType = file.type || "application/octet-stream";
              resolve(`data:${mimeType};base64,${base64}`);
            } else {
              reject(new Error("Failed to read file"));
            }
          };
          reader.onerror = () => reject(new Error("Failed to read file"));

          // Read as ArrayBuffer for binary files (like PDFs) and as data URL for others
          if (file.type === "application/pdf") {
            reader.readAsArrayBuffer(file);
          } else {
            reader.readAsDataURL(file);
          }
        });
      },

      // Helper function to update files with processing results
      updateFilesWithResults: (result: {
        documents: ProcessedDocumentResult[];
      }) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) => {
            const processed = result.documents.find(
              (d: ProcessedDocumentResult) => d.id === file.id
            );
            return processed ? { ...file, ...processed } : file;
          }),
          loading: false,
          showToast: true,
          toastMessage: `Successfully processed ${result.documents.length} files`,
        }));
      },

      handleDragOver: (e) => {
        e.preventDefault();
      },

      handleDrop: (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files) {
          // Process dropped files directly
          const { apiKeys } = get();
          const apiKey = apiKeys.openai || apiKeys.anthropic || apiKeys.groq;

          if (!apiKey) {
            set({
              error: "Please configure an API key first",
              showToast: true,
              toastMessage: "API key required for file processing",
            });
            return;
          }

          // Add files to state immediately for UI feedback
          const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: "",
            processed: false,
          }));

          set((state) => ({
            uploadedFiles: [...state.uploadedFiles, ...newFiles],
          }));

          // Process files with LangChain
          get().processDroppedFiles(Array.from(files), newFiles, apiKey);
        }
      },

      // Helper function to process dropped files
      processDroppedFiles: async (
        originalFiles: File[],
        newFiles: UploadedFile[],
        apiKey: string
      ) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch("/api/documents", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documents: await Promise.all(
                originalFiles.map(async (file, index) => ({
                  ...newFiles[index],
                  content: await get().readFileAsBase64(file),
                }))
              ),
              apiKey,
              provider: "openai",
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to process files: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.success) {
            // Update files with processing results
            get().updateFilesWithResults(result);
          } else {
            throw new Error(result.error || "Failed to process files");
          }
        } catch (error) {
          console.error("File processing error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to process files",
            loading: false,
          });
        }
      },

      removeFile: (fileId) => {
        set((state) => {
          const newUploadedFiles = state.uploadedFiles.filter(
            (f) => f.id !== fileId
          );
          const hasRemainingSources =
            newUploadedFiles.length > 0 ||
            state.linkUrls.length > 0 ||
            state.youtubeUrls.length > 0 ||
            state.documentText.trim().length > 0;

          return {
            uploadedFiles: newUploadedFiles,
            isDocumentSubmitted: hasRemainingSources,
          };
        });
      },

      handleSendMessage: () => {
        const { currentMessage, isDocumentSubmitted } = get();

        if (currentMessage.trim() && isDocumentSubmitted) {
          const userMessage: Message = {
            id: Date.now().toString(),
            content: currentMessage,
            isUser: true,
            timestamp: new Date(),
          };

          set((state) => ({ messages: [...state.messages, userMessage] }));

          // Use the AI API instead of simulated response
          get().askQuestionWithAI(currentMessage);
          set({ currentMessage: "" });
        }
      },

      handleKeyPress: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          get().handleSendMessage();
        }
      },

      handleYoutubeKeyPress: async (e) => {
        const { youtubeUrl, youtubeTranscripts } = get();

        if (e.key === "Enter" && youtubeUrl.trim()) {
          e.preventDefault();
          const trimmedUrl = youtubeUrl.trim();
          if (isYouTubeUrl(trimmedUrl)) {
            // Check if transcript already exists
            const existingTranscript = youtubeTranscripts.find(
              (transcript) => transcript.url === trimmedUrl
            );

            if (!existingTranscript) {
              // Extract transcript
              await get().extractYouTubeTranscript(trimmedUrl);
            } else {
              set({ youtubeUrl: "" });
              set({
                toastMessage: "Transcript already exists for this video",
                showToast: true,
              });
            }
          } else {
            set({
              error: "Invalid YouTube URL format",
              toastMessage: "Invalid YouTube URL format",
              showToast: true,
            });
          }
        }
      },

      removeYoutubeUrl: (index) => {
        set((state) => {
          const newYoutubeUrls = state.youtubeUrls.filter(
            (_, i) => i !== index
          );
          const hasRemainingSources =
            state.uploadedFiles.length > 0 ||
            state.linkUrls.length > 0 ||
            newYoutubeUrls.length > 0 ||
            state.youtubeTranscripts.length > 0 ||
            state.documentText.trim().length > 0;

          return {
            youtubeUrls: newYoutubeUrls,
            isDocumentSubmitted: hasRemainingSources,
          };
        });
      },

      extractYouTubeTranscript: async (url) => {
        try {
          set({ loading: true, error: null });

          const transcript = await extractYouTubeTranscript(url);

          const youtubeTranscript: YouTubeTranscript = {
            id: `youtube-${Date.now()}`,
            url: transcript.url,
            title: transcript.title,
            description: transcript.description,
            transcript: transcript.transcript,
            metadata: transcript.metadata,
            processed: true,
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            youtubeTranscripts: [
              ...state.youtubeTranscripts,
              youtubeTranscript,
            ],
            loading: false,
            toastMessage: "YouTube transcript extracted successfully!",
            showToast: true,
          }));

          // Add a message to the chat
          const transcriptMessage: Message = {
            id: Date.now().toString(),
            content: `I've extracted the transcript from: ${
              transcript.title || url
            }. The transcript contains ${
              transcript.transcript.split(" ").length
            } words. I can now answer questions about this video content.`,
            isUser: false,
            timestamp: new Date(),
          };

          setTimeout(() => {
            set((state) => ({
              messages: [...state.messages, transcriptMessage],
              isDocumentSubmitted: true,
            }));
          }, 300);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to extract transcript";

          // Provide more user-friendly error messages
          let userMessage = errorMessage;
          if (
            errorMessage.includes("Failed to get YouTube video transcription")
          ) {
            userMessage =
              "This video doesn't have captions or they are disabled. Please try a different video.";
          } else if (errorMessage.includes("Invalid YouTube URL")) {
            userMessage = "Please enter a valid YouTube URL.";
          } else if (errorMessage.includes("No transcript found")) {
            userMessage =
              "No transcript found for this video. Please try a different video.";
          } else if (errorMessage.includes("fetch")) {
            userMessage =
              "Network error. Please check your connection and try again.";
          }

          set({
            error: userMessage,
            loading: false,
            toastMessage: `Error: ${userMessage}`,
            showToast: true,
          });
        }
      },

      removeYouTubeTranscript: (id) => {
        set((state) => {
          const newTranscripts = state.youtubeTranscripts.filter(
            (transcript) => transcript.id !== id
          );
          const hasRemainingSources =
            state.uploadedFiles.length > 0 ||
            state.linkUrls.length > 0 ||
            state.youtubeUrls.length > 0 ||
            newTranscripts.length > 0 ||
            state.documentText.trim().length > 0;

          return {
            youtubeTranscripts: newTranscripts,
            isDocumentSubmitted: hasRemainingSources,
          };
        });
      },

      handleLinkKeyPress: (e) => {
        const { linkUrl, linkUrls } = get();

        if (e.key === "Enter" && linkUrl.trim()) {
          e.preventDefault();
          const trimmedUrl = linkUrl.trim();
          if (isValidUrl(trimmedUrl)) {
            if (!linkUrls.includes(trimmedUrl)) {
              set({
                linkUrls: [...linkUrls, trimmedUrl],
                linkUrl: "",
              });

              const isYoutube = isYouTubeUrl(trimmedUrl);
              const linkMessage: Message = {
                id: Date.now().toString(),
                content: `I've processed the ${
                  isYoutube ? "YouTube video" : "website"
                }: ${trimmedUrl}. I can now answer questions about this content.`,
                isUser: false,
                timestamp: new Date(),
              };

              setTimeout(() => {
                set((state) => ({
                  messages: [...state.messages, linkMessage],
                  isDocumentSubmitted: true,
                  toastMessage: "Link source added successfully!",
                  showToast: true,
                }));
              }, 300);
            } else {
              set({ linkUrl: "" });
            }
          }
        }
      },

      removeLinkUrl: (index) => {
        set((state) => {
          const newLinkUrls = state.linkUrls.filter((_, i) => i !== index);
          const hasRemainingSources =
            state.uploadedFiles.length > 0 ||
            newLinkUrls.length > 0 ||
            state.youtubeUrls.length > 0 ||
            state.documentText.trim().length > 0;

          return {
            linkUrls: newLinkUrls,
            isDocumentSubmitted: hasRemainingSources,
          };
        });
      },

      clearAllSources: () => {
        set({
          uploadedFiles: [],
          linkUrls: [],
          youtubeUrls: [],
          youtubeTranscripts: [],
          documentText: "",
          isDocumentSubmitted: false,
          messages: [],
          currentMessage: "",
        });
      },

      // New API integration actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      askQuestionWithAI: async (question: string) => {
        const {
          apiKeys,
          uploadedFiles,
          linkUrls,
          youtubeUrls,
          youtubeTranscripts,
          documentText,
        } = get();

        try {
          set({ loading: true, error: null });

          // Determine which API key to use (you can add logic to choose provider)
          const apiKey = apiKeys.openai || apiKeys.anthropic || apiKeys.groq;
          if (!apiKey) {
            throw new Error("No API key configured");
          }

          // Prepare sources
          const sources = [
            ...uploadedFiles.map((file) => ({
              id: file.id,
              type: "file",
              name: file.name,
              content: file.content,
            })),
            ...linkUrls.map((url, index) => ({
              id: `link-${index}`,
              type: "link",
              name: url,
              content: url,
            })),
            ...youtubeTranscripts.map((transcript) => ({
              id: transcript.id,
              type: "youtube",
              name: transcript.title || transcript.url,
              content: transcript.transcript,
            })),
          ];

          if (documentText.trim()) {
            sources.push({
              id: "text",
              type: "text",
              name: "Pasted Text",
              content: documentText,
            });
          }

          if (sources.length === 0) {
            throw new Error("No sources available");
          }

          // Call the API
          const response = await askQuestion({
            question,
            sources,
            apiKey,
            provider: "openai", // You can make this configurable
          });

          // Add the AI response to messages
          const aiMessage: Message = {
            id: Date.now().toString(),
            content: response.answer,
            isUser: false,
            timestamp: new Date(),
          };

          set((state) => ({
            messages: [...state.messages, aiMessage],
            loading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof APIError
              ? error.message
              : "Failed to get AI response";

          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      processDocumentsWithAI: async () => {
        const { apiKeys, uploadedFiles } = get();

        try {
          set({ loading: true, error: null });

          const apiKey = apiKeys.openai || apiKeys.anthropic || apiKeys.groq;
          if (!apiKey) {
            throw new Error("No API key configured");
          }

          if (uploadedFiles.length === 0) {
            throw new Error("No documents to process");
          }

          // Call the API
          const response = await processDocuments({
            documents: uploadedFiles,
            apiKey,
            provider: "openai",
          });

          // Update the store with processed documents
          set({
            uploadedFiles: response.documents.map((doc) => ({
              ...doc,
              id: doc.id,
              name: doc.name,
              size: doc.size,
              type: doc.type,
              content: doc.summary,
            })),
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof APIError
              ? error.message
              : "Failed to process documents";

          set({
            error: errorMessage,
            loading: false,
          });
        }
      },
    }),
    {
      name: "rag-store",
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        tempApiKeys: state.tempApiKeys,
      }),
    }
  )
);
