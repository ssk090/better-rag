"use client";

import { useState, useEffect } from "react";
import { Message, UploadedFile, ApiKeys, InputType } from "@/lib/types";
import { isYouTubeUrl, isValidUrl } from "@/lib/utils";

export function useRAGApp() {
  const [documentText, setDocumentText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isDocumentSubmitted, setIsDocumentSubmitted] = useState(false);
  const [inputType, setInputType] = useState<InputType>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkUrls, setLinkUrls] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    groq: "",
  });
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false);
  const [tempApiKeys, setTempApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    groq: "",
  });

  const SOURCE_LIMIT = 300;

  useEffect(() => {
    const savedKeys = localStorage.getItem("rag-api-keys");
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys);
      setApiKeys(parsedKeys);
      setTempApiKeys(parsedKeys);
    }
  }, []);

  const saveApiKeys = () => {
    setApiKeys(tempApiKeys);
    localStorage.setItem("rag-api-keys", JSON.stringify(tempApiKeys));
    setIsApiKeysDialogOpen(false);
    setToastMessage("API keys saved successfully!");
    setShowToast(true);
  };

  const hasApiKeys = () => {
    return !!(apiKeys.openai || apiKeys.anthropic || apiKeys.groq);
  };

  const handleDocumentSubmit = () => {
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
      setIsDocumentSubmitted(true);
      setToastMessage("Sources added successfully!");
      setShowToast(true);

      newMessages.forEach((message, index) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, message]);
        }, index * 500);
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target?.result as string,
        };
        setUploadedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      const event = {
        target: { files },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() && isDocumentSubmitted) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: currentMessage,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Based on the sources you provided, I can help answer questions about the content. This is a simulated response - in a real RAG application, this would be generated using the source context and your question: "${currentMessage}"`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);

      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleYoutubeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && youtubeUrl.trim()) {
      e.preventDefault();
      const trimmedUrl = youtubeUrl.trim();
      if (isYouTubeUrl(trimmedUrl)) {
        if (!youtubeUrls.includes(trimmedUrl)) {
          setYoutubeUrls((prev) => [...prev, trimmedUrl]);
          setYoutubeUrl("");

          const youtubeMessage: Message = {
            id: Date.now().toString(),
            content: `I've processed the YouTube video: ${trimmedUrl}. I can now answer questions about this video content.`,
            isUser: false,
            timestamp: new Date(),
          };

          setTimeout(() => {
            setMessages((prev) => [...prev, youtubeMessage]);
            setIsDocumentSubmitted(true);
            setToastMessage("YouTube source added successfully!");
            setShowToast(true);
          }, 300);
        } else {
          setYoutubeUrl("");
        }
      }
    }
  };

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLinkKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && linkUrl.trim()) {
      e.preventDefault();
      const trimmedUrl = linkUrl.trim();
      if (isValidUrl(trimmedUrl)) {
        if (!linkUrls.includes(trimmedUrl)) {
          setLinkUrls((prev) => [...prev, trimmedUrl]);
          setLinkUrl("");

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
            setMessages((prev) => [...prev, linkMessage]);
            setIsDocumentSubmitted(true);
            setToastMessage("Link source added successfully!");
            setShowToast(true);
          }, 300);
        } else {
          setLinkUrl("");
        }
      }
    }
  };

  const removeLinkUrl = (index: number) => {
    setLinkUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return {
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
  };
}
