"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { InputType, UploadedFile } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { LinkInput } from "./link-input";
import { YouTubeInput } from "./youtube-input";
import { TextInput } from "./text-input";
import { InputTypeSelector } from "./input-type-selector";
import { SourceCounter } from "./source-counter";

interface DocumentInputSectionProps {
  inputType: InputType;
  documentText: string;
  uploadedFiles: UploadedFile[];
  linkUrl: string;
  linkUrls: string[];
  youtubeUrl: string;
  youtubeUrls: string[];
  sourceLimit: number;
  onInputTypeChange: (type: InputType) => void;
  onDocumentTextChange: (text: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (fileId: string) => void;
  onLinkUrlChange: (url: string) => void;
  onLinkKeyPress: (e: React.KeyboardEvent) => void;
  onRemoveLink: (index: number) => void;
  onYoutubeUrlChange: (url: string) => void;
  onYoutubeKeyPress: (e: React.KeyboardEvent) => void;
  onRemoveYoutube: (index: number) => void;
  onDocumentSubmit: () => void;
}

export function DocumentInputSection({
  inputType,
  documentText,
  uploadedFiles,
  linkUrl,
  linkUrls,
  youtubeUrl,
  youtubeUrls,
  sourceLimit,
  onInputTypeChange,
  onDocumentTextChange,
  onFileUpload,
  onDragOver,
  onDrop,
  onRemoveFile,
  onLinkUrlChange,
  onLinkKeyPress,
  onRemoveLink,
  onYoutubeUrlChange,
  onYoutubeKeyPress,
  onRemoveYoutube,
  onDocumentSubmit,
}: DocumentInputSectionProps) {
  const getTotalSources = () => {
    let total = 0;
    if (documentText.trim()) total += 1;
    total += linkUrls.length;
    total += youtubeUrls.length;
    total += uploadedFiles.length;
    return total;
  };

  const canSubmit = () => {
    if (inputType === "text") return documentText.trim();
    if (inputType === "upload") return uploadedFiles.length > 0;
    return false;
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Add sources
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Sources let the AI base its responses on the information that matters
          most to you.
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          {inputType === "upload" && (
            <FileUpload
              uploadedFiles={uploadedFiles}
              onFileUpload={onFileUpload}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onRemoveFile={onRemoveFile}
            />
          )}

          {inputType === "link" && (
            <LinkInput
              linkUrl={linkUrl}
              linkUrls={linkUrls}
              onLinkUrlChange={onLinkUrlChange}
              onLinkKeyPress={onLinkKeyPress}
              onRemoveLink={onRemoveLink}
            />
          )}

          {inputType === "youtube" && (
            <YouTubeInput
              youtubeUrl={youtubeUrl}
              youtubeUrls={youtubeUrls}
              onYoutubeUrlChange={onYoutubeUrlChange}
              onYoutubeKeyPress={onYoutubeKeyPress}
              onRemoveYoutube={onRemoveYoutube}
            />
          )}

          {inputType === "text" && (
            <TextInput
              documentText={documentText}
              onDocumentTextChange={onDocumentTextChange}
            />
          )}
        </div>

        <div className="space-y-4 mt-auto">
          {(inputType === "upload" || inputType === "text") && (
            <Button
              onClick={onDocumentSubmit}
              disabled={!canSubmit()}
              className="w-full"
            >
              Add sources
            </Button>
          )}

          <InputTypeSelector
            inputType={inputType}
            onInputTypeChange={onInputTypeChange}
          />

          <SourceCounter
            totalSources={getTotalSources()}
            sourceLimit={sourceLimit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
