"use client";

import { Button } from "@/components/ui/button";
import { Link, Youtube, Copy, Upload } from "lucide-react";
import { InputType } from "@/lib/types";

interface InputTypeSelectorProps {
  inputType: InputType;
  onInputTypeChange: (type: InputType) => void;
}

export function InputTypeSelector({
  inputType,
  onInputTypeChange,
}: InputTypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Button
        variant={inputType === "link" ? "default" : "outline"}
        onClick={() => onInputTypeChange("link")}
        className="flex items-center gap-2 h-12"
      >
        <Link className="h-4 w-4" />
        <span className="hidden sm:inline">Link</span>
      </Button>
      <Button
        variant={inputType === "youtube" ? "default" : "outline"}
        onClick={() => onInputTypeChange("youtube")}
        className="flex items-center gap-2 h-12"
      >
        <Youtube className="h-4 w-4" />
        <span className="hidden sm:inline">YouTube</span>
      </Button>
      <Button
        variant={inputType === "text" ? "default" : "outline"}
        onClick={() => onInputTypeChange("text")}
        className="flex items-center gap-2 h-12"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Paste text</span>
      </Button>
      <Button
        variant={inputType === "upload" ? "default" : "outline"}
        onClick={() => onInputTypeChange("upload")}
        className="flex items-center gap-2 h-12"
      >
        <Upload className="h-4 w-4" />
        <span className="hidden sm:inline">Upload</span>
      </Button>
    </div>
  );
}
