"use client";

import { Toast } from "@/components/ui/toast";
import { ApiKeysDialog } from "@/components/api-keys-dialog";
import { DocumentInputSection } from "@/components/document-input-section";
import { ChatInterface } from "@/components/chat-interface";
import { useRAGStore } from "@/lib/store";
import { X } from "lucide-react";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";

export default function RAGApplication() {
  const {
    // State
    documentText,
    messages,
    currentMessage,
    isDocumentSubmitted,
    inputType,
    uploadedFiles,
    linkUrl,
    linkUrls,
    youtubeUrl,
    youtubeTranscripts,
    showToast,
    toastMessage,
    apiKeys,
    isApiKeysDialogOpen,
    tempApiKeys,
    SOURCE_LIMIT,

    // New state properties
    loading,
    error,

    // Setters
    setDocumentText,
    setCurrentMessage,
    setInputType,
    setLinkUrl,
    setYoutubeUrl,
    setShowToast,
    setToastMessage,
    setIsApiKeysDialogOpen,
    setTempApiKeys,

    // Functions
    saveApiKeys,
    hasApiKeys,
    handleDocumentSubmit,
    handleFileUpload,
    handleDragOver,
    handleDrop,
    removeFile,
    clearAllSources,
    handleSendMessage,
    handleKeyPress,
    handleYoutubeKeyPress,
    removeYouTubeTranscript,
    handleLinkKeyPress,
    removeLinkUrl,

    // New AI functions
    askQuestionWithAI,
    processDocumentsWithAI,
    setLoading,
    setError,
  } = useRAGStore();

  const [mounted, setMounted] = useState(false);
  const [hasApiKeysValue, setHasApiKeysValue] = useState(false);
  const [clientShowToast, setClientShowToast] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [clientLoading, setClientLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasApiKeysValue(hasApiKeys());
    setClientShowToast(showToast);
    setClientError(error);
    setClientLoading(loading);
  }, [hasApiKeys, showToast, error, loading]);

  // Update client state when store state changes
  useEffect(() => {
    setClientShowToast(showToast);
  }, [showToast]);

  useEffect(() => {
    setClientError(error);
  }, [error]);

  useEffect(() => {
    setClientLoading(loading);
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      {mounted && clientShowToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {mounted && clientError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{clientError}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {mounted && clientLoading && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium">Processing with AI...</span>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 h-screen flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Better RAG
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Add sources and start asking questions
            </p>
          </div>

          <ApiKeysDialog
            isOpen={isApiKeysDialogOpen}
            onOpenChange={setIsApiKeysDialogOpen}
            tempApiKeys={tempApiKeys}
            onTempApiKeysChange={setTempApiKeys}
            onSave={saveApiKeys}
            hasApiKeys={hasApiKeysValue}
          />
        </div>

        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-6 min-h-0">
          <DocumentInputSection
            inputType={inputType}
            documentText={documentText}
            uploadedFiles={uploadedFiles}
            linkUrl={linkUrl}
            linkUrls={linkUrls}
            youtubeUrl={youtubeUrl}
            youtubeTranscripts={youtubeTranscripts}
            sourceLimit={SOURCE_LIMIT}
            onInputTypeChange={setInputType}
            onDocumentTextChange={setDocumentText}
            onFileUpload={handleFileUpload}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onRemoveFile={removeFile}
            onLinkUrlChange={setLinkUrl}
            onLinkKeyPress={handleLinkKeyPress}
            onRemoveLink={removeLinkUrl}
            onYoutubeUrlChange={setYoutubeUrl}
            onYoutubeKeyPress={handleYoutubeKeyPress}
            onRemoveTranscript={removeYouTubeTranscript}
            onDocumentSubmit={handleDocumentSubmit}
            onClearAllSources={clearAllSources}
            loading={loading}
          />

          <div className="flex flex-col">
            <ChatInterface
              messages={messages}
              currentMessage={currentMessage}
              isDocumentSubmitted={isDocumentSubmitted}
              loading={clientLoading}
              onCurrentMessageChange={setCurrentMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
            />
            <div className="lg:hidden">
              <Footer />
            </div>
          </div>
        </div>

        <div className="hidden lg:block mt-6">
          <Footer />
        </div>
      </div>
    </div>
  );
}
