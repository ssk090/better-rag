"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Youtube, X, FileText, Play, Loader2 } from "lucide-react";
import { YouTubeTranscript } from "@/lib/types";

interface YouTubeInputProps {
  youtubeUrl: string;
  youtubeTranscripts: YouTubeTranscript[];
  onYoutubeUrlChange: (url: string) => void;
  onYoutubeKeyPress: (e: React.KeyboardEvent) => void;
  onRemoveTranscript: (id: string) => void;
  loading?: boolean;
}

export function YouTubeInput({
  youtubeUrl,
  youtubeTranscripts,
  onYoutubeUrlChange,
  onYoutubeKeyPress,
  onRemoveTranscript,
  loading = false,
}: YouTubeInputProps) {
  return (
    <div className="flex-1 flex flex-col mb-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="Enter YouTube URL and press Enter to extract transcript..."
            value={youtubeUrl}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            onKeyDown={onYoutubeKeyPress}
            className="flex-1 p-3 border rounded-lg bg-background"
            disabled={loading}
          />
          {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to extract the video transcript. This may take a few
          moments.
        </p>
      </div>

      {youtubeTranscripts.length > 0 && (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {youtubeTranscripts.map((transcript) => (
              <div
                key={transcript.id}
                className="flex flex-col gap-3 p-4 border rounded-lg bg-card"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Youtube className="h-5 w-5 text-red-500 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <a
                        href={transcript.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:text-primary hover:underline cursor-pointer"
                      >
                        {transcript.title || "YouTube Video"}
                      </a>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>
                          {transcript.transcript.split(" ").length} words
                        </span>
                      </div>
                    </div>

                    {transcript.metadata.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Play className="h-3 w-3" />
                        <span>
                          {Math.round(transcript.metadata.duration / 60)} min
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <p>Language: {transcript.metadata.language}</p>
                      <p>Video ID: {transcript.metadata.videoId}</p>
                      {transcript.metadata.uploadDate && (
                        <p>
                          Uploaded:{" "}
                          {new Date(
                            transcript.metadata.uploadDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTranscript(transcript.id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-2">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary">
                      View Transcript Preview
                    </summary>
                    <div className="mt-2 p-3 bg-muted/50 rounded text-sm max-h-32 overflow-y-auto">
                      <p className="text-muted-foreground">
                        {transcript.transcript.length > 300
                          ? `${transcript.transcript.substring(0, 300)}...`
                          : transcript.transcript}
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
