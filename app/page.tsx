"use client";

import { Toast } from "@/components/ui/toast";
import { ApiKeysDialog } from "@/components/api-keys-dialog";
import { DocumentInputSection } from "@/components/document-input-section";
import { ChatInterface } from "@/components/chat-interface";
import { useRAGApp } from "@/hooks/use-rag-app";

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
    youtubeUrls,
    showToast,
    toastMessage,
    apiKeys,
    isApiKeysDialogOpen,
    tempApiKeys,
    SOURCE_LIMIT,

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
    handleSendMessage,
    handleKeyPress,
    handleYoutubeKeyPress,
    removeYoutubeUrl,
    handleLinkKeyPress,
    removeLinkUrl,
  } = useRAGApp();

  const hasApiKeysValue = hasApiKeys();

  return (
    <div className="min-h-screen bg-background">
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="container mx-auto p-4 h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              RAG Application
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          <DocumentInputSection
            inputType={inputType}
            documentText={documentText}
            uploadedFiles={uploadedFiles}
            linkUrl={linkUrl}
            linkUrls={linkUrls}
            youtubeUrl={youtubeUrl}
            youtubeUrls={youtubeUrls}
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
            onRemoveYoutube={removeYoutubeUrl}
            onDocumentSubmit={handleDocumentSubmit}
          />

          <ChatInterface
            messages={messages}
            currentMessage={currentMessage}
            isDocumentSubmitted={isDocumentSubmitted}
            onCurrentMessageChange={setCurrentMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>
    </div>
  );
}
