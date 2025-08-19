"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, PlusIcon } from "lucide-react";
import { InputType, UploadedFile, YouTubeTranscript } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { LinkInput } from "./link-input";
import { YouTubeInput } from "./youtube-input";
import { TextInput } from "./text-input";
import { InputTypeSelector } from "./input-type-selector";
import { SourceCounter } from "./source-counter";
import { motion } from "motion/react";

interface DocumentInputSectionProps {
  inputType: InputType;
  documentText: string;
  uploadedFiles: UploadedFile[];
  linkUrl: string;
  linkUrls: string[];
  youtubeUrl: string;
  youtubeTranscripts: YouTubeTranscript[];
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
  onRemoveTranscript: (id: string) => void;
  onDocumentSubmit: () => void;
  onClearAllSources: () => void;
  loading?: boolean;
}

export function DocumentInputSection({
  inputType,
  documentText,
  uploadedFiles,
  linkUrl,
  linkUrls,
  youtubeUrl,
  youtubeTranscripts,
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
  onRemoveTranscript,
  onDocumentSubmit,
  onClearAllSources,
  loading,
}: DocumentInputSectionProps) {
  const getTotalSources = () => {
    let total = 0;
    if (documentText.trim()) total += 1;
    total += linkUrls.length;
    total += youtubeTranscripts.length;
    total += uploadedFiles.length;
    return total;
  };

  const canSubmit = () => {
    if (inputType === "text") return documentText.trim();
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Sources
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Sources let the AI base its responses on the information that
            matters most to you.
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
                youtubeTranscripts={youtubeTranscripts}
                onYoutubeUrlChange={onYoutubeUrlChange}
                onYoutubeKeyPress={onYoutubeKeyPress}
                onRemoveTranscript={onRemoveTranscript}
                loading={loading}
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
            {inputType === "text" && (
              <div className="flex items-center justify-between">
                <Button
                  onClick={onDocumentSubmit}
                  disabled={!canSubmit()}
                  className="w-full"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Sources
                </Button>
              </div>
            )}

            <InputTypeSelector
              inputType={inputType}
              onInputTypeChange={onInputTypeChange}
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <SourceCounter
                  totalSources={getTotalSources()}
                  sourceLimit={sourceLimit}
                />
              </div>
              {getTotalSources() > 0 && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12 text-red-500 hover:bg-destructive/10"
                  onClick={onClearAllSources}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
