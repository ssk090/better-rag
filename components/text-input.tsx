"use client";

import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  documentText: string;
  onDocumentTextChange: (text: string) => void;
}

export function TextInput({
  documentText,
  onDocumentTextChange,
}: TextInputProps) {
  return (
    <div className="flex-1 mb-4">
      <Textarea
        placeholder="Paste your text here..."
        value={documentText}
        onChange={(e) => onDocumentTextChange(e.target.value)}
        className="h-full min-h-[200px] resize-none"
      />
    </div>
  );
}
