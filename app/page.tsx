"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Toast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Send,
  FileText,
  MessageCircle,
  Bot,
  User,
  Upload,
  File,
  X,
  Link,
  Copy,
  Youtube,
  Settings,
  Key,
} from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  content?: string
}

interface ApiKeys {
  openai: string
  anthropic: string
  groq: string
}

type InputType = "upload" | "link" | "text" | "youtube"

export default function RAGApplication() {
  const [documentText, setDocumentText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isDocumentSubmitted, setIsDocumentSubmitted] = useState(false)
  const [inputType, setInputType] = useState<InputType>("upload")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [linkUrl, setLinkUrl] = useState("")
  const [linkUrls, setLinkUrls] = useState<string[]>([])
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([])
  const SOURCE_LIMIT = 300
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    groq: "",
  })
  const [isApiKeysDialogOpen, setIsApiKeysDialogOpen] = useState(false)
  const [tempApiKeys, setTempApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    groq: "",
  })

  useEffect(() => {
    const savedKeys = localStorage.getItem("rag-api-keys")
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys)
      setApiKeys(parsedKeys)
      setTempApiKeys(parsedKeys)
    }
  }, [])

  const saveApiKeys = () => {
    setApiKeys(tempApiKeys)
    localStorage.setItem("rag-api-keys", JSON.stringify(tempApiKeys))
    setIsApiKeysDialogOpen(false)
    setToastMessage("API keys saved successfully!")
    setShowToast(true)
  }

  const hasApiKeys = () => {
    return apiKeys.openai || apiKeys.anthropic || apiKeys.groq
  }

  const parseUrls = (urlText: string): string[] => {
    return urlText
      .split(/[\s\n]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
  }

  const getTotalSources = () => {
    let total = 0
    if (documentText.trim()) total += 1
    total += linkUrls.length
    total += youtubeUrls.length
    total += uploadedFiles.length
    return total
  }

  const isYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleDocumentSubmit = () => {
    let hasContent = false
    const newMessages: Message[] = []

    if (inputType === "text" && documentText.trim()) {
      hasContent = true
      const textMessage: Message = {
        id: Date.now().toString(),
        content: `I've processed your text document (${documentText.split(" ").length} words). I'm ready to answer questions about this content.`,
        isUser: false,
        timestamp: new Date(),
      }
      newMessages.push(textMessage)
    } else if (inputType === "upload" && uploadedFiles.length > 0) {
      hasContent = true
      uploadedFiles.forEach((file, index) => {
        const fileMessage: Message = {
          id: (Date.now() + index).toString(),
          content: `I've processed "${file.name}" (${formatFileSize(file.size)}). I can now answer questions about this ${file.type.includes("pdf") ? "PDF" : file.type.includes("csv") ? "CSV" : "text"} file.`,
          isUser: false,
          timestamp: new Date(),
        }
        newMessages.push(fileMessage)
      })
    } else if (inputType === "link" && linkUrls.length > 0) {
      hasContent = true
      linkUrls.forEach((url, index) => {
        const isYoutube = isYouTubeUrl(url)
        const linkMessage: Message = {
          id: (Date.now() + index).toString(),
          content: `I've processed the ${isYoutube ? "YouTube video" : "website"}: ${url}. I can now answer questions about this content.`,
          isUser: false,
          timestamp: new Date(),
        }
        newMessages.push(linkMessage)
      })
    } else if (inputType === "youtube" && youtubeUrls.length > 0) {
      hasContent = true
      youtubeUrls.forEach((url, index) => {
        const youtubeMessage: Message = {
          id: (Date.now() + index).toString(),
          content: `I've processed the YouTube video: ${url}. I can now answer questions about this video content.`,
          isUser: false,
          timestamp: new Date(),
        }
        newMessages.push(youtubeMessage)
      })
    }

    if (hasContent) {
      setIsDocumentSubmitted(true)
      setToastMessage("Sources added successfully!")
      setShowToast(true)

      newMessages.forEach((message, index) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, message])
        }, index * 500) // 500ms delay between each message
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target?.result as string,
        }
        setUploadedFiles((prev) => [...prev, newFile])
      }
      reader.readAsText(file)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files) {
      const event = { target: { files } } as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(event)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />
    if (type.includes("csv")) return <FileText className="h-4 w-4 text-green-500" />
    if (type.includes("text")) return <FileText className="h-4 w-4 text-blue-500" />
    return <File className="h-4 w-4 text-gray-500" />
  }

  const handleSendMessage = () => {
    if (currentMessage.trim() && isDocumentSubmitted) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: currentMessage,
        isUser: true,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Based on the sources you provided, I can help answer questions about the content. This is a simulated response - in a real RAG application, this would be generated using the source context and your question: "${currentMessage}"`,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1000)

      setCurrentMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleYoutubeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && youtubeUrl.trim()) {
      e.preventDefault()
      const trimmedUrl = youtubeUrl.trim()
      if (isYouTubeUrl(trimmedUrl)) {
        if (!youtubeUrls.includes(trimmedUrl)) {
          setYoutubeUrls((prev) => [...prev, trimmedUrl])
          setYoutubeUrl("")

          const youtubeMessage: Message = {
            id: Date.now().toString(),
            content: `I've processed the YouTube video: ${trimmedUrl}. I can now answer questions about this video content.`,
            isUser: false,
            timestamp: new Date(),
          }

          setTimeout(() => {
            setMessages((prev) => [...prev, youtubeMessage])
            setIsDocumentSubmitted(true)
            setToastMessage("YouTube source added successfully!")
            setShowToast(true)
          }, 300)
        } else {
          setYoutubeUrl("")
        }
      }
    }
  }

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleLinkKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && linkUrl.trim()) {
      e.preventDefault()
      const trimmedUrl = linkUrl.trim()
      if (isValidUrl(trimmedUrl)) {
        if (!linkUrls.includes(trimmedUrl)) {
          setLinkUrls((prev) => [...prev, trimmedUrl])
          setLinkUrl("")

          const isYoutube = isYouTubeUrl(trimmedUrl)
          const linkMessage: Message = {
            id: Date.now().toString(),
            content: `I've processed the ${isYoutube ? "YouTube video" : "website"}: ${trimmedUrl}. I can now answer questions about this content.`,
            isUser: false,
            timestamp: new Date(),
          }

          setTimeout(() => {
            setMessages((prev) => [...prev, linkMessage])
            setIsDocumentSubmitted(true)
            setToastMessage("Link source added successfully!")
            setShowToast(true)
          }, 300)
        } else {
          setLinkUrl("")
        }
      }
    }
  }

  const removeLinkUrl = (index: number) => {
    setLinkUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      {showToast && <Toast message={toastMessage} type="success" onClose={() => setShowToast(false)} />}

      <div className="container mx-auto p-4 h-screen">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">RAG Application</h1>
            <p className="text-sm text-muted-foreground mt-2">Add sources and start asking questions</p>
          </div>

          <Dialog open={isApiKeysDialogOpen} onOpenChange={setIsApiKeysDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
                {hasApiKeys() && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configure API Keys
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Enter your API keys to enable AI-powered responses. Keys are stored locally in your browser.
                </p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="openai-key" className="text-sm font-medium">
                    OpenAI API Key
                  </label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={tempApiKeys.openai}
                    onChange={(e) => setTempApiKeys((prev) => ({ ...prev, openai: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="anthropic-key" className="text-sm font-medium">
                    Anthropic API Key
                  </label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={tempApiKeys.anthropic}
                    onChange={(e) => setTempApiKeys((prev) => ({ ...prev, anthropic: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="groq-key" className="text-sm font-medium">
                    Groq API Key
                  </label>
                  <Input
                    id="groq-key"
                    type="password"
                    placeholder="gsk_..."
                    value={tempApiKeys.groq}
                    onChange={(e) => setTempApiKeys((prev) => ({ ...prev, groq: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApiKeysDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveApiKeys}>Save Keys</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* Document Input Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Add sources
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Sources let the AI base its responses on the information that matters most to you.
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                {inputType === "upload" && (
                  <div className="flex-1 mb-4 space-y-4">
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/40 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-medium mb-2">Upload sources</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag & drop or{" "}
                        <label htmlFor="file-upload" className="text-primary hover:underline cursor-pointer">
                          choose file
                        </label>{" "}
                        to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported file types: PDF, .txt, Markdown, CSV, and more
                      </p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.txt,.md,.csv,.doc,.docx"
                      />
                    </div>

                    {uploadedFiles.length > 0 && (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                              {getFileIcon(file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.id)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                {inputType === "link" && (
                  <div className="flex-1 flex flex-col mb-4 space-y-4">
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="Enter URL and press Enter..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyPress={handleLinkKeyPress}
                        className="w-full p-3 border rounded-lg bg-background"
                      />
                    </div>

                    {linkUrls.length > 0 && (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {linkUrls.map((url, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                              {isYouTubeUrl(url) ? (
                                <Youtube className="h-4 w-4 text-red-500" />
                              ) : (
                                <Link className="h-4 w-4 text-blue-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium truncate hover:text-primary hover:underline cursor-pointer block"
                                >
                                  {url}
                                </a>
                                <p className="text-xs text-muted-foreground">
                                  {isYouTubeUrl(url) ? "YouTube Video" : "Website"}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLinkUrl(index)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                {inputType === "youtube" && (
                  <div className="flex-1 flex flex-col mb-4 space-y-4">
                    <div className="space-y-2">
                      <input
                        type="url"
                        placeholder="Enter YouTube URL and press Enter..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        onKeyPress={handleYoutubeKeyPress}
                        className="w-full p-3 border rounded-lg bg-background"
                      />
                    </div>

                    {youtubeUrls.length > 0 && (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {youtubeUrls.map((url, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                              <Youtube className="h-4 w-4 text-red-500" />
                              <div className="flex-1 min-w-0">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-medium truncate hover:text-primary hover:underline cursor-pointer block"
                                >
                                  {url}
                                </a>
                                <p className="text-xs text-muted-foreground">YouTube Video</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeYoutubeUrl(index)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                )}

                {inputType === "text" && (
                  <div className="flex-1 mb-4">
                    <Textarea
                      placeholder="Paste your text here..."
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      className="h-full min-h-[200px] resize-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-auto">
                {(inputType === "upload" || inputType === "text") && (
                  <Button
                    onClick={handleDocumentSubmit}
                    disabled={
                      (inputType === "text" && !documentText.trim()) ||
                      (inputType === "upload" && uploadedFiles.length === 0)
                    }
                    className="w-full"
                  >
                    Add sources
                  </Button>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={inputType === "link" ? "default" : "outline"}
                    onClick={() => setInputType("link")}
                    className="flex items-center gap-2 h-12"
                  >
                    <Link className="h-4 w-4" />
                    <span className="hidden sm:inline">Link</span>
                  </Button>
                  <Button
                    variant={inputType === "youtube" ? "default" : "outline"}
                    onClick={() => setInputType("youtube")}
                    className="flex items-center gap-2 h-12"
                  >
                    <Youtube className="h-4 w-4" />
                    <span className="hidden sm:inline">YouTube</span>
                  </Button>
                  <Button
                    variant={inputType === "text" ? "default" : "outline"}
                    onClick={() => setInputType("text")}
                    className="flex items-center gap-2 h-12"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Paste text</span>
                  </Button>
                  <Button
                    variant={inputType === "upload" ? "default" : "outline"}
                    onClick={() => setInputType("upload")}
                    className="flex items-center gap-2 h-12"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Source limit
                    </div>
                    <span>
                      {getTotalSources()} / {SOURCE_LIMIT}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{
                        width: `${Math.min((getTotalSources() / SOURCE_LIMIT) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Interface Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4 h-[300px]">
                <div className="space-y-4 pr-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isDocumentSubmitted
                        ? "Start asking questions about your sources..."
                        : "Please add sources first to begin chatting"}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!message.isUser && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-accent text-accent-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isUser ? "bg-primary text-primary-foreground" : "bg-card border"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                        </div>

                        {message.isUser && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea
                  placeholder={isDocumentSubmitted ? "Ask a question about your sources..." : "Add sources first"}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isDocumentSubmitted}
                  className="flex-1 min-h-[60px] max-h-[120px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || !isDocumentSubmitted}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
