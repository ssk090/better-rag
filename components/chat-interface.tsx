"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Bot, User, Send } from "lucide-react";
import { Message } from "@/lib/types";

interface ChatInterfaceProps {
  messages: Message[];
  currentMessage: string;
  isDocumentSubmitted: boolean;
  onCurrentMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function ChatInterface({
  messages,
  currentMessage,
  isDocumentSubmitted,
  onCurrentMessageChange,
  onSendMessage,
  onKeyPress,
}: ChatInterfaceProps) {
  return (
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
                  className={`flex gap-3 ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
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
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
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
            placeholder={
              isDocumentSubmitted
                ? "Ask a question about your sources..."
                : "Add sources first"
            }
            value={currentMessage}
            onChange={(e) => onCurrentMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
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
  );
}
