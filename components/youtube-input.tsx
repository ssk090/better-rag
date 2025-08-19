"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Youtube, X } from "lucide-react";

interface YouTubeInputProps {
  youtubeUrl: string;
  youtubeUrls: string[];
  onYoutubeUrlChange: (url: string) => void;
  onYoutubeKeyPress: (e: React.KeyboardEvent) => void;
  onRemoveYoutube: (index: number) => void;
}

export function YouTubeInput({
  youtubeUrl,
  youtubeUrls,
  onYoutubeUrlChange,
  onYoutubeKeyPress,
  onRemoveYoutube,
}: YouTubeInputProps) {
  return (
    <div className="flex-1 flex flex-col mb-4 space-y-4">
      <div className="space-y-2">
        <input
          type="url"
          placeholder="Enter YouTube URL and press Enter..."
          value={youtubeUrl}
          onChange={(e) => onYoutubeUrlChange(e.target.value)}
          onKeyPress={onYoutubeKeyPress}
          className="w-full p-3 border rounded-lg bg-background"
        />
      </div>

      {youtubeUrls.length > 0 && (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {youtubeUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                <Youtube className="h-4 w-4 text-red-500" />
                <div className="flex-1 min-w-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium truncate hover:text-primary hover:underline cursor-pointer block"
                  >
                    {url}
                  </a>
                  <p className="text-xs text-muted-foreground">YouTube Video</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveYoutube(index)}
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
