"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Bot, User, Send } from "lucide-react";
import { Message } from "@/lib/types";
import { Input } from "./ui/input";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

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
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {message.content || ""}
                      </p>
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
