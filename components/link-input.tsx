"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, Youtube, X } from "lucide-react";
import { isYouTubeUrl } from "@/lib/utils";

interface LinkInputProps {
  linkUrl: string;
  linkUrls: string[];
  onLinkUrlChange: (url: string) => void;
  onLinkKeyPress: (e: React.KeyboardEvent) => void;
  onRemoveLink: (index: number) => void;
}

export function LinkInput({
  linkUrl,
  linkUrls,
  onLinkUrlChange,
  onLinkKeyPress,
  onRemoveLink,
}: LinkInputProps) {
  return (
    <div className="flex-1 flex flex-col mb-4 space-y-4">
      <div className="space-y-2">
        <input
          type="url"
          placeholder="Enter URL and press Enter..."
          value={linkUrl}
          onChange={(e) => onLinkUrlChange(e.target.value)}
          onKeyPress={onLinkKeyPress}
          className="w-full p-3 border rounded-lg bg-background"
        />
      </div>

      {linkUrls.length > 0 && (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {linkUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
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
                  onClick={() => onRemoveLink(index)}
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
