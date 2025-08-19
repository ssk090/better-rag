"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Bot, User, Send, Copy, Check } from "lucide-react";
import { Message } from "@/lib/types";
import { Input } from "./ui/input";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Custom Code Block Component with Copy Button
function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  // Enhanced language detection for better syntax highlighting
  const getLanguage = (className?: string) => {
    if (!className) return "text";

    const lang = className.replace("language-", "");

    // Map common language identifiers to syntax highlighter languages
    const languageMap: { [key: string]: string } = {
      // Shell and terminal commands
      bash: "bash",
      shell: "bash",
      sh: "bash",
      zsh: "bash",
      fish: "bash",
      powershell: "powershell",
      ps1: "powershell",
      cmd: "batch",
      batch: "batch",

      // Programming languages
      python: "python",
      py: "python",
      javascript: "javascript",
      js: "javascript",
      typescript: "typescript",
      ts: "typescript",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rust: "rust",
      php: "php",
      ruby: "ruby",
      swift: "swift",
      kotlin: "kotlin",
      scala: "scala",

      // Web technologies
      html: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      jsx: "jsx",
      tsx: "tsx",
      vue: "vue",

      // Data formats
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      toml: "toml",
      ini: "ini",
      sql: "sql",

      // Configuration files
      dockerfile: "dockerfile",
      docker: "dockerfile",
      nginx: "nginx",
      apache: "apache",
      gitignore: "gitignore",

      // Default fallback
      text: "text",
      plaintext: "text",
    };

    return languageMap[lang] || "text";
  };

  const language = getLanguage(className);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800/80 hover:bg-gray-700/80 text-white border-0"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Language indicator */}
      {language !== "text" && (
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-1 text-xs font-mono text-gray-300 bg-gray-800/80 rounded">
            {language}
          </span>
        </div>
      )}

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          paddingTop: language !== "text" ? "2.5rem" : "1rem",
        }}
        showLineNumbers={language !== "text"}
        wrapLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

interface ChatInterfaceProps {
  messages: Message[];
  currentMessage: string;
  isDocumentSubmitted: boolean;
  loading: boolean;
  onCurrentMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function ChatInterface({
  messages,
  currentMessage,
  isDocumentSubmitted,
  loading,
  onCurrentMessageChange,
  onSendMessage,
  onKeyPress,
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Interface
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Ask questions about your sources to get answers.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-[calc(100vh-400px)] mb-4"
          >
            <div className="space-y-4 pr-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 italic opacity-30">
                  {isDocumentSubmitted
                    ? "Start asking questions about your sources..."
                    : "Please add sources first to begin chatting"}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!message.isUser && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border"
                      }`}
                    >
                      {message.isUser ? (
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {message.content || ""}
                        </p>
                      ) : (
                        <div className="chat-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom styling for code blocks
                              code: ({
                                inline,
                                className,
                                children,
                                ...props
                              }: any) => {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline ? (
                                  <CodeBlock className={className}>
                                    {children}
                                  </CodeBlock>
                                ) : (
                                  <code
                                    className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              // Custom styling for links
                              a: ({ children, href, ...props }: any) => (
                                <a
                                  href={href}
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                              // Custom styling for blockquotes
                              blockquote: ({ children, ...props }: any) => (
                                <blockquote
                                  className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400"
                                  {...props}
                                >
                                  {children}
                                </blockquote>
                              ),
                              // Custom styling for lists
                              ul: ({ children, ...props }: any) => (
                                <ul
                                  className="list-disc list-inside space-y-1"
                                  {...props}
                                >
                                  {children}
                                </ul>
                              ),
                              ol: ({ children, ...props }: any) => (
                                <ol
                                  className="list-decimal list-inside space-y-1"
                                  {...props}
                                >
                                  {children}
                                </ol>
                              ),
                            }}
                          >
                            {message.content || ""}
                          </ReactMarkdown>
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.isUser && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
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
            <Input
              placeholder={
                isDocumentSubmitted
                  ? "Ask a question about your sources..."
                  : "Add sources first"
              }
              value={currentMessage}
              onChange={(e) => onCurrentMessageChange(e.target.value)}
              onKeyDown={onKeyPress}
              disabled={!isDocumentSubmitted}
              className="flex-1 min-h-[60px] max-h-[120px]"
            />
            <Button
              onClick={onSendMessage}
              disabled={!currentMessage.trim() || !isDocumentSubmitted}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
