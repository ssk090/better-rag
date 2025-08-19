"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, File, X } from "lucide-react";
import { UploadedFile } from "@/lib/types";
import { formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (fileId: string) => void;
}

export function FileUpload({
  uploadedFiles,
  onFileUpload,
  onDragOver,
  onDrop,
  onRemoveFile,
}: FileUploadProps) {
  const getFileIcon = (type: string) => {
    if (type.includes("pdf"))
      return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes("csv"))
      return <FileText className="h-4 w-4 text-green-500" />;
    if (type.includes("text"))
      return <FileText className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="flex-1 mb-4 space-y-4">
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/40 transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-medium mb-2">Upload sources</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag & drop or{" "}
          <label
            htmlFor="file-upload"
            className="text-primary hover:underline cursor-pointer"
          >
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
          onChange={onFileUpload}
          className="hidden"
          id="file-upload"
          accept=".pdf,.txt,.md,.csv,.doc,.docx"
        />
      </div>

      {uploadedFiles.length > 0 && (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(file.id)}
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
  );
}
