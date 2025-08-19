"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings, Key } from "lucide-react";
import { ApiKeys } from "@/lib/types";

interface ApiKeysDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempApiKeys: ApiKeys;
  onTempApiKeysChange: (keys: ApiKeys) => void;
  onSave: () => void;
  hasApiKeys: boolean;
}

export function ApiKeysDialog({
  isOpen,
  onOpenChange,
  tempApiKeys,
  onTempApiKeysChange,
  onSave,
  hasApiKeys,
}: ApiKeysDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">API Keys</span>
          {hasApiKeys && <div className="w-2 h-2 bg-green-500 rounded-full" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            BYOK (Bring Your Own Keys)
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Enter your API keys to enable AI-powered responses. Keys are stored
            locally in your browser.
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
              onChange={(e) =>
                onTempApiKeysChange({ ...tempApiKeys, openai: e.target.value })
              }
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
              onChange={(e) =>
                onTempApiKeysChange({
                  ...tempApiKeys,
                  anthropic: e.target.value,
                })
              }
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
              onChange={(e) =>
                onTempApiKeysChange({ ...tempApiKeys, groq: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Keys</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
